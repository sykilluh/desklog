"use client";

export default function SoundSlider({
  volume,
  isActive,
  onToggle,
  onVolumeChange,
}: {
  volume: number;
  isActive: boolean;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
}) {
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-2 py-1 shadow-lg"
    >
      <button
        onClick={onToggle}
        className={`text-xs ${isActive ? "text-amber-400" : "text-zinc-500"}`}
      >
        {isActive ? "🔊" : "🔈"}
      </button>
      {isActive && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="h-1 w-16 accent-amber-400"
        />
      )}
    </div>
  );
}
