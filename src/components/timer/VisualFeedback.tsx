"use client";

const PLANT_STAGES = ["🌱", "🌿", "🪴", "🌳"];

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
  const glowOpacity = 0.3 + lampIntensity * 0.7;
  const glowBlur = 6 + lampIntensity * 24;

  return (
    <div className="flex items-center justify-around rounded-xl bg-zinc-900 p-5">
      <div className="flex flex-col items-center gap-1">
        <span
          className="text-4xl"
          style={{
            filter: `drop-shadow(0 0 ${glowBlur}px rgba(245, 158, 11, ${glowOpacity}))`,
          }}
        >
          💡
        </span>
        <span className="text-xs text-zinc-400">
          오늘 집중 {Math.floor(todayFocusSeconds / 60)}분
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-4xl">{getPlantStage(progressRate)}</span>
        <span className="text-xs text-zinc-400">챌린지 {progressRate}%</span>
      </div>
    </div>
  );
}
