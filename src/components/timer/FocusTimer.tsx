"use client";

import { useFocusTimer } from "@/hooks/useFocusTimer";
import { useFocusLogs } from "@/hooks/useFocusLogs";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function FocusTimer() {
  const { logFocusSeconds } = useFocusLogs();
  const { mode, phase, isRunning, seconds, switchMode, start, pause, reset, stopAndLog } =
    useFocusTimer(logFocusSeconds);

  return (
    <div className="rounded-xl bg-zinc-900 p-5">
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => switchMode("pomodoro")}
          className={`rounded-md px-3 py-1 text-xs ${
            mode === "pomodoro" ? "bg-amber-500 text-zinc-900" : "bg-zinc-800 text-zinc-300"
          }`}
        >
          뽀모도로
        </button>
        <button
          onClick={() => switchMode("stopwatch")}
          className={`rounded-md px-3 py-1 text-xs ${
            mode === "stopwatch" ? "bg-amber-500 text-zinc-900" : "bg-zinc-800 text-zinc-300"
          }`}
        >
          자유 스톱워치
        </button>
      </div>

      {mode === "pomodoro" && (
        <p className="mb-1 text-xs text-zinc-400">{phase === "focus" ? "집중 시간" : "휴식 시간"}</p>
      )}

      <p className="font-mono text-4xl tabular-nums">{formatTime(seconds)}</p>

      <div className="mt-4 flex gap-2">
        {isRunning ? (
          <button onClick={pause} className="rounded-md bg-zinc-700 px-4 py-1.5 text-sm">
            일시정지
          </button>
        ) : (
          <button onClick={start} className="rounded-md bg-amber-500 px-4 py-1.5 text-sm text-zinc-900">
            시작
          </button>
        )}
        <button onClick={reset} className="rounded-md bg-zinc-800 px-4 py-1.5 text-sm text-zinc-300">
          초기화
        </button>
        <button onClick={stopAndLog} className="rounded-md bg-zinc-800 px-4 py-1.5 text-sm text-zinc-300">
          종료·기록
        </button>
      </div>
    </div>
  );
}
