import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";
import { ensureDemoUser } from "@/lib/services/userService";

export async function createFocusLog(
  userId: number,
  focusDuration: number,
  audioPresetName?: string,
  challengeId?: number
) {
  if (!Number.isFinite(focusDuration) || focusDuration <= 0) {
    throw new ServiceError("집중 시간이 올바르지 않습니다.", 400);
  }

  await ensureDemoUser();

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
