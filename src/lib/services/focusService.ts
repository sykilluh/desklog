import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";

export async function createFocusLog(
  userId: number,
  focusDuration: number,
  audioPresetName?: string,
  challengeId?: number
) {
  if (!Number.isFinite(focusDuration) || focusDuration <= 0) {
    throw new ServiceError("집중 시간이 올바르지 않습니다.", 400);
  }

  return prisma.focusLog.create({
    data: {
      userId,
      focusDuration: Math.round(focusDuration),
      audioPresetName,
      challengeId,
    },
  });
}

export async function getTodayFocusSeconds(userId: number) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const logs = await prisma.focusLog.findMany({
    where: { userId, createdAt: { gte: startOfDay } },
    select: { focusDuration: true },
  });

  return logs.reduce((sum, log) => sum + log.focusDuration, 0);
}

export async function getTotalFocusSeconds(userId: number) {
  const result = await prisma.focusLog.aggregate({
    where: { userId },
    _sum: { focusDuration: true },
  });

  return result._sum.focusDuration ?? 0;
}

/** Daily totals (local calendar days) for the last `days` days, oldest first — feeds the records-modal bar graph. */
export async function getDailyFocusSeconds(userId: number, days: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const logs = await prisma.focusLog.findMany({
    where: { userId, createdAt: { gte: start } },
    select: { focusDuration: true, createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const log of logs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + log.focusDuration);
  }

  return Array.from(buckets.entries()).map(([date, seconds]) => ({ date, seconds }));
}

export async function getDailyGoalMinutes(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { dailyGoalMinutes: true } });
  return user?.dailyGoalMinutes ?? 60;
}

export async function setDailyGoalMinutes(userId: number, minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new ServiceError("목표 시간이 올바르지 않습니다.", 400);
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: { dailyGoalMinutes: Math.round(minutes) },
  });
  return user.dailyGoalMinutes;
}

/** Consecutive days (from today backwards) with any focus time logged.
 * `daily` must be oldest-first. Today reading 0 doesn't break the streak —
 * the day isn't over yet — it just doesn't extend it either. */
function computeStreakDays(daily: Array<{ date: string; seconds: number }>) {
  const newestFirst = [...daily].reverse();
  let streak = 0;
  let i = 0;
  if (newestFirst.length && newestFirst[0].seconds === 0) i = 1;
  for (; i < newestFirst.length; i++) {
    if (newestFirst[i].seconds > 0) streak++;
    else break;
  }
  return streak;
}

/** Weekly/monthly rollup for the analytics panel — average seconds/day over
 * the period, % of days meeting the daily goal, and the current
 * consecutive-day streak (looked back further than the period itself, so a
 * 7-day weekly view doesn't cap a longer streak at 7). */
export async function getFocusAnalytics(userId: number, periodDays: number) {
  const goalMinutes = await getDailyGoalMinutes(userId);
  const goalSeconds = goalMinutes * 60;

  const lookbackDays = Math.min(60, Math.max(periodDays, 60));
  const fullDaily = await getDailyFocusSeconds(userId, lookbackDays);
  const periodDaily = fullDaily.slice(-periodDays);

  const totalSeconds = periodDaily.reduce((sum, d) => sum + d.seconds, 0);
  const averageSeconds = periodDaily.length ? Math.round(totalSeconds / periodDaily.length) : 0;
  const goalMetDays = periodDaily.filter((d) => d.seconds >= goalSeconds).length;
  const goalAchievementRate = periodDaily.length ? Math.round((goalMetDays / periodDaily.length) * 100) : 0;
  const streakDays = computeStreakDays(fullDaily);

  return {
    daily: periodDaily,
    totalSeconds,
    averageSeconds,
    goalMinutes,
    goalAchievementRate,
    goalMetDays,
    periodDays: periodDaily.length,
    streakDays,
  };
}

export async function getMostUsedAudioPreset(userId: number) {
  const logs = await prisma.focusLog.groupBy({
    by: ["audioPresetName"],
    where: { userId, audioPresetName: { not: null } },
    _count: { audioPresetName: true },
    orderBy: { _count: { audioPresetName: "desc" } },
    take: 1,
  });

  return logs[0]?.audioPresetName ?? null;
}
