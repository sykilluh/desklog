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
      className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
    >
      {isMuted ? "🔇 전체 음소거 해제" : "🔊 전체 음소거"}
    </button>
  );
}
