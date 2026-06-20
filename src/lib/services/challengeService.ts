import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";
import { computeDailyGoal, computeProgressRate, buildWeeklyMilestones } from "@/lib/scheduler";

interface CreateChallengeInput {
  title: string;
  totalPages: number;
  startDate: string;
  endDate: string;
}

function withDerivedFields<
  T extends { totalPages: number; currentPages: number; startDate: Date; endDate: Date }
>(challenge: T) {
  return {
    ...challenge,
    dailyGoal: computeDailyGoal(challenge.totalPages, challenge.currentPages, challenge.endDate),
    progressRate: computeProgressRate(challenge.totalPages, challenge.currentPages),
    weeklyMilestones: buildWeeklyMilestones(
      challenge.totalPages,
      challenge.currentPages,
      challenge.startDate,
      challenge.endDate
    ),
  };
}

export async function createChallenge(userId: number, input: CreateChallengeInput) {
  if (!input.title || !input.totalPages || !input.startDate || !input.endDate) {
    throw new ServiceError("챌린지 정보가 누락되었습니다.", 400);
  }
  if (new Date(input.endDate) <= new Date(input.startDate)) {
    throw new ServiceError("종료일은 시작일보다 이후여야 합니다.", 400);
  }

  const challenge = await prisma.challenge.create({
    data: {
      userId,
      title: input.title,
      totalPages: input.totalPages,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
    },
  });

  return withDerivedFields(challenge);
}

export async function listChallenges(userId: number) {
  const challenges = await prisma.challenge.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return challenges.map(withDerivedFields);
}

export async function updateChallengeProgress(userId: number, id: number, currentPages: number) {
  const existing = await prisma.challenge.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ServiceError("챌린지를 찾을 수 없습니다.", 404);
  }
  if (currentPages < 0 || currentPages > existing.totalPages * 1.2) {
    throw new ServiceError("진도율 값이 올바르지 않습니다.", 400);
  }

  const status = currentPages >= existing.totalPages ? "COMPLETED" : existing.status;

  const updated = await prisma.challenge.update({
    where: { id },
    data: { currentPages, status },
  });

  return withDerivedFields(updated);
}

interface UpdateChallengeInput {
  title?: string;
  totalPages?: number;
  startDate?: string;
  endDate?: string;
}

export async function updateChallenge(userId: number, id: number, input: UpdateChallengeInput) {
  const existing = await prisma.challenge.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ServiceError("챌린지를 찾을 수 없습니다.", 404);
  }

  const updated = await prisma.challenge.update({
    where: { id },
    data: {
      title: input.title,
      totalPages: input.totalPages,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    },
  });

  return withDerivedFields(updated);
}

export async function deleteChallenge(userId: number, id: number) {
  const existing = await prisma.challenge.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ServiceError("챌린지를 찾을 수 없습니다.", 404);
  }

  await prisma.challenge.delete({ where: { id } });
}
