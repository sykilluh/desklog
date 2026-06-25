"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { domToPng } from "modern-screenshot";
import { useReviews } from "@/hooks/useReviews";
import StarRating from "@/components/review/StarRating";
import ReviewCard from "@/components/review/ReviewCard";
import type { BookReviewDTO, BookReviewInput } from "@/types/review";

const EMPTY_FORM: BookReviewInput = {
  bookTitle: "",
  summary: "",
  review: "",
  quote: "",
  food: "",
  music: "",
  rating: 5,
  showDuration: false,
  showWeatherNote: false,
  todayActivity: "",
  durationMinutes: null,
};

export default function ReviewsPage() {
  const { reviews, isLoading, addReview, editReview, removeReview } = useReviews();
  const [form, setForm] = useState<BookReviewInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [shareTarget, setShareTarget] = useState<BookReviewDTO | null>(null);
  const [weatherCode, setWeatherCode] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const json = await res.json();
          setWeatherCode(json.current_weather.weathercode);
        } catch {
          // 날씨 정보를 못 가져와도 카드 작성/공유 자체는 계속 동작해야 함.
        }
      },
      () => {}
    );
  }, []);

  function updateField<K extends keyof BookReviewInput>(key: K, value: BookReviewInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(target: BookReviewDTO) {
    setEditingId(target.id);
    setForm({
      bookTitle: target.bookTitle,
      summary: target.summary ?? "",
      review: target.review ?? "",
      quote: target.quote ?? "",
      food: target.food ?? "",
      music: target.music ?? "",
      rating: target.rating,
      showDuration: target.showDuration,
      showWeatherNote: target.showWeatherNote,
      todayActivity: target.todayActivity ?? "",
      durationMinutes: target.durationMinutes,
    });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit() {
    const json = editingId !== null ? await editReview(editingId, form) : await addReview(form);
    if (!json.ok) {
      setError(json.message);
      return;
    }
    setError("");
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  async function handleShare(target: BookReviewDTO) {
    setShareTarget(target);
    setTimeout(async () => {
      if (!cardRef.current) return;
      const dataUrl = await domToPng(cardRef.current, { scale: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "desklog-card.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: target.bookTitle, text: "🩷 오늘의 독서 기록" });
        return;
      }
      const link = document.createElement("a");
      link.download = "desklog-card.png";
      link.href = dataUrl;
      link.click();
    }, 100);
  }

  return (
    <main className="min-h-screen p-6 text-[#3a332e] sm:p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-[#837a82]">
        ← 데스크로 돌아가기
      </Link>
      <h1 className="font-title mb-6 text-3xl text-[#d2658f]">⭐ 오늘의 독서 기록</h1>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-6 shadow-md shadow-angel-pink-100/40 backdrop-blur">
          <h2 className="mb-4 text-xl text-[#d2658f]">
            {editingId !== null ? "카드 수정" : "새 카드 작성"}
          </h2>
          <div className="space-y-3">
            <input
              value={form.bookTitle}
              onChange={(e) => updateField("bookTitle", e.target.value)}
              placeholder="책/활동 제목"
              className="w-full rounded-2xl border border-angel-pink-100 bg-white px-4 py-2.5 text-base placeholder:text-[#b3a8ad]"
            />
            <StarRating rating={form.rating} onChange={(r) => updateField("rating", r)} size={36} />
            <input
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="한 줄 요약"
              className="w-full rounded-2xl border border-angel-pink-100 bg-white px-4 py-2.5 text-base placeholder:text-[#b3a8ad]"
            />
            <textarea
              value={form.review}
              onChange={(e) => updateField("review", e.target.value)}
              placeholder="오늘의 소감 / 느낀점을 자유롭게 적어보세요"
              rows={4}
              className="w-full rounded-2xl border border-angel-pink-100 bg-white px-4 py-3 text-base placeholder:text-[#b3a8ad]"
            />
            <textarea
              value={form.quote}
              onChange={(e) => updateField("quote", e.target.value)}
              placeholder="좋았던 구절 (선택)"
              rows={2}
              className="w-full rounded-2xl border border-angel-pink-100 bg-white px-4 py-3 text-base placeholder:text-[#b3a8ad]"
            />
            <input
              value={form.todayActivity}
              onChange={(e) => updateField("todayActivity", e.target.value)}
              placeholder="오늘 한 일 (선택, 예: 독서 30분 + 산책)"
              className="w-full rounded-2xl border border-mint-100 bg-white px-4 py-2.5 text-base placeholder:text-[#b3a8ad]"
            />
            <input
              value={form.food}
              onChange={(e) => updateField("food", e.target.value)}
              placeholder="곁들이면 좋은 음식 (선택)"
              className="w-full rounded-2xl border border-strawberry-milk-100 bg-white px-4 py-2.5 text-base placeholder:text-[#b3a8ad]"
            />
            <input
              value={form.music}
              onChange={(e) => updateField("music", e.target.value)}
              placeholder="어울리는 음악 추천 (선택, 예: 곡명 - 아티스트)"
              className="w-full rounded-2xl border border-sky-blue-100 bg-white px-4 py-2.5 text-base placeholder:text-[#b3a8ad]"
            />

            <label className="flex items-center gap-2 rounded-2xl bg-mint-50 px-4 py-2.5 text-sm font-bold text-[#3f6f43]">
              <input
                type="checkbox"
                checked={form.showDuration ?? false}
                onChange={(e) => updateField("showDuration", e.target.checked)}
                className="h-4 w-4 accent-mint-300"
              />
              총 독서시간 표시 (선택 안 함)
            </label>
            {form.showDuration && (
              <input
                type="number"
                min={0}
                value={form.durationMinutes ?? ""}
                onChange={(e) =>
                  updateField("durationMinutes", e.target.value === "" ? null : Number(e.target.value))
                }
                placeholder="총 독서시간 (분)"
                className="w-full rounded-2xl border border-mint-100 bg-white px-4 py-2.5 text-base placeholder:text-[#b3a8ad]"
              />
            )}

            <label className="flex items-center gap-2 rounded-2xl bg-sky-blue-50 px-4 py-2.5 text-sm font-bold text-[#3c6577]">
              <input
                type="checkbox"
                checked={form.showWeatherNote ?? false}
                onChange={(e) => updateField("showWeatherNote", e.target.checked)}
                className="h-4 w-4 accent-sky-blue-300"
              />
              날씨 멘트 표시 (선택 안 함)
            </label>

            {error && <p className="text-sm text-strawberry-milk-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-2xl bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-5 py-3 text-lg font-bold text-white shadow shadow-angel-pink-300/40"
              >
                {editingId !== null ? "✏️ 수정 완료" : "💾 카드 저장"}
              </button>
              {editingId !== null && (
                <button
                  onClick={cancelEdit}
                  className="rounded-2xl bg-angel-pink-50 px-5 py-3 text-lg font-bold text-[#837a82]"
                >
                  수정 취소
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading && <p className="text-[#837a82]">불러오는 중...</p>}
          {!isLoading && reviews.length === 0 && (
            <p className="text-[#b3a8ad]">아직 작성한 카드가 없어요.</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-3xl border-2 border-white/70 bg-white/80 p-5 shadow-md shadow-angel-pink-100/40">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#3a332e]">📚 {r.bookTitle}</h3>
                <div className="flex items-center gap-2 text-sm text-[#b3a8ad]">
                  <button onClick={() => startEdit(r)} title="수정">
                    ✏️
                  </button>
                  <button onClick={() => removeReview(r.id)} title="삭제">
                    🗑️
                  </button>
                </div>
              </div>
              <StarRating rating={r.rating} readOnly size={24} />
              {r.summary && <p className="mt-2 text-sm text-[#837a82]">📝 {r.summary}</p>}
              {r.review && <p className="mt-1 text-sm">{r.review}</p>}
              {r.quote && <p className="mt-1 text-sm italic text-[#837a82]">“{r.quote}”</p>}
              {r.todayActivity && <p className="mt-1 text-xs text-[#3c6577]">✅ {r.todayActivity}</p>}
              {r.showDuration && r.durationMinutes != null && (
                <p className="mt-1 text-xs text-[#3f6f43]">⏱ {r.durationMinutes}분</p>
              )}
              {r.food && <p className="mt-1 text-xs text-[#e6709c]">🍪 {r.food}</p>}
              {r.music && <p className="mt-1 text-xs text-[#3c6577]">🎧 {r.music}</p>}
              <button
                onClick={() => handleShare(r)}
                className="mt-3 rounded-2xl bg-gradient-to-r from-sky-blue-300 to-mint-300 px-4 py-2 text-sm font-bold text-white shadow shadow-sky-blue-300/40"
              >
                📤 카드로 공유
              </button>
            </div>
          ))}
        </div>
      </div>

      {shareTarget && (
        <div className="fixed left-[-9999px] top-0">
          <ReviewCard ref={cardRef} review={shareTarget} weatherCode={weatherCode} />
        </div>
      )}
    </main>
  );
}
