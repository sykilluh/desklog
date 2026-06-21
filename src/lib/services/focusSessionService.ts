import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";

export async function listFocusSessions(userId: number) {
  return prisma.focusSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createFocusSession(userId: number, name: string) {
  if (!name || !name.trim()) {
    throw new ServiceError("이름을 입력해주세요.", 400);
  }

  return prisma.focusSession.create({
    data: { userId, name: name.trim(), totalSeconds: 0 },
  });
}

export async function addFocusSessionSeconds(userId: number, id: number, addSeconds: number) {
  if (!Number.isFinite(addSeconds) || addSeconds <= 0) {
    throw new ServiceError("시간 값이 올바르지 않습니다.", 400);
  }

  const existing = await prisma.focusSession.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("기록을 찾을 수 없습니다.", 404);

  return prisma.focusSession.update({
    where: { id },
    data: { totalSeconds: existing.totalSeconds + Math.round(addSeconds) },
  });
}

export async function updateFocusSession(
  userId: number,
  id: number,
  data: Partial<{ name: string; isCompleted: boolean }>
) {
  const existing = await prisma.focusSession.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("기록을 찾을 수 없습니다.", 404);

  return prisma.focusSession.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.isCompleted !== undefined ? { isCompleted: data.isCompleted } : {}),
    },
  });
}

export async function deleteFocusSession(userId: number, id: number) {
  const existing = await prisma.focusSession.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("기록을 찾을 수 없습니다.", 404);

  await prisma.focusSession.delete({ where: { id } });
}
