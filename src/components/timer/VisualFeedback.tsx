"use client";

const PLANT_STAGES = ["🌱", "🌿", "🌷", "🌈🌸"];

function getPlantStage(progressRate: number) {
  const index = Math.min(PLANT_STAGES.length - 1, Math.floor(progressRate / 25));
  return PLANT_STAGES[index];
}

function LampIcon({ glowOpacity, glowBlur }: { glowOpacity: number; glowBlur: number }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: `drop-shadow(0 0 ${glowBlur}px rgba(247, 146, 182, ${glowOpacity}))` }}
    >
      <circle cx="12" cy="10" r="7" fill="#f7eede" stroke="#3a332e" strokeWidth="1.4" />
      <path d="M9 17.5h6M9.6 20h4.8" stroke="#3a332e" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 9.5c0-1.5 1.2-2.7 2.7-2.7" stroke="#d2658f" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function VisualFeedback({
  todayFocusSeconds,
  progressRate,
}: {
  todayFocusSeconds: number;
  progressRate: number;
}) {
  const lampIntensity = Math.min(1, todayFocusSeconds / (2 * 60 * 60));
  const glowOpacity = 0.35 + lampIntensity * 0.65;
  const glowBlur = 6 + lampIntensity * 20;
  const isRainbowStage = progressRate >= 75;

  return (
    <div className="flex items-center justify-around rounded-2xl border border-[#e3e2de] bg-white p-5 shadow-sm">
      <div className="flex flex-col items-center gap-1.5">
        <LampIcon glowOpacity={glowOpacity} glowBlur={glowBlur} />
        <span className="text-xs text-[#837a82]">
          오늘 집중 {Math.floor(todayFocusSeconds / 60)}분
        </span>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span className={`text-4xl ${isRainbowStage ? "animate-wiggle" : ""}`}>
          {getPlantStage(progressRate)}
        </span>
        <span className="text-xs text-[#837a82]">챌린지 {progressRate}%</span>
      </div>
    </div>
  );
}
