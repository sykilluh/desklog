import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";
import type { DeskObjectInput } from "@/types/desk";

export async function getDeskObjects(userId: number) {
  return prisma.deskObject.findMany({
    where: { userId },
    orderBy: { id: "asc" },
  });
}

export async function saveDeskObjects(userId: number, objects: DeskObjectInput[]) {
  if (!Array.isArray(objects)) {
    throw new ServiceError("좌표 데이터가 누락되었습니다.", 400);
  }

  for (const obj of objects) {
    if (typeof obj.posX !== "number" || typeof obj.posY !== "number" || !obj.objectName) {
      throw new ServiceError("좌표 데이터가 누락되었습니다.", 400);
    }
    if (obj.posX < 0 || obj.posX > 100 || obj.posY < 0 || obj.posY > 100) {
      throw new ServiceError("좌표는 0~100(%) 범위여야 합니다.", 400);
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.deskObject.deleteMany({ where: { userId } });
    if (objects.length === 0) return [];
    await tx.deskObject.createMany({
      data: objects.map((obj) => ({
        userId,
        objectName: obj.objectName,
        posX: obj.posX,
        posY: obj.posY,
        isActive: obj.isActive ?? true,
        volume: obj.volume ?? 0.5,
      })),
    });
    return tx.deskObject.findMany({ where: { userId }, orderBy: { id: "asc" } });
  });
}

export async function patchDeskObject(
  userId: number,
  id: number,
  data: Partial<Pick<DeskObjectInput, "isActive" | "volume" | "posX" | "posY">>
) {
  const existing = await prisma.deskObject.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ServiceError("오브제를 찾을 수 없습니다.", 404);
  }

  return prisma.deskObject.update({
    where: { id },
    data,
  });
}
