"use client";

import { useState } from "react";
import { POMODORO_PRESETS, useGlobalFocusTimer } from "@/components/providers/FocusTimerProvider";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  return `${m}분 ${s}초`;
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.5 2.2c0-.9 1-1.4 1.7-.9l8.6 5.8c.7.5.7 1.5 0 2l-8.6 5.8c-.7.5-1.7 0-1.7-.9V2.2z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="2" width="4" height="12" rx="1.3" />
      <rect x="9" y="2" width="4" height="12" rx="1.3" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 8A5 5 0 1 1 11.2 4.3" />
      <path d="M13 2.5v3.2h-3.2" />
    </svg>
  );
}

function SaveCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="13" height="13" rx="4" fill="currentColor" opacity="0.18" />
      <path d="M4.2 8.3l2.4 2.4 5.2-5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function FocusTimer() {
  const {
    mode,
    phase,
    preset,
    isRunning,
    seconds,
    switchMode,
    selectPreset,
    reset,
    sessions,
    activeSessionId,
    activeSessionName,
    startNewSession,
    resumeSession,
    startWithoutSession,
    nameActiveSession,
    continueActiveSession,
    pauseSession,
    stopAndSaveSession,
  } = useGlobalFocusTimer();

  const [nameInput, setNameInput] = useState("");
  const [liveNameInput, setLiveNameInput] = useState("");
  // Every session is now created with a real name from the moment it's
  // resumed/started (the server auto-names blank ones "time1", "time2", ...),
  // so "no name yet" only ever means the auto-generated placeholder — that's
  // exactly when the inline "이름 붙이기" field below should offer to rename it.
  const isAutoNamed = !!activeSessionName && /^time\d+$/.test(activeSessionName);
  const unfinished = sessions.filter((s) => !s.isCompleted);

  function handleNameActive() {
    if (!liveNameInput.trim()) return;
    nameActiveSession(liveNameInput.trim());
    setLiveNameInput("");
  }

  function handleStart() {
    if (activeSessionId) {
      continueActiveSession();
      return;
    }
    if (nameInput.trim()) {
      startNewSession(nameInput.trim());
      setNameInput("");
      return;
    }
    startWithoutSession();
  }

  return (
    <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-6 shadow-md backdrop-blur">
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => switchMode("pomodoro")}
          disabled={isRunning}
          title={isRunning ? "측정 중에는 모드를 바꿀 수 없어요. 먼저 일시정지하거나 종료·저장해주세요." : undefined}
          className={`rounded-full px-4 py-2 text-base font-bold transition disabled:opacity-40 ${
            mode === "pomodoro"
              ? "bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 text-white shadow"
              : "bg-angel-pink-50 text-[#a8889a]"
          }`}
        >
          🍅 뽀모도로
        </button>
        <button
          onClick={() => switchMode("stopwatch")}
          disabled={isRunning}
          title={isRunning ? "측정 중에는 모드를 바꿀 수 없어요. 먼저 일시정지하거나 종료·저장해주세요." : undefined}
          className={`rounded-full px-4 py-2 text-base font-bold transition disabled:opacity-40 ${
            mode === "stopwatch"
              ? "bg-gradient-to-r from-sky-blue-300 to-mint-300 text-white shadow"
              : "bg-sky-blue-50 text-[#a8889a]"
          }`}
        >
          ⏱️ 타이머
        </button>
      </div>

      {mode === "pomodoro" && (
        <div className="mb-3 flex flex-wrap gap-2">
          {POMODORO_PRESETS.map((p) => (
            <button
              key={p.focusMinutes}
              onClick={() => selectPreset(p)}
              disabled={isRunning}
              className={`rounded-full px-4 py-1.5 text-sm font-bold disabled:opacity-40 ${
                preset.focusMinutes === p.focusMinutes
                  ? "bg-mint-200 text-[#3a6e58]"
                  : "bg-mint-50 text-[#8fb8a6]"
              }`}
            >
              {p.focusMinutes}분
            </button>
          ))}
        </div>
      )}

      {mode === "pomodoro" && (
        <p className="mb-1 text-sm text-[#a8889a]">
          {phase === "focus" ? "🌷 집중 시간" : "🍓 휴식 시간"}
        </p>
      )}

      {/* named, resumable record: lets a study/reading session be saved
          mid-way and continued later, then picked for a share card */}
      {activeSessionName && !isAutoNamed ? (
        <p className="mb-1 text-sm font-bold text-[#ff6fa5]">📌 {activeSessionName}</p>
      ) : activeSessionName && isAutoNamed ? (
        // Started without typing a name — it's already saved under an
        // auto-generated "timeN" label, so this is purely optional: give it
        // a real name any time without losing the time already measured.
        <div className="mb-2 flex items-center gap-1.5">
          <span className="shrink-0 text-sm font-bold text-[#cdb8c4]">📌 {activeSessionName}</span>
          <input
            value={liveNameInput}
            onChange={(e) => setLiveNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNameActive()}
            placeholder="이름 붙이기 (선택)"
            className="w-full rounded-full border border-angel-pink-100 bg-white px-3 py-1 text-xs placeholder:text-[#cdb8c4]"
          />
          <button
            onClick={handleNameActive}
            disabled={!liveNameInput.trim()}
            className="shrink-0 rounded-full bg-angel-pink-100 px-2.5 py-1 text-xs font-bold text-[#a8576b] disabled:opacity-40"
          >
            저장
          </button>
        </div>
      ) : !isRunning ? (
        <div className="mb-2 flex flex-col gap-1.5">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="새 기록 이름 (예: 수학 숙제, 토지 3권) — 비워두면 time1, time2...로 저장돼요"
            className="w-full rounded-full border border-angel-pink-100 bg-white px-3 py-1.5 text-sm placeholder:text-[#cdb8c4]"
          />
          {unfinished.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {unfinished.map((s) => (
                <button
                  key={s.id}
                  onClick={() => resumeSession(s)}
                  title={`이어하기 · 지금까지 ${formatDuration(s.totalSeconds)}`}
                  className="rounded-full border border-sky-blue-200 bg-sky-blue-50 px-3 py-1 text-xs font-bold text-[#2b6f8f] hover:bg-sky-blue-100"
                >
                  {s.mode === "stopwatch" ? "⏱️" : "🍅"} ▶ {s.name} ({formatDuration(s.totalSeconds)})
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <p
        className={`text-6xl tabular-nums text-[#ff6fa5] drop-shadow-sm ${
          isRunning ? "animate-pulse" : ""
        }`}
      >
        {formatTime(seconds)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {isRunning ? (
          <button
            onClick={pauseSession}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-sky-blue-200 to-sky-blue-300 px-5 py-2 text-base font-bold text-white shadow-sm shadow-sky-blue-300/50 transition hover:scale-105 active:scale-95"
          >
            <PauseIcon /> 일시정지
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-angel-pink-300 to-strawberry-milk-400 px-5 py-2 text-base font-bold text-white shadow-sm shadow-angel-pink-300/50 transition hover:scale-105 active:scale-95"
          >
            <PlayIcon /> 시작
          </button>
        )}
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-full border-2 border-angel-pink-100 bg-white px-5 py-2 text-base font-bold text-[#a8889a] transition hover:scale-105 hover:bg-angel-pink-50 active:scale-95"
        >
          <ResetIcon /> 초기화
        </button>
        <button
          onClick={stopAndSaveSession}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-mint-300 to-mint-400 px-5 py-2 text-base font-bold text-white shadow-sm shadow-mint-300/50 transition hover:scale-105 active:scale-95"
        >
          <SaveCheckIcon /> 종료·저장
        </button>
      </div>
    </div>
  );
}
