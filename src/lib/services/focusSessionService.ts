import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";
import type { FocusSession } from "@prisma/client";

/** API contract uses the same lowercase "pomodoro"/"stopwatch" the frontend's
 * TimerMode already uses, instead of leaking the Prisma enum's casing. */
export function serializeFocusSession(session: FocusSession) {
  return { ...session, mode: session.mode === "STOPWATCH" ? "stopwatch" : "pomodoro" };
}

/** "YYYY-MM-DD" for a Date's *local* calendar day — used as the canonical key
 * for SubjectDailyLog day-buckets, so that on a UTC+9 server "오늘" doesn't
 * silently store as UTC midnight (which reads back as yesterday). */
function localDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Inverse of localDateKey — a UTC-midnight Date whose ISO date slice always
 * round-trips back to the same key, regardless of server timezone. */
function dateKeyToStorageDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function listFocusSessions(userId: number) {
  const sessions = await prisma.focusSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return sessions.map(serializeFocusSession);
}

/** Next unused "timeN" label for a user who started measuring without typing
 * a name — scans existing time-prefixed names rather than counting all
 * sessions, so deleting timeN records doesn't immediately reuse their number. */
async function nextAutoName(userId: number) {
  const existing = await prisma.focusSession.findMany({
    where: { userId, name: { startsWith: "time" } },
    select: { name: true },
  });
  let maxN = 0;
  for (const { name } of existing) {
    const match = /^time(\d+)$/.exec(name);
    if (match) maxN = Math.max(maxN, Number(match[1]));
  }
  return `time${maxN + 1}`;
}

export async function createFocusSession(
  userId: number,
  name: string,
  mode: "pomodoro" | "stopwatch" = "pomodoro",
  preset?: { focusMinutes: number; breakMinutes: number }
) {
  const trimmed = name?.trim();
  const finalName = trimmed || (await nextAutoName(userId));

  const session = await prisma.focusSession.create({
    data: {
      userId,
      name: finalName,
      totalSeconds: 0,
      mode: mode === "stopwatch" ? "STOPWATCH" : "POMODORO",
      presetFocusMinutes: preset?.focusMinutes ?? 25,
      presetBreakMinutes: preset?.breakMinutes ?? 5,
    },
  });
  return serializeFocusSession(session);
}

/** Snapshots the live timer's position at the moment a record is stopped·저장
 * — pomodoro's remaining countdown (+ which phase, + the preset it was
 * running under) or the stopwatch's elapsed count — so resuming later can
 * restore the timer to exactly this position instead of a fresh start. */
export async function saveFocusSessionProgress(
  userId: number,
  id: number,
  data: { lastSeconds: number; lastPhase: "focus" | "break"; presetFocusMinutes: number; presetBreakMinutes: number }
) {
  const existing = await prisma.focusSession.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("기록을 찾을 수 없습니다.", 404);

  const session = await prisma.focusSession.update({
    where: { id },
    data: {
      lastSeconds: Math.max(0, Math.round(data.lastSeconds)),
      lastPhase: data.lastPhase,
      presetFocusMinutes: data.presetFocusMinutes,
      presetBreakMinutes: data.presetBreakMinutes,
    },
  });
  return serializeFocusSession(session);
}

export async function addFocusSessionSeconds(userId: number, id: number, addSeconds: number) {
  if (!Number.isFinite(addSeconds) || addSeconds <= 0) {
    throw new ServiceError("시간 값이 올바르지 않습니다.", 400);
  }

  const existing = await prisma.focusSession.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("기록을 찾을 수 없습니다.", 404);

  const rounded = Math.round(addSeconds);
  const session = await prisma.focusSession.update({
    where: { id },
    data: { totalSeconds: existing.totalSeconds + rounded },
  });

  // 이번에 막 쌓인 양(rounded)만 "오늘" 날짜에 그 과목(세션 이름) 누계로 더한다 —
  // 어제 "수학"을 30분 하고 오늘 또 "수학"을 이어해도 두 날짜가 따로 쌓이도록.
  const today = dateKeyToStorageDate(localDateKey(new Date()));
  await prisma.subjectDailyLog.upsert({
    where: { userId_subjectName_date: { userId, subjectName: existing.name, date: today } },
    update: { seconds: { increment: rounded } },
    create: { userId, subjectName: existing.name, date: today, seconds: rounded },
  });

  return serializeFocusSession(session);
}

export async function updateFocusSession(
  userId: number,
  id: number,
  data: Partial<{ name: string; isCompleted: boolean }>
) {
  const existing = await prisma.focusSession.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("기록을 찾을 수 없습니다.", 404);

  const session = await prisma.focusSession.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.isCompleted !== undefined ? { isCompleted: data.isCompleted } : {}),
    },
  });
  return serializeFocusSession(session);
}

/** All subjects (focus-session names) that have logged time in the given
 * calendar month, each with its day-by-day breakdown — feeds the diary's
 * "이 달의 과목별 기록" view so the same subject's daily totals can be seen
 * side by side as the month builds up. */
export async function getSubjectMonthlyLogs(userId: number, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const logs = await prisma.subjectDailyLog.findMany({
    where: { userId, date: { gte: start, lt: end } },
    orderBy: [{ subjectName: "asc" }, { date: "asc" }],
  });

  const bySubject = new Map<string, Array<{ date: string; seconds: number }>>();
  for (const log of logs) {
    const days = bySubject.get(log.subjectName) ?? [];
    days.push({ date: log.date.toISOString().slice(0, 10), seconds: log.seconds });
    bySubject.set(log.subjectName, days);
  }

  return Array.from(bySubject.entries())
    .map(([subjectName, days]) => ({
      subjectName,
      totalSeconds: days.reduce((sum, d) => sum + d.seconds, 0),
      days,
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds);
}

/** Overwrites a single day's logged seconds for a subject — lets the diary's
 * monthly view fix a mis-logged day (typo'd name, forgot to pause, etc.)
 * without having to delete/redo whole focus sessions. */
export async function setSubjectDailyLogSeconds(
  userId: number,
  subjectName: string,
  dateStr: string,
  seconds: number
) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new ServiceError("시간 값이 올바르지 않습니다.", 400);
  }
  const date = dateKeyToStorageDate(dateStr);

  const log = await prisma.subjectDailyLog.upsert({
    where: { userId_subjectName_date: { userId, subjectName, date } },
    update: { seconds: Math.round(seconds) },
    create: { userId, subjectName, date, seconds: Math.round(seconds) },
  });
  return log;
}

export async function deleteFocusSession(userId: number, id: number) {
  const existing = await prisma.focusSession.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("기록을 찾을 수 없습니다.", 404);

  await prisma.focusSession.delete({ where: { id } });
}
