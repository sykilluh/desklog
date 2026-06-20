"use client";

import { useRef, useState } from "react";
import { domToPng } from "modern-screenshot";
import { useReviews } from "@/hooks/useReviews";
import StarRating from "@/components/review/StarRating";
import ReviewCard from "@/components/review/ReviewCard";
import type { BookReviewDTO } from "@/types/review";

export default function ReviewsPage() {
  const { reviews, isLoading, addReview, removeReview } = useReviews();
  const [bookTitle, setBookTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");
  const [shareTarget, setShareTarget] = useState<BookReviewDTO | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleSubmit() {
    const json = await addReview({ bookTitle, summary, review, rating });
    if (!json.ok) {
      setError(json.message);
      return;
    }
    setError("");
    setBookTitle("");
    setSummary("");
    setReview("");
    setRating(5);
  }

  async function handleShare(target: BookReviewDTO) {
    setShareTarget(target);
    setTimeout(async () => {
      if (!cardRef.current) return;
      const dataUrl = await domToPng(cardRef.current, { scale: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "book-review.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: target.bookTitle, text: "📚 DeskLog 독서 후기" });
        return;
      }
      const link = document.createElement("a");
      link.download = "book-review.png";
      link.href = dataUrl;
      link.click();
    }, 100);
  }

  return (
    <main className="min-h-screen p-6 text-[#5b4a52] sm:p-8">
      <a href="/" className="mb-4 inline-block text-sm text-[#a8889a]">
        ← 데스크로 돌아가기
      </a>
      <h1 className="mb-6 text-3xl text-[#ff6fa5]">⭐ 독서 후기 & 별점</h1>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-6 shadow-md backdrop-blur">
          <h2 className="mb-4 text-xl text-[#ff6fa5]">새 후기 작성</h2>
          <div className="space-y-3">
            <input
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="책 제목"
              className="w-full rounded-full border border-angel-pink-100 bg-white px-4 py-2.5 text-base placeholder:text-[#cdb8c4]"
            />
            <StarRating rating={rating} onChange={setRating} size={36} />
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="한 줄 요약"
              className="w-full rounded-full border border-angel-pink-100 bg-white px-4 py-2.5 text-base placeholder:text-[#cdb8c4]"
            />
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="자세한 후기를 적어보세요"
              rows={4}
              className="w-full rounded-2xl border border-angel-pink-100 bg-white px-4 py-3 text-base placeholder:text-[#cdb8c4]"
            />
            {error && <p className="text-sm text-strawberry-milk-400">{error}</p>}
            <button
              onClick={handleSubmit}
              className="w-full rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-5 py-3 text-lg font-bold text-white shadow"
            >
              💾 후기 저장
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading && <p className="text-[#a8889a]">불러오는 중...</p>}
          {!isLoading && reviews.length === 0 && (
            <p className="text-[#cdb8c4]">아직 작성한 후기가 없어요.</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-3xl border-2 border-white/70 bg-white/80 p-5 shadow-md">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#5b4a52]">📚 {r.bookTitle}</h3>
                <button onClick={() => removeReview(r.id)} className="text-sm text-[#cdb8c4]">
                  🗑️
                </button>
              </div>
              <StarRating rating={r.rating} readOnly size={24} />
              {r.summary && <p className="mt-2 text-sm text-[#a8889a]">📝 {r.summary}</p>}
              {r.review && <p className="mt-1 text-sm">{r.review}</p>}
              <button
                onClick={() => handleShare(r)}
                className="mt-3 rounded-full bg-gradient-to-r from-sky-blue-300 to-mint-300 px-4 py-2 text-sm font-bold text-white shadow"
              >
                📤 카드로 공유
              </button>
            </div>
          ))}
        </div>
      </div>

      {shareTarget && (
        <div className="fixed left-[-9999px] top-0">
          <ReviewCard ref={cardRef} review={shareTarget} />
        </div>
      )}
    </main>
  );
}
