"use client";

import { useGlobalFocusTimer } from "@/components/providers/FocusTimerProvider";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function DeskClockVisual({ size }: { size: number }) {
  const { mode, phase, preset, isRunning, seconds } = useGlobalFocusTimer();

  const totalSeconds =
    mode === "pomodoro" ? (phase === "focus" ? preset.focusMinutes * 60 : preset.breakMinutes * 60) : 60 * 60;
  const remainingRatio = mode === "pomodoro" ? Math.max(0, Math.min(1, seconds / totalSeconds)) : (seconds % 3600) / 3600;

  const radius = size * 0.42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - remainingRatio);

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <div
        className="relative flex items-center justify-center rounded-full bg-white/80 shadow-[0_8px_18px_rgba(168,136,154,0.3)] ring-2 ring-white/90"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="absolute -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,193,213,0.35)"
            strokeWidth={size * 0.05}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={phase === "break" ? "#9cd9c2" : "#ff8fb4"}
            strokeWidth={size * 0.05}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>

        {/* clock hands ticking for visual flavor */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom rounded-full bg-[#3a332e]/70 transition-transform duration-1000 ease-linear"
          style={{
            width: size * 0.018,
            height: size * 0.26,
            transform: `translate(-50%, -100%) rotate(${(seconds % 60) * 6}deg)`,
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3a332e]"
          style={{ width: size * 0.035, height: size * 0.035 }}
        />

        <span
          className={`relative z-10 font-bold tabular-nums text-[#3a332e] ${isRunning ? "animate-pulse" : ""}`}
          style={{ fontSize: size * 0.17 }}
        >
          {formatTime(seconds)}
        </span>
      </div>
      <span className="mt-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[#837a82] shadow-sm">
        {mode === "pomodoro" ? (phase === "focus" ? "🌷 집중 중" : "🍓 휴식 중") : "⏱️ 스톱워치"}
      </span>
    </div>
  );
}
