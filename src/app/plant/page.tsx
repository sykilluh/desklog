"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const GROWTH_STAGES = [
  { emoji: "🌱", label: "새싹" },
  { emoji: "🌿", label: "잎새" },
  { emoji: "🌷", label: "꽃봉오리" },
  { emoji: "🌳", label: "튼튼한 나무" },
  { emoji: "🌈🌸", label: "무지개 꽃 만개!" },
];

interface PlantStatus {
  streak: number;
  totalWaterings: number;
  stage: number;
  wateredToday: boolean;
  recentDates: string[];
}

function buildCalendarDays(recentDates: string[]) {
  const wateredSet = new Set(recentDates);
  const days: { date: string; watered: boolean }[] = [];
  const today = new Date();

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, watered: wateredSet.has(key) });
  }
  return days;
}

export default function PlantPage() {
  const [status, setStatus] = useState<PlantStatus | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/plant");
    const json = await res.json();
    if (json.ok) setStatus(json.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleWater() {
    const res = await fetch("/api/plant/water", { method: "POST" });
    const json = await res.json();
    if (json.ok) {
      setStatus(json.data);
      setMessage("오늘의 물주기 완료! 내일도 잊지 말아주세요 🌱");
    } else {
      setMessage(json.message);
    }
  }

  const stage = GROWTH_STAGES[status?.stage ?? 0];
  const calendarDays = buildCalendarDays(status?.recentDates ?? []);
  const daysToNextStage = status ? 7 - (status.streak % 7) : 7;

  return (
    <main className="min-h-screen p-6 text-[#3a332e] sm:p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-[#837a82] hover:text-[#3a332e]">
        ← 데스크로 돌아가기
      </Link>

      <div className="mx-auto max-w-md">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#9c948b]">Growth Log</p>
        <h1 className="font-title mb-8 text-4xl text-[#3a332e]">내 식물 키우기</h1>

        <div className="relative rounded-sm border border-[#e3e2de] bg-[#ffffff] p-8 text-center shadow-[0_18px_36px_rgba(40,32,28,0.12)]">
          <span className="font-hand absolute -left-3 -top-3 -rotate-6 rounded-full bg-mint-300 px-3 py-1 text-sm text-white shadow-sm">
            Day {status?.streak ?? 0}
          </span>
          <p className="mb-3 text-8xl">{stage.emoji}</p>
          <p className="font-hand text-3xl text-[#3f6f43]">{stage.label}</p>
          <p className="mt-2 text-sm text-[#837a82]">연속 {status?.streak ?? 0}일째 물 주는 중</p>
          {status && status.stage < 4 && (
            <p className="text-xs text-[#b3a8ad]">다음 단계까지 {daysToNextStage}일 남았어요</p>
          )}

          <button
            onClick={handleWater}
            disabled={status?.wateredToday}
            className="press-pop mt-6 rounded-full bg-mint-500 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-mint-600 disabled:opacity-50"
          >
            {status?.wateredToday ? "오늘은 물을 줬어요" : "오늘 물주기"}
          </button>
          {message && <p className="font-hand mt-3 text-base text-[#837a82]">{message}</p>}
        </div>

        <div className="mt-6 rounded-sm border border-[#e3e2de] bg-[#ffffff] p-6 shadow-sm">
          <p className="font-hand mb-3 text-xl text-[#3a332e]">last 28 days</p>
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day) => (
              <div
                key={day.date}
                title={day.date}
                className={`aspect-square rounded-sm ${day.watered ? "bg-mint-500" : "bg-[#eeeeec]"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
