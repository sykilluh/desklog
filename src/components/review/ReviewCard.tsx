"use client";

import { forwardRef } from "react";
import StarRating from "@/components/review/StarRating";
import type { BookReviewDTO } from "@/types/review";

const ReviewCard = forwardRef<HTMLDivElement, { review: BookReviewDTO }>(({ review }, ref) => {
  return (
    <div
      ref={ref}
      className="flex w-[340px] flex-col gap-3 rounded-3xl border-4 border-white bg-gradient-to-br from-angel-pink-100 to-strawberry-milk-100 p-6 shadow-xl"
    >
      <p className="text-xs uppercase tracking-widest text-[#a8889a]">🩷 DeskLog 독서 후기</p>
      <h3 className="text-xl font-bold text-[#5b4a52]">{review.bookTitle}</h3>
      <StarRating rating={review.rating} readOnly size={28} />
      {review.summary && (
        <p className="rounded-2xl bg-white/70 p-3 text-sm text-[#5b4a52]">📝 {review.summary}</p>
      )}
      {review.review && <p className="text-sm leading-relaxed text-[#5b4a52]">{review.review}</p>}
      <p className="text-right text-xs text-[#cdb8c4]">
        {new Date(review.createdAt).toLocaleDateString("ko-KR")}
      </p>
    </div>
  );
});

ReviewCard.displayName = "ReviewCard";

export default ReviewCard;
