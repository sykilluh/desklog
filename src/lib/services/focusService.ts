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
