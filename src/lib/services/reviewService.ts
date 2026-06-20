import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";

interface ReviewInput {
  bookTitle: string;
  summary?: string;
  review?: string;
  rating: number;
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
    throw new ServiceError("책 제목을 입력해주세요.", 400);
  }
  validateRating(input.rating);

  return prisma.bookReview.create({
    data: {
      userId,
      bookTitle: input.bookTitle.trim(),
      summary: input.summary,
      review: input.review,
      rating: input.rating,
    },
  });
}

export async function updateReview(userId: number, id: number, input: Partial<ReviewInput>) {
  const existing = await prisma.bookReview.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ServiceError("후기를 찾을 수 없습니다.", 404);
  }
  if (input.rating !== undefined) validateRating(input.rating);

  return prisma.bookReview.update({
    where: { id },
    data: {
      bookTitle: input.bookTitle,
      summary: input.summary,
      review: input.review,
      rating: input.rating,
    },
  });
}

export async function deleteReview(userId: number, id: number) {
  const existing = await prisma.bookReview.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ServiceError("후기를 찾을 수 없습니다.", 404);
  }
  await prisma.bookReview.delete({ where: { id } });
}
