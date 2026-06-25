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
      className="flex items-center gap-1.5 rounded-full border border-angel-pink-100 bg-white/95 px-2.5 py-1 shadow-md"
    >
      <button
        onClick={onToggle}
        className={`text-sm ${isActive ? "text-strawberry-milk-400" : "text-[#b3a8ad]"}`}
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
          className="h-1 w-16 accent-angel-pink-300"
        />
      )}
    </div>
  );
}
