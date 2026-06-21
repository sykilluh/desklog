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
      className="flex w-[340px] flex-col gap-3 rounded-3xl border-4 border-white bg-gradient-to-br from-angel-pink-100 to-strawberry-milk-100 p-6 shadow-[0_18px_36px_rgba(168,136,154,0.35)]"
    >
      <p className="text-xs uppercase tracking-widest text-[#a8889a]">🩷 오늘의 독서 기록</p>
      <h3 className="text-xl font-bold text-[#5b4a52]">{review.bookTitle}</h3>
      <StarRating rating={review.rating} readOnly size={28} />

      {review.summary && (
        <p className="rounded-2xl bg-white/70 p-3 text-sm text-[#5b4a52]">📝 {review.summary}</p>
      )}

      {review.review && <p className="text-sm leading-relaxed text-[#5b4a52]">{review.review}</p>}

      {review.quote && (
        <blockquote className="rounded-2xl border-l-4 border-angel-pink-300 bg-white/60 p-3 text-sm italic text-[#7a5e6c]">
          “{review.quote}”
        </blockquote>
      )}

      <div className="flex flex-wrap gap-1.5">
        {review.showDuration && review.durationMinutes != null && (
          <span className="rounded-full bg-mint-100 px-3 py-1 text-xs font-bold text-[#3a6e58] shadow-sm">
            ⏱ 총 독서시간 {review.durationMinutes}분
          </span>
        )}
        {review.todayActivity && (
          <span className="rounded-full bg-sky-blue-100 px-3 py-1 text-xs font-bold text-[#2b6f8f] shadow-sm">
            ✅ 오늘 한 일: {review.todayActivity}
          </span>
        )}
        {playlist.currentVideoTitle && (
          <span className="rounded-full bg-angel-pink-100 px-3 py-1 text-xs font-bold text-[#a8576b] shadow-sm">
            🎵 지금 듣고 있는 음악: {playlist.currentVideoTitle}
          </span>
        )}
        {recommendedAsmr && (
          <span className="rounded-full bg-strawberry-milk-100 px-3 py-1 text-xs font-bold text-[#a8576b] shadow-sm">
            {recommendedAsmr.emoji} 오늘의 추천 ASMR: {recommendedAsmr.label}
          </span>
        )}
      </div>

      {review.showWeatherNote && weatherCode != null && (
        <p className="rounded-2xl bg-white/70 p-3 text-xs leading-relaxed text-[#5b4a52]">
          ☁️ {weatherBlurb(weatherCode)}
        </p>
      )}

      {(review.food || review.music) && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-3 text-sm text-[#5b4a52]">
          {review.food && (
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded-full bg-strawberry-milk-200 px-2 py-0.5 text-xs font-bold text-[#a8576b]">
                🍪 곁들임
              </span>
              <span className="truncate">{review.food}</span>
            </div>
          )}
          {review.music && (
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded-full bg-sky-blue-200 px-2 py-0.5 text-xs font-bold text-[#2b6f8f]">
                🎧 추천 음악
              </span>
              <span className="truncate">{review.music}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-right text-xs text-[#cdb8c4]">
        {new Date(review.createdAt).toLocaleDateString("ko-KR")}
      </p>
    </div>
  );
});

ReviewCard.displayName = "ReviewCard";

export default ReviewCard;
