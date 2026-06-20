"use client";

import { POMODORO_PRESETS, useFocusTimer } from "@/hooks/useFocusTimer";
import { useFocusLogs } from "@/hooks/useFocusLogs";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function FocusTimer({ onFocusLogged }: { onFocusLogged?: () => void }) {
  const { logFocusSeconds } = useFocusLogs(onFocusLogged);
  const {
    mode,
    phase,
    preset,
    isRunning,
    seconds,
    switchMode,
    selectPreset,
    start,
    pause,
    reset,
    stopAndLog,
  } = useFocusTimer(logFocusSeconds);

  return (
    <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-5 shadow-md backdrop-blur">
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => switchMode("pomodoro")}
          className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
            mode === "pomodoro"
              ? "bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 text-white shadow"
              : "bg-angel-pink-50 text-[#a8889a]"
          }`}
        >
          🍅 뽀모도로
        </button>
        <button
          onClick={() => switchMode("stopwatch")}
          className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
            mode === "stopwatch"
              ? "bg-gradient-to-r from-sky-blue-300 to-mint-300 text-white shadow"
              : "bg-sky-blue-50 text-[#a8889a]"
          }`}
        >
          ⏱️ 스톱워치
        </button>
      </div>

      {mode === "pomodoro" && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {POMODORO_PRESETS.map((p) => (
            <button
              key={p.focusMinutes}
              onClick={() => selectPreset(p)}
              disabled={isRunning}
              className={`rounded-full px-3 py-1 text-xs font-bold disabled:opacity-40 ${
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
        <p className="mb-1 text-xs text-[#a8889a]">
          {phase === "focus" ? "🌷 집중 시간" : "🍓 휴식 시간"}
        </p>
      )}

      <p className="font-cute text-5xl tabular-nums text-[#ff6fa5] drop-shadow-sm">
        {formatTime(seconds)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {isRunning ? (
          <button
            onClick={pause}
            className="rounded-full bg-sky-blue-200 px-4 py-1.5 text-sm font-bold text-[#2b6f8f]"
          >
            ⏸ 일시정지
          </button>
        ) : (
          <button
            onClick={start}
            className="rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-4 py-1.5 text-sm font-bold text-white shadow"
          >
            ▶ 시작
          </button>
        )}
        <button
          onClick={reset}
          className="rounded-full bg-angel-pink-50 px-4 py-1.5 text-sm font-bold text-[#a8889a]"
        >
          ↺ 초기화
        </button>
        <button
          onClick={stopAndLog}
          className="rounded-full bg-mint-100 px-4 py-1.5 text-sm font-bold text-[#3a6e58]"
        >
          ✅ 종료·기록
        </button>
      </div>
    </div>
  );
}
