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
    <main className="min-h-screen p-6 text-[#5b4a52] sm:p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-[#a8889a]">
        ← 데스크로 돌아가기
      </Link>
      <h1 className="font-title mb-6 text-3xl text-[#3a6e58]">🌱 내 식물 키우기</h1>

      <div className="mx-auto max-w-md space-y-6">
        <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-8 text-center shadow-md backdrop-blur">
          <p className="mb-2 text-8xl">{stage.emoji}</p>
          <p className="text-xl text-[#3a6e58]">{stage.label}</p>
          <p className="mt-2 text-sm text-[#a8889a]">
            🔥 연속 {status?.streak ?? 0}일째 물 주는 중!
          </p>
          {status && status.stage < 4 && (
            <p className="text-xs text-[#cdb8c4]">다음 단계까지 {daysToNextStage}일 남았어요</p>
          )}

          <button
            onClick={handleWater}
            disabled={status?.wateredToday}
            className="mt-5 rounded-full bg-gradient-to-r from-mint-300 to-sky-blue-300 px-6 py-3 text-base font-bold text-white shadow disabled:opacity-50"
          >
            {status?.wateredToday ? "오늘은 물을 줬어요 💧" : "💧 오늘 물주기"}
          </button>
          {message && <p className="mt-3 text-xs text-[#a8889a]">{message}</p>}
        </div>

        <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-5 shadow-md backdrop-blur">
          <p className="mb-3 text-sm font-bold text-[#3a8fb8]">최근 28일 물주기 기록</p>
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day) => (
              <div
                key={day.date}
                title={day.date}
                className={`aspect-square rounded-lg ${
                  day.watered ? "bg-gradient-to-br from-mint-300 to-sky-blue-300" : "bg-angel-pink-50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
