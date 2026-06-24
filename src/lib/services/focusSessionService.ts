import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";
import type { FocusSession } from "@prisma/client";

/** API contract uses the same lowercase "pomodoro"/"stopwatch" the frontend's
 * TimerMode already uses, instead of leaking the Prisma enum's casing. */
export function serializeFocusSession(session: FocusSession) {
  return { ...session, mode: session.mode === "STOPWATCH" ? "stopwatch" : "pomodoro" };
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

  const session = await prisma.focusSession.update({
    where: { id },
    data: { totalSeconds: existing.totalSeconds + Math.round(addSeconds) },
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

export async function deleteFocusSession(userId: number, id: number) {
  const existing = await prisma.focusSession.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("기록을 찾을 수 없습니다.", 404);

  await prisma.focusSession.delete({ where: { id } });
}
