"use client";

import { usePathname } from "next/navigation";
import { usePlaylist } from "@/components/providers/PlaylistProvider";
import { useGlobalFocusTimer } from "@/components/providers/FocusTimerProvider";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function FloatingControlBar() {
  const pathname = usePathname();
  const playlist = usePlaylist();
  const timer = useGlobalFocusTimer();

  if (pathname === "/login" || pathname === "/signup") return null;

  const thumbnailUrl = playlist.currentVideoId
    ? `https://img.youtube.com/vi/${playlist.currentVideoId}/hqdefault.jpg`
    : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3">
      <div className="flex w-full max-w-3xl flex-wrap items-center gap-4 rounded-3xl border-2 border-white bg-white/95 px-5 py-3 shadow-2xl backdrop-blur">
        {/* 음악 */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-blue-200 to-mint-200 text-2xl">
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnailUrl} alt="재생 중인 앨범아트" className="h-full w-full object-cover" />
            ) : (
              "🎵"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#3a6e58]">
              {playlist.currentVideoTitle ?? "재생 중인 음악이 없어요"}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#8fb0c4]">
              <span>{formatTime(playlist.currentTime)}</span>
              <input
                type="range"
                min={0}
                max={playlist.duration || 0}
                step={1}
                value={Math.min(playlist.currentTime, playlist.duration || 0)}
                onChange={(e) => playlist.seekTo(Number(e.target.value))}
                className="h-1 flex-1 accent-mint-300"
              />
              <span>{formatTime(playlist.duration)}</span>
            </div>
          </div>
          <button
            onClick={playlist.isPlaying ? playlist.pause : playlist.play}
            disabled={!playlist.isReady}
            className="shrink-0 rounded-full bg-gradient-to-r from-sky-blue-300 to-mint-300 px-4 py-2 text-sm font-bold text-white shadow disabled:opacity-40"
          >
            {playlist.isPlaying ? "⏸" : "▶"}
          </button>
        </div>

        <div className="h-10 w-px bg-angel-pink-100" />

        {/* 타이머 */}
        <div className="flex items-center gap-3">
          <span
            className={`text-2xl font-bold tabular-nums text-[#ff6fa5] ${
              timer.isRunning ? "animate-pulse" : ""
            }`}
          >
            {formatTime(timer.seconds)}
          </span>
          {timer.isRunning ? (
            <button
              onClick={timer.pause}
              className="rounded-full bg-sky-blue-200 px-4 py-2 text-sm font-bold text-[#2b6f8f]"
            >
              ⏸
            </button>
          ) : (
            <button
              onClick={timer.start}
              className="rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-4 py-2 text-sm font-bold text-white shadow"
            >
              ▶
            </button>
          )}
          <button
            onClick={timer.stopAndLog}
            className="rounded-full bg-mint-100 px-3 py-2 text-sm font-bold text-[#3a6e58]"
          >
            ✅
          </button>
        </div>
      </div>
    </div>
  );
}
