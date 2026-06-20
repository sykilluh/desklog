"use client";

import { useState } from "react";
import { useChallenges } from "@/hooks/useChallenges";
import ProgressChart from "@/components/dashboard/ProgressChart";

export default function ChallengeScheduler() {
  const { challenges, isLoading, createChallenge, updateProgress } = useChallenges();
  const [title, setTitle] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    const json = await createChallenge({
      title,
      totalPages: Number(totalPages),
      startDate,
      endDate,
    });
    if (!json.ok) {
      setError(json.message);
      return;
    }
    setError("");
    setTitle("");
    setTotalPages("");
    setStartDate("");
    setEndDate("");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-zinc-900 p-5">
        <h2 className="mb-4 text-lg font-semibold">완독 챌린지 등록</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="책 제목"
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500"
          />
          <input
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            placeholder="총 페이지 수"
            type="number"
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500"
          />
          <input
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            type="date"
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-300"
          />
          <input
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            type="date"
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-300"
          />
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button
          onClick={handleSubmit}
          className="mt-4 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-900"
        >
          챌린지 등록
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && <p className="text-zinc-400">불러오는 중...</p>}
        {!isLoading && challenges.length === 0 && (
          <p className="text-zinc-500">등록된 챌린지가 없어요.</p>
        )}
        {challenges.map((challenge) => (
          <div key={challenge.id} className="rounded-xl bg-zinc-900 p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">{challenge.title}</h3>
              <span className="text-xs text-zinc-400">
                {challenge.currentPages}/{challenge.totalPages}p · 하루 목표 {challenge.dailyGoal}p
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${challenge.progressRate}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">{challenge.progressRate}% 진행</p>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                placeholder="읽은 페이지"
                className="w-32 rounded-md bg-zinc-800 px-2 py-1 text-xs placeholder:text-zinc-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateProgress(challenge.id, Number((e.target as HTMLInputElement).value));
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <span className="text-xs text-zinc-500">Enter로 진도 업데이트</span>
            </div>

            <div className="mt-4">
              <ProgressChart milestones={challenge.weeklyMilestones} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
