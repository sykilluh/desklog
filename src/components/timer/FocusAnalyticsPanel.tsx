"use client";

import { useState } from "react";
import { useFocusAnalytics, type AnalyticsPeriod } from "@/hooks/useFocusAnalytics";

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  return `${m}분 ${s}초`;
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const MEDAL_EMOJI: Record<"gold" | "silver" | "bronze", string> = {
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

/**
 * 주간/월간 집중도 분석 — 평균 공부량과 목표 달성률을 기간별로 따로 보여주고,
 * 연속 학습일(스트릭)과 하루 단위 공부량 그래프로 "집중도"를 나타낸다.
 * FocusRecordsPanel의 14일 그래프와는 별개로, 7일/30일을 골라 볼 수 있는
 * 전용 분석 창.
 */
export default function FocusAnalyticsPanel() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("weekly");
  const { data, isLoading, setGoal } = useFocusAnalytics(period);
  const [goalInput, setGoalInput] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);

  function startEditGoal() {
    setGoalInput(String(data?.goalMinutes ?? 60));
    setEditingGoal(true);
  }

  async function commitGoal() {
    const minutes = Number(goalInput);
    if (Number.isFinite(minutes) && minutes > 0) await setGoal(minutes);
    setEditingGoal(false);
  }

  const maxSeconds = Math.max(1, ...(data?.daily.map((d) => d.seconds) ?? [1]));
  const goalSeconds = (data?.goalMinutes ?? 60) * 60;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e3e2de] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#e3e2de] px-6 py-4">
        <h2 className="font-title text-base text-[#3a332e]">집중도 분석</h2>
        <div className="flex shrink-0 gap-1 rounded-full bg-[#eeeeec] p-0.5">
          <button
            onClick={() => setPeriod("weekly")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              period === "weekly" ? "bg-white text-[#3c6577] shadow-sm" : "text-[#9c948b]"
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              period === "monthly" ? "bg-white text-[#3c6577] shadow-sm" : "text-[#9c948b]"
            }`}
          >
            월간
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading || !data ? (
          <p className="text-[#837a82]">불러오는 중...</p>
        ) : (
          <>
            {/* 핵심 지표: 평균 공부량 / 목표 달성률 / 연속 학습일 */}
            <div className="mb-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-sky-blue-50 px-2 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#7c93a0]">
                  {period === "weekly" ? "주간" : "월간"} 평균
                </p>
                <p className="mt-1 text-sm font-bold text-[#3c6577]">{formatDuration(data.averageSeconds)}</p>
              </div>
              <div className="rounded-2xl bg-mint-50 px-2 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#7fa087]">목표 달성률</p>
                <p className="mt-1 text-sm font-bold text-[#3f6f43]">
                  {data.goalAchievementRate}%
                  <span className="ml-1 text-[10px] font-normal text-[#7fa087]">
                    ({data.goalMetDays}/{data.periodDays}일)
                  </span>
                </p>
              </div>
              <div className="rounded-2xl bg-angel-pink-50 px-2 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#b3a8ad]">연속 학습</p>
                <p className="mt-1 text-sm font-bold text-[#d2658f]">🔥 {data.streakDays}일</p>
              </div>
            </div>

            {/* 목표 설정 */}
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#f2f2f0] px-4 py-2.5">
              {editingGoal ? (
                <div className="flex w-full items-center gap-2">
                  <span className="text-xs font-bold text-[#837a82]">하루 목표</span>
                  <input
                    autoFocus
                    type="number"
                    min={1}
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onBlur={commitGoal}
                    onKeyDown={(e) => e.key === "Enter" && commitGoal()}
                    className="w-16 rounded-full border border-angel-pink-200 bg-white px-2 py-0.5 text-sm"
                  />
                  <span className="text-xs font-bold text-[#837a82]">분</span>
                </div>
              ) : (
                <>
                  <span className="text-xs font-bold text-[#837a82]">🎯 하루 목표 {data.goalMinutes}분</span>
                  <button onClick={startEditGoal} className="text-xs font-bold text-[#d2658f] underline">
                    수정
                  </button>
                </>
              )}
            </div>

            {/* 주별 메달 — 목표 달성률 90%/70%/50% 이상이면 그 주는 금/은/동 수여 */}
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#b3a8ad]">주간 메달</p>
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {data.weeklyMedals.map((w) => (
                <div
                  key={w.weekStart}
                  title={`${formatDay(w.weekStart)}~${formatDay(w.weekEnd)} · 목표 달성률 ${w.achievementRate}%`}
                  className="flex shrink-0 flex-col items-center gap-0.5 rounded-2xl bg-[#f2f2f0] px-2.5 py-2"
                >
                  <span className="text-lg">{w.medal ? MEDAL_EMOJI[w.medal] : "—"}</span>
                  <span className="whitespace-nowrap text-[9px] text-[#b3a8ad]">{formatDay(w.weekStart)}</span>
                </div>
              ))}
            </div>

            {/* 하루 단위 공부량 — 집중도(얼마나 꾸준히/많이 공부했는지)를 한눈에 */}
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#b3a8ad]">
              {period === "weekly" ? "최근 7일" : "최근 30일"} 공부량
            </p>
            <div className="flex h-20 items-end gap-[3px]">
              {data.daily.map((d, i) => {
                const metGoal = d.seconds >= goalSeconds;
                const showLabel = period === "weekly" || i % 4 === 0;
                return (
                  <div key={d.date} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="relative flex h-16 w-full items-end justify-center">
                      <div
                        className={`w-full rounded-full transition-colors ${
                          metGoal ? "bg-mint-300 group-hover:bg-mint-400" : "bg-sky-blue-200 group-hover:bg-sky-blue-400"
                        }`}
                        style={{ height: `${Math.max(6, (d.seconds / maxSeconds) * 100)}%` }}
                      />
                      {d.seconds > 0 && (
                        <span className="pointer-events-none absolute -top-5 whitespace-nowrap rounded-full bg-[#3a332e] px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {formatDuration(d.seconds)}
                        </span>
                      )}
                    </div>
                    {showLabel && <span className="text-[9px] text-[#b3a8ad]">{formatDay(d.date)}</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
