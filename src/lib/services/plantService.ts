import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";

function toDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function computeStreak(userId: number) {
  const waterings = await prisma.plantWatering.findMany({
    where: { userId },
    orderBy: { wateredDate: "desc" },
    select: { wateredDate: true },
  });

  const wateredDates = new Set(waterings.map((w) => w.wateredDate.getTime()));

  let streak = 0;
  const cursor = toDateOnly(new Date());

  while (wateredDates.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { streak, totalWaterings: waterings.length };
}

export async function waterPlantToday(userId: number) {
  const today = toDateOnly(new Date());

  const existing = await prisma.plantWatering.findUnique({
    where: { userId_wateredDate: { userId, wateredDate: today } },
  });
  if (existing) {
    throw new ServiceError("오늘은 이미 물을 줬어요. 내일 다시 와주세요!", 400);
  }

  await prisma.plantWatering.create({ data: { userId, wateredDate: today } });
  return getPlantStatus(userId);
}

export async function getPlantStatus(userId: number) {
  const today = toDateOnly(new Date());
  const { streak, totalWaterings } = await computeStreak(userId);

  const wateredToday = await prisma.plantWatering.findUnique({
    where: { userId_wateredDate: { userId, wateredDate: today } },
  });

  const stage = Math.min(4, Math.floor(streak / 7));

  const recentWaterings = await prisma.plantWatering.findMany({
    where: { userId },
    orderBy: { wateredDate: "desc" },
    take: 30,
    select: { wateredDate: true },
  });

  return {
    streak,
    totalWaterings,
    stage,
    wateredToday: Boolean(wateredToday),
    recentDates: recentWaterings.map((w) => w.wateredDate.toISOString().slice(0, 10)),
  };
}
