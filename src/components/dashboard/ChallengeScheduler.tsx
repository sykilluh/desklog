"use client";

import { useState } from "react";
import { useChallenges } from "@/hooks/useChallenges";
import ProgressChart from "@/components/dashboard/ProgressChart";
import type { ChallengeDTO } from "@/types/challenge";

function ChallengeCard({
  challenge,
  onUpdateProgress,
  onUpdate,
  onDelete,
}: {
  challenge: ChallengeDTO;
  onUpdateProgress: (id: number, currentPages: number) => void;
  onUpdate: (id: number, input: { title: string; totalPages: number }) => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(challenge.title);
  const [totalPages, setTotalPages] = useState(String(challenge.totalPages));

  function handleSaveEdit() {
    onUpdate(challenge.id, { title, totalPages: Number(totalPages) });
    setIsEditing(false);
  }

  return (
    <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-5 shadow-md backdrop-blur">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        {isEditing ? (
          <div className="flex flex-1 gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-full border border-angel-pink-100 bg-white px-3 py-1 text-sm"
            />
            <input
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              type="number"
              className="w-24 rounded-full border border-angel-pink-100 bg-white px-3 py-1 text-sm"
            />
          </div>
        ) : (
          <h3 className="text-lg text-[#3a6e58]">📚 {challenge.title}</h3>
        )}
        <span className="text-xs text-[#a8889a]">
          {challenge.currentPages}/{challenge.totalPages}p · 하루 목표 {challenge.dailyGoal}p
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-mint-50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-mint-300 to-sky-blue-300 transition-all"
          style={{ width: `${challenge.progressRate}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-[#a8889a]">{challenge.progressRate}% 진행</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="number"
          placeholder="읽은 페이지"
          className="w-32 rounded-full border border-angel-pink-100 bg-white px-3 py-1 text-xs placeholder:text-[#cdb8c4]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdateProgress(challenge.id, Number((e.target as HTMLInputElement).value));
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
        <span className="text-xs text-[#cdb8c4]">Enter로 진도 업데이트</span>

        <div className="ml-auto flex gap-2">
          {isEditing ? (
            <button
              onClick={handleSaveEdit}
              className="rounded-full bg-mint-200 px-3 py-1 text-xs font-bold text-[#3a6e58]"
            >
              저장
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-sky-blue-100 px-3 py-1 text-xs font-bold text-[#3a8fb8]"
            >
              ✏️ 수정
            </button>
          )}
          <button
            onClick={() => onDelete(challenge.id)}
            className="rounded-full bg-strawberry-milk-100 px-3 py-1 text-xs font-bold text-[#a8533f]"
          >
            🗑️ 삭제
          </button>
        </div>
      </div>

      <div className="mt-4">
        <ProgressChart milestones={challenge.weeklyMilestones} />
      </div>
    </div>
  );
}

export default function ChallengeScheduler() {
  const { challenges, isLoading, createChallenge, updateProgress, updateChallenge, deleteChallenge } =
    useChallenges();
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
      <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-5 shadow-md backdrop-blur">
        <h2 className="mb-4 text-xl text-[#ff6fa5]">✏️ 완독 챌린지 등록</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="책 제목"
            className="rounded-full border border-angel-pink-100 bg-white px-4 py-2 text-sm text-[#5b4a52] placeholder:text-[#cdb8c4]"
          />
          <input
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            placeholder="총 페이지 수"
            type="number"
            className="rounded-full border border-angel-pink-100 bg-white px-4 py-2 text-sm text-[#5b4a52] placeholder:text-[#cdb8c4]"
          />
          <input
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            type="date"
            className="rounded-full border border-angel-pink-100 bg-white px-4 py-2 text-sm text-[#5b4a52]"
          />
          <input
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            type="date"
            className="rounded-full border border-angel-pink-100 bg-white px-4 py-2 text-sm text-[#5b4a52]"
          />
        </div>
        {error && <p className="mt-2 text-xs text-strawberry-milk-400">{error}</p>}
        <button
          onClick={handleSubmit}
          className="mt-4 rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-5 py-2 text-sm font-bold text-white shadow"
        >
          🌸 챌린지 등록
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && <p className="text-[#a8889a]">불러오는 중...</p>}
        {!isLoading && challenges.length === 0 && (
          <p className="text-[#cdb8c4]">등록된 챌린지가 없어요.</p>
        )}
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onUpdateProgress={updateProgress}
            onUpdate={updateChallenge}
            onDelete={deleteChallenge}
          />
        ))}
      </div>
    </div>
  );
}
