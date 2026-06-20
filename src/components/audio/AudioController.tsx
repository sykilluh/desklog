"use client";

export default function AudioController({
  isMuted,
  onToggleMute,
}: {
  isMuted: boolean;
  onToggleMute: () => void;
}) {
  return (
    <button
      onClick={onToggleMute}
      className="flex items-center gap-1.5 rounded-full border-2 border-angel-pink-200 bg-white px-5 py-2.5 text-base font-bold text-[#5b4a52] shadow-sm transition hover:scale-105 hover:bg-angel-pink-50"
    >
      {isMuted ? "🔇 음소거 해제" : "🔊 전체 음소거"}
    </button>
  );
}
