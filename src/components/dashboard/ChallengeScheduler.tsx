"use client";

import { useState } from "react";
import { useChallenges } from "@/hooks/useChallenges";
import ProgressChart from "@/components/dashboard/ProgressChart";
import ConfirmButton from "@/components/ui/ConfirmButton";
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
    <div className="rounded-2xl border border-[#e3e2de] bg-white p-5 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        {isEditing ? (
          <div className="flex flex-1 gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-full border border-[#e3e2de] bg-white px-3 py-1 text-sm"
            />
            <input
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              type="number"
              className="w-24 rounded-full border border-[#e3e2de] bg-white px-3 py-1 text-sm"
            />
          </div>
        ) : (
          <h3 className="font-hand text-2xl text-[#3f6f43]">{challenge.title}</h3>
        )}
        <span className="text-xs text-[#837a82]">
          {challenge.currentPages}/{challenge.totalPages}p · 하루 목표 {challenge.dailyGoal}p
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-mint-50">
        <div
          className="h-full rounded-full bg-mint-400 transition-all"
          style={{ width: `${challenge.progressRate}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-[#837a82]">{challenge.progressRate}% 진행</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="number"
          placeholder="읽은 페이지"
          className="w-32 rounded-full border border-[#e3e2de] bg-white px-3 py-1 text-xs placeholder:text-[#b3a8ad]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdateProgress(challenge.id, Number((e.target as HTMLInputElement).value));
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
        <span className="text-xs text-[#b3a8ad]">Enter로 진도 업데이트</span>

        <div className="ml-auto flex gap-2">
          {isEditing ? (
            <button
              onClick={handleSaveEdit}
              className="press-pop rounded-full bg-mint-400 px-3 py-1 text-xs font-bold text-white"
            >
              저장
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="press-pop rounded-full border border-[#e3e2de] px-3 py-1 text-xs font-bold text-[#5c8a9c] hover:border-sky-blue-300"
            >
              수정
            </button>
          )}
          <ConfirmButton
            onConfirm={() => onDelete(challenge.id)}
            confirmLabel="삭제?"
            className="rounded-full border border-[#e3e2de] px-3 py-1 text-xs font-bold text-[#a8533f] transition hover:border-strawberry-milk-400"
            confirmClassName="rounded-full bg-strawberry-milk-400 px-3 py-1 text-xs font-bold text-white"
          >
            삭제
          </ConfirmButton>
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
      <div className="rounded-2xl border border-[#e3e2de] bg-white p-5 shadow-sm">
        <h2 className="font-title mb-4 text-xl text-[#3a332e]">완독 챌린지 등록</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="책 제목"
            className="rounded-full border border-[#e3e2de] bg-white px-4 py-2 text-sm text-[#3a332e] placeholder:text-[#b3a8ad]"
          />
          <input
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            placeholder="총 페이지 수"
            type="number"
            className="rounded-full border border-[#e3e2de] bg-white px-4 py-2 text-sm text-[#3a332e] placeholder:text-[#b3a8ad]"
          />
          <input
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            type="date"
            className="rounded-full border border-[#e3e2de] bg-white px-4 py-2 text-sm text-[#3a332e]"
          />
          <input
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            type="date"
            className="rounded-full border border-[#e3e2de] bg-white px-4 py-2 text-sm text-[#3a332e]"
          />
        </div>
        {error && <p className="mt-2 text-xs text-strawberry-milk-400">{error}</p>}
        <button
          onClick={handleSubmit}
          className="press-pop mt-4 rounded-full bg-angel-pink-200 px-5 py-2 text-sm font-bold text-[#7a3c54] shadow-sm transition hover:bg-angel-pink-300"
        >
          챌린지 등록
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && <p className="text-[#837a82]">불러오는 중...</p>}
        {!isLoading && challenges.length === 0 && (
          <p className="text-[#b3a8ad]">등록된 챌린지가 없어요.</p>
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
