"use client";

const PLANT_STAGES = ["🌱", "🌿", "🌷", "🌈🌸"];

function getPlantStage(progressRate: number) {
  const index = Math.min(PLANT_STAGES.length - 1, Math.floor(progressRate / 25));
  return PLANT_STAGES[index];
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
  const glowBlur = 8 + lampIntensity * 28;
  const isRainbowStage = progressRate >= 75;

  return (
    <div className="flex items-center justify-around rounded-3xl border border-white/60 bg-white/70 p-5 shadow-md backdrop-blur">
      <div className="flex flex-col items-center gap-1">
        <span
          className="text-5xl"
          style={{
            filter: `drop-shadow(0 0 ${glowBlur}px rgba(255, 184, 107, ${glowOpacity}))`,
          }}
        >
          💡
        </span>
        <span className="text-xs text-[#a8889a]">
          오늘 집중 {Math.floor(todayFocusSeconds / 60)}분
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className={`text-5xl ${isRainbowStage ? "animate-wiggle" : ""}`}>
          {getPlantStage(progressRate)}
        </span>
        <span className="text-xs text-[#a8889a]">챌린지 {progressRate}%</span>
      </div>
    </div>
  );
}
