import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";

interface ReviewInput {
  bookTitle: string;
  summary?: string;
  review?: string;
  quote?: string;
  food?: string;
  music?: string;
  rating: number;
  showDuration?: boolean;
  showWeatherNote?: boolean;
  todayActivity?: string;
  durationMinutes?: number | null;
}

function validateRating(rating: number) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ServiceError("별점은 1~5 사이의 정수여야 합니다.", 400);
  }
}

export async function listReviews(userId: number) {
  return prisma.bookReview.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function createReview(userId: number, input: ReviewInput) {
  if (!input.bookTitle?.trim()) {
    throw new ServiceError("제목을 입력해주세요.", 400);
  }
  validateRating(input.rating);

  return prisma.bookReview.create({
    data: {
      userId,
      bookTitle: input.bookTitle.trim(),
      summary: input.summary,
      review: input.review,
      quote: input.quote,
      food: input.food,
      music: input.music,
      rating: input.rating,
      showDuration: input.showDuration ?? false,
      showWeatherNote: input.showWeatherNote ?? false,
      todayActivity: input.todayActivity,
      durationMinutes: input.durationMinutes ?? null,
    },
  });
}

export async function updateReview(userId: number, id: number, input: Partial<ReviewInput>) {
  const existing = await prisma.bookReview.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ServiceError("카드를 찾을 수 없습니다.", 404);
  }
  if (input.rating !== undefined) validateRating(input.rating);

  return prisma.bookReview.update({
    where: { id },
    data: {
      bookTitle: input.bookTitle,
      summary: input.summary,
      review: input.review,
      quote: input.quote,
      food: input.food,
      music: input.music,
      rating: input.rating,
      showDuration: input.showDuration,
      showWeatherNote: input.showWeatherNote,
      todayActivity: input.todayActivity,
      durationMinutes: input.durationMinutes,
    },
  });
}

export async function deleteReview(userId: number, id: number) {
  const existing = await prisma.bookReview.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ServiceError("카드를 찾을 수 없습니다.", 404);
  }
  await prisma.bookReview.delete({ where: { id } });
}
