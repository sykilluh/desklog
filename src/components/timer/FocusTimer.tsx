"use client";

import { useState } from "react";
import { POMODORO_PRESETS, useGlobalFocusTimer } from "@/components/providers/FocusTimerProvider";
import ConfirmButton from "@/components/ui/ConfirmButton";

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
  // A record is locked to whichever mode/preset it was created under — only
  // disabling these while isRunning let you pause a pomodoro record, flip to
  // 타이머 mode (allowed since paused), then press 시작 again, which resumed
  // the SAME pomodoro record but now ticking as a stopwatch. Saving after
  // that wrote stopwatch-shaped data (elapsed seconds, no phase) onto a
  // pomodoro record, corrupting it. Locking these out for the whole time a
  // record is attached — paused or running — closes that gap.
  const modeLocked = isRunning || !!activeSessionId;

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
    <div className="rounded-2xl border border-[#e3e2de] bg-white p-6 shadow-sm">
      <div className="relative mb-4 flex rounded-full bg-[#eeeeec] p-1">
        <span
          className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-ink-600 shadow-sm transition-transform duration-300 ease-out"
          style={{ transform: mode === "stopwatch" ? "translateX(calc(100% + 0.5rem))" : "translateX(0)" }}
        />
        <button
          onClick={() => switchMode("pomodoro")}
          disabled={modeLocked}
          title={modeLocked ? "측정 중인 기록이 있으면 모드를 바꿀 수 없어요. 먼저 종료·저장해주세요." : undefined}
          className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition disabled:opacity-40 ${
            mode === "pomodoro" ? "text-white" : "text-[#837a82]"
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => switchMode("stopwatch")}
          disabled={modeLocked}
          title={modeLocked ? "측정 중인 기록이 있으면 모드를 바꿀 수 없어요. 먼저 종료·저장해주세요." : undefined}
          className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition disabled:opacity-40 ${
            mode === "stopwatch" ? "text-white" : "text-[#837a82]"
          }`}
        >
          Stopwatch
        </button>
      </div>

      {mode === "pomodoro" && (
        <div className="mb-3 flex flex-wrap gap-2">
          {POMODORO_PRESETS.map((p) => (
            <button
              key={p.focusMinutes}
              onClick={() => selectPreset(p)}
              disabled={modeLocked}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:opacity-40 ${
                preset.focusMinutes === p.focusMinutes
                  ? "bg-ink-600 text-white"
                  : "border border-[#e3e2de] text-[#837a82] hover:border-ink-400"
              }`}
            >
              {p.focusMinutes}분
            </button>
          ))}
        </div>
      )}

      {mode === "pomodoro" && (
        <p className="mb-1 text-sm text-[#837a82]">
          {phase === "focus" ? "🌷 집중 시간" : "🍓 휴식 시간"}
        </p>
      )}

      {/* named, resumable record: lets a study/reading session be saved
          mid-way and continued later, then picked for a share card */}
      {activeSessionName && !isAutoNamed ? (
        <p className="mb-1 text-sm font-bold text-[#d2658f]">📌 {activeSessionName}</p>
      ) : activeSessionName && isAutoNamed ? (
        // Started without typing a name — it's already saved under an
        // auto-generated "timeN" label, so this is purely optional: give it
        // a real name any time without losing the time already measured.
        <div className="mb-2 flex items-center gap-1.5">
          <span className="shrink-0 text-sm font-bold text-[#b3a8ad]">📌 {activeSessionName}</span>
          <input
            value={liveNameInput}
            onChange={(e) => setLiveNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNameActive()}
            placeholder="이름 붙이기 (선택)"
            className="w-full rounded-full border border-angel-pink-100 bg-white px-3 py-1 text-xs placeholder:text-[#b3a8ad]"
          />
          <button
            onClick={handleNameActive}
            disabled={!liveNameInput.trim()}
            className="shrink-0 rounded-full bg-angel-pink-100 px-2.5 py-1 text-xs font-bold text-[#e6709c] disabled:opacity-40"
          >
            저장
          </button>
        </div>
      ) : !isRunning ? (
        <div className="mb-2 flex flex-col gap-1.5">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="새 기록 이름 (예: 기획서 작성, 독서) — 비워두면 time1, time2...로 저장돼요"
            className="w-full rounded-full border border-angel-pink-100 bg-white px-3 py-1.5 text-sm placeholder:text-[#b3a8ad]"
          />
          {unfinished.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {unfinished.map((s) => (
                <button
                  key={s.id}
                  onClick={() => resumeSession(s)}
                  title={`이어하기 · 지금까지 ${formatDuration(s.totalSeconds)}`}
                  className="rounded-full border border-sky-blue-200 bg-sky-blue-50 px-3 py-1 text-xs font-bold text-[#3c6577] hover:bg-sky-blue-100"
                >
                  {s.mode === "stopwatch" ? "⏱️" : "🍅"} ▶ {s.name} ({formatDuration(s.totalSeconds)})
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <p
        className={`font-title text-6xl tabular-nums text-ink-600 ${
          isRunning ? "animate-pulse" : ""
        }`}
      >
        {formatTime(seconds)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {isRunning ? (
          <button
            onClick={pauseSession}
            className="flex items-center gap-1.5 rounded-full bg-sky-blue-400 px-5 py-2 text-base font-bold text-white shadow-sm transition hover:bg-sky-blue-500 active:scale-95"
          >
            <PauseIcon /> 일시정지
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 rounded-full bg-angel-pink-200 px-5 py-2 text-base font-bold text-[#7a3c54] shadow-sm transition hover:bg-angel-pink-300 active:scale-95"
          >
            <PlayIcon /> 시작
          </button>
        )}
        <ConfirmButton
          onConfirm={reset}
          confirmLabel="정말요? 한 번 더!"
          className="flex items-center gap-1.5 rounded-full border border-[#e3e2de] bg-white px-5 py-2 text-base font-bold text-[#837a82] transition hover:border-angel-pink-300 active:scale-95"
          confirmClassName="flex items-center gap-1.5 rounded-full border border-strawberry-milk-400 bg-strawberry-milk-50 px-5 py-2 text-base font-bold text-strawberry-milk-400 transition active:scale-95"
        >
          <ResetIcon /> 초기화
        </ConfirmButton>
        <button
          onClick={stopAndSaveSession}
          className="flex items-center gap-1.5 rounded-xl bg-ink-600 px-5 py-2 text-base font-bold text-white shadow-sm transition hover:bg-ink-500 active:scale-95"
        >
          <SaveCheckIcon /> 종료·저장
        </button>
      </div>
    </div>
  );
}
