"use client";

import { forwardRef } from "react";
import StarRating from "@/components/review/StarRating";
import { usePlaylist } from "@/components/providers/PlaylistProvider";
import { ASMR_PRESETS, weatherBlurb } from "@/lib/weatherAsmr";
import type { BookReviewDTO } from "@/types/review";

interface ReviewCardProps {
  review: BookReviewDTO;
  weatherCode?: number | null;
}

const ReviewCard = forwardRef<HTMLDivElement, ReviewCardProps>(({ review, weatherCode }, ref) => {
  const playlist = usePlaylist();
  const recommendedAsmr =
    weatherCode != null
      ? ASMR_PRESETS.find((p) => p.weatherCodes.includes(weatherCode)) ?? ASMR_PRESETS[3]
      : null;

  return (
    <div
      ref={ref}
      className="relative flex w-[340px] flex-col gap-3 rounded-sm border border-[#e3e2de] bg-[#ffffff] p-7 shadow-[0_18px_36px_rgba(40,32,28,0.16)]"
    >
      <span className="font-hand pointer-events-none absolute -right-3 -top-3 rotate-6 rounded-full bg-angel-pink-300 px-3 py-1 text-sm text-white shadow-sm">
        Today's Read
      </span>

      <p className="text-[11px] uppercase tracking-[0.2em] text-[#9c948b]">Reading Log</p>
      <h3 className="font-title text-2xl text-[#3a332e]">{review.bookTitle}</h3>
      <StarRating rating={review.rating} readOnly size={24} />

      {review.summary && (
        <p className="border-t border-dashed border-[#e3e2de] pt-3 text-sm text-[#3a332e]">{review.summary}</p>
      )}

      {review.review && <p className="text-sm leading-relaxed text-[#3a332e]">{review.review}</p>}

      {review.quote && (
        <blockquote className="font-hand rotate-[-1deg] rounded-sm bg-[#f8f4ee] p-3 text-lg leading-snug text-[#5c5650]">
          “{review.quote}”
        </blockquote>
      )}

      <div className="flex flex-wrap gap-1.5">
        {review.showDuration && review.durationMinutes != null && (
          <span className="rounded-full border border-mint-300 px-3 py-1 text-xs font-bold text-[#3f6f43]">
            총 독서시간 {review.durationMinutes}분
          </span>
        )}
        {review.todayActivity && (
          <span className="rounded-full border border-sky-blue-300 px-3 py-1 text-xs font-bold text-[#3c6577]">
            오늘 한 일: {review.todayActivity}
          </span>
        )}
        {playlist.currentVideoTitle && (
          <span className="rounded-full border border-angel-pink-300 px-3 py-1 text-xs font-bold text-[#e6709c]">
            듣고 있던 음악: {playlist.currentVideoTitle}
          </span>
        )}
        {recommendedAsmr && (
          <span className="rounded-full border border-strawberry-milk-300 px-3 py-1 text-xs font-bold text-[#e6709c]">
            {recommendedAsmr.emoji} 추천 ASMR: {recommendedAsmr.label}
          </span>
        )}
      </div>

      {review.showWeatherNote && weatherCode != null && (
        <p className="rounded-sm bg-[#f8f4ee] p-3 text-xs leading-relaxed text-[#3a332e]">
          {weatherBlurb(weatherCode)}
        </p>
      )}

      {(review.food || review.music) && (
        <div className="flex flex-col gap-2 rounded-sm bg-[#f8f4ee] p-3 text-sm text-[#3a332e]">
          {review.food && (
            <div className="flex items-center gap-2">
              <span className="font-hand shrink-0 text-base text-[#e6709c]">곁들임 —</span>
              <span className="truncate">{review.food}</span>
            </div>
          )}
          {review.music && (
            <div className="flex items-center gap-2">
              <span className="font-hand shrink-0 text-base text-[#3c6577]">추천 음악 —</span>
              <span className="truncate">{review.music}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-right text-xs text-[#b3a8ad]">
        {new Date(review.createdAt).toLocaleDateString("ko-KR")}
      </p>
    </div>
  );
});

ReviewCard.displayName = "ReviewCard";

export default ReviewCard;
