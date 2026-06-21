"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlaylist } from "@/components/providers/PlaylistProvider";
import { useAsmrPlayer } from "@/components/providers/AsmrPlayerProvider";
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
  const asmr = useAsmrPlayer();
  const timer = useGlobalFocusTimer();

  if (pathname === "/login" || pathname === "/signup") return null;

  const thumbnailUrl = playlist.currentVideoId
    ? `https://img.youtube.com/vi/${playlist.currentVideoId}/hqdefault.jpg`
    : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3">
      <div className="flex w-full max-w-3xl flex-wrap items-center gap-4 rounded-3xl border-2 border-white bg-white/95 px-5 py-3 shadow-[0_-12px_28px_rgba(168,136,154,0.28)] backdrop-blur">
        {/* 음악 — min-w-[220px] keeps the album art + play button from being
            squeezed by flex-1's basis:0 once the ASMR/timer sections crowd
            the same row on narrow screens; without it the browser shrinks
            this block down past its content size and the shrink-0 children
            spill out over the next section instead of wrapping. */}
        <div className="flex min-w-[220px] flex-1 items-center gap-3">
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
            className="shrink-0 rounded-full bg-gradient-to-r from-sky-blue-300 to-mint-300 px-4 py-2 text-sm font-bold text-white shadow shadow-sky-blue-300/40 disabled:opacity-40"
          >
            {playlist.isPlaying ? "⏸" : "▶"}
          </button>
        </div>

        {asmr.currentVideoId && (
          <>
            <div className="h-10 w-px bg-angel-pink-100" />
            {/* ASMR */}
            <div className="flex items-center gap-2">
              <span
                className="rounded-full bg-mint-100 px-2 py-1 text-xs font-bold text-[#3a6e58]"
                title={asmr.currentPresetLabel ?? "ASMR"}
              >
                {asmr.currentEmoji ?? "🎧"} {asmr.currentPresetLabel ?? "ASMR"}
              </span>
              <button
                onClick={asmr.isPlaying ? asmr.pause : asmr.play}
                className="shrink-0 rounded-full bg-gradient-to-r from-mint-300 to-sky-blue-300 px-3 py-2 text-sm font-bold text-white shadow shadow-mint-300/40"
              >
                {asmr.isPlaying ? "⏸" : "▶"}
              </button>
              <button
                onClick={asmr.stop}
                className="shrink-0 rounded-full bg-angel-pink-50 px-3 py-2 text-sm font-bold text-[#a8889a]"
                title="ASMR 정지"
              >
                ⏹
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.5}
                onChange={(e) => asmr.setVolume(Number(e.target.value))}
                title="ASMR 볼륨"
                className="h-1 w-16 accent-mint-300"
              />
            </div>
          </>
        )}

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
              onClick={timer.pauseSession}
              className="rounded-full bg-sky-blue-200 px-4 py-2 text-sm font-bold text-[#2b6f8f]"
            >
              ⏸
            </button>
          ) : (
            <button
              onClick={timer.start}
              className="rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-4 py-2 text-sm font-bold text-white shadow shadow-angel-pink-300/40"
            >
              ▶
            </button>
          )}
          <button
            onClick={() => {
              timer.stopAndLog();
              timer.clearActiveSession();
            }}
            className="rounded-full bg-mint-100 px-3 py-2 text-sm font-bold text-[#3a6e58]"
          >
            ✅
          </button>
          <Link
            href="/"
            title="공부·독서 기록 보기"
            className="rounded-full bg-angel-pink-50 px-3 py-2 text-sm font-bold text-[#a8889a] hover:bg-angel-pink-100"
          >
            📔
          </Link>
        </div>
      </div>
    </div>
  );
}
