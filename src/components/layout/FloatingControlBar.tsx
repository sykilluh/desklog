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

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.5 2.2c0-.9 1-1.4 1.7-.9l8.6 5.8c.7.5.7 1.5 0 2l-8.6 5.8c-.7.5-1.7 0-1.7-.9V2.2z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="2" width="4" height="12" rx="1.3" />
      <rect x="9" y="2" width="4" height="12" rx="1.3" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="3" width="10" height="10" rx="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function DiaryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 5h5M5.5 8h5M5.5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
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
      <div className="flex w-full max-w-3xl flex-wrap items-center gap-4 rounded-2xl border border-[#e3e2de] bg-white/97 px-5 py-3 shadow-[0_-10px_24px_rgba(40,32,28,0.14)] backdrop-blur">
        {/* 음악 — min-w-[220px] keeps the album art + play button from being
            squeezed by flex-1's basis:0 once the ASMR/timer sections crowd
            the same row on narrow screens; without it the browser shrinks
            this block down past its content size and the shrink-0 children
            spill out over the next section instead of wrapping. */}
        <div className="flex min-w-[220px] flex-1 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#e3e2de] bg-ink-100 text-xl">
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnailUrl} alt="재생 중인 앨범아트" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[#b3a8ad]">♪</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#3a332e]">
              {playlist.currentVideoTitle ?? "재생 중인 음악이 없어요"}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#9c948b]">
              <span>{formatTime(playlist.currentTime)}</span>
              <input
                type="range"
                min={0}
                max={playlist.duration || 0}
                step={1}
                value={Math.min(playlist.currentTime, playlist.duration || 0)}
                onChange={(e) => playlist.seekTo(Number(e.target.value))}
                className="h-1 flex-1 accent-ink-600"
              />
              <span>{formatTime(playlist.duration)}</span>
            </div>
          </div>
          <button
            onClick={playlist.isPlaying ? playlist.pause : playlist.play}
            disabled={!playlist.isReady}
            style={{ "--glow-a": "rgba(255,179,203,.5)", "--glow-b": "rgba(168,213,255,.35)" } as React.CSSProperties}
            className={`glow-button press-pop flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-angel-pink-600 disabled:opacity-40 ${
              playlist.isPlaying ? "is-active" : ""
            }`}
          >
            {playlist.isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>

        {asmr.currentVideoId && (
          <>
            <div className="h-10 w-px bg-[#e3e2de]" />
            {/* ASMR */}
            <div className="flex items-center gap-2">
              <span
                className="rounded-full border border-[#e3e2de] px-2.5 py-1 text-xs font-semibold text-[#5c5650]"
                title={asmr.currentPresetLabel ?? "ASMR"}
              >
                {asmr.currentEmoji ?? "♪"} {asmr.currentPresetLabel ?? "ASMR"}
              </span>
              <button
                onClick={asmr.isPlaying ? asmr.pause : asmr.play}
                style={{ "--glow-a": "rgba(168,213,255,.5)", "--glow-b": "rgba(190,225,200,.35)" } as React.CSSProperties}
                className={`glow-button press-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sky-blue-500 ${
                  asmr.isPlaying ? "is-active" : ""
                }`}
              >
                {asmr.isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                onClick={asmr.stop}
                title="ASMR 정지"
                className="press-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e3e2de] text-[#837a82] hover:border-ink-400"
              >
                <StopIcon />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.5}
                onChange={(e) => asmr.setVolume(Number(e.target.value))}
                title="ASMR 볼륨"
                className="h-1 w-16 accent-sky-blue-400"
              />
            </div>
          </>
        )}

        <div className="h-10 w-px bg-[#e3e2de]" />

        {/* 타이머 */}
        <div className="flex items-center gap-2.5">
          <span
            className={`font-title text-2xl tabular-nums text-ink-600 ${
              timer.isRunning ? "animate-pulse" : ""
            }`}
          >
            {formatTime(timer.seconds)}
          </span>
          {timer.isRunning ? (
            <button
              onClick={timer.pauseSession}
              style={{ "--glow-a": "rgba(168,213,255,.5)", "--glow-b": "rgba(255,179,203,.3)" } as React.CSSProperties}
              className="glow-button is-active press-pop flex h-8 w-8 items-center justify-center rounded-full text-sky-blue-500"
            >
              <PauseIcon />
            </button>
          ) : (
            <button
              onClick={timer.activeSessionId ? timer.continueActiveSession : timer.startWithoutSession}
              style={{ "--glow-a": "rgba(255,179,203,.5)", "--glow-b": "rgba(255,221,168,.35)" } as React.CSSProperties}
              className="glow-button press-pop flex h-8 w-8 items-center justify-center rounded-full text-angel-pink-600"
            >
              <PlayIcon />
            </button>
          )}
          <button
            onClick={timer.stopAndSaveSession}
            title="종료·저장"
            className="press-pop flex h-8 w-8 items-center justify-center rounded-lg bg-ink-600 text-white shadow-sm"
          >
            <CheckIcon />
          </button>
          <Link
            href="/diary"
            title="기록 보기"
            className="press-pop flex h-8 w-8 items-center justify-center rounded-full border border-[#e3e2de] text-[#837a82] hover:border-ink-400"
          >
            <DiaryIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
