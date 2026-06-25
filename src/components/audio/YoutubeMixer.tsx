"use client";

import { useState } from "react";
import { parseYoutubeUrl } from "@/lib/youtube";
import type { QueueItem } from "@/components/providers/PlaylistProvider";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function SkipBackIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
      <path d="M9.5 10l7-5v10l-7-5z" fill="currentColor" />
      <rect x="3" y="5" width="2" height="10" rx="1" fill="currentColor" />
    </svg>
  );
}

function SkipForwardIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
      <path d="M10.5 10l-7-5v10l7-5z" fill="currentColor" />
      <rect x="15" y="5" width="2" height="10" rx="1" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.5 2.2c0-.9 1-1.4 1.7-.9l8.6 5.8c.7.5.7 1.5 0 2l-8.6 5.8c-.7.5-1.7 0-1.7-.9V2.2z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="2" width="4" height="12" rx="1.3" />
      <rect x="9" y="2" width="4" height="12" rx="1.3" />
    </svg>
  );
}

export default function YoutubeMixer({
  isReady,
  isPlaying,
  currentVideoTitle,
  currentTime,
  duration,
  queue,
  queueIndex,
  loadVideo,
  loadPlaylist,
  addToQueue,
  removeFromQueue,
  clearQueue,
  playQueueIndex,
  play,
  pause,
  setVolume,
  seekTo,
  onSeekBoost,
}: {
  isReady: boolean;
  isPlaying: boolean;
  currentVideoTitle: string | null;
  currentTime: number;
  duration: number;
  queue: QueueItem[];
  queueIndex: number | null;
  loadVideo: (videoId: string) => void;
  loadPlaylist: (listId: string) => void;
  addToQueue: (videoId: string) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playQueueIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  seekTo: (seconds: number) => void;
  /** Fired alongside any seek so the turntable disc can spin fast for a beat, like skipping across the grooves. */
  onSeekBoost?: () => void;
}) {
  const [url, setUrl] = useState("");
  const [volume, setVolumeState] = useState(0.5);
  const [error, setError] = useState("");
  const [armedIndex, setArmedIndex] = useState<number | null>(null);

  function handleLoad() {
    const { videoId, listId } = parseYoutubeUrl(url);
    if (listId) {
      loadPlaylist(listId);
      setUrl("");
      setError("");
      return;
    }
    if (videoId) {
      // Adds to the queue instead of replacing what's playing — lets several
      // links be queued up one after another, like a custom playlist.
      addToQueue(videoId);
      setUrl("");
      setError("");
      return;
    }
    setError("유효한 유튜브 영상/플레이리스트 링크가 아니에요.");
  }

  function handleVolumeChange(next: number) {
    setVolumeState(next);
    setVolume(next);
  }

  return (
    <div className="rounded-2xl border border-[#e3e2de] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-hand text-2xl text-[#3a332e]">Record Shop</p>
        <p className="text-[11px] text-[#9c948b]">턴테이블을 켜면 같이 재생돼요</p>
      </div>

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLoad()}
          placeholder="유튜브 영상/플레이리스트 URL"
          className="min-w-0 flex-1 rounded-full border border-[#e3e2de] bg-white px-4 py-2 text-sm text-[#3a332e] placeholder:text-[#b3a8ad]"
        />
        <button
          onClick={handleLoad}
          disabled={!isReady}
          title="추가"
          className="press-pop flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-600 text-lg font-bold text-white shadow-sm transition hover:bg-ink-500 disabled:opacity-40"
        >
          +
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-strawberry-milk-400">{error}</p>}

      {queue.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#9c948b]">대기열 {queue.length}곡</p>
            <button onClick={clearQueue} className="text-[11px] font-bold text-[#9c948b] hover:text-strawberry-milk-400">
              전체 비우기
            </button>
          </div>
          {/* CD jewel-case shelf — real video thumbnails as "album art". Double-click
              a card to arm its delete badge (top-right ✕); single click just plays it. */}
          <div className="flex gap-3 overflow-x-auto pb-2" onClick={() => setArmedIndex(null)}>
            {queue.map((item, i) => {
              const isActive = i === queueIndex;
              const armed = armedIndex === i;
              return (
                <div
                  key={`${item.videoId}-${i}`}
                  style={{ "--tilt": i % 2 === 0 ? "-2deg" : "2deg" } as React.CSSProperties}
                  className={`tilt-sticker hover-lift relative w-24 shrink-0 cursor-pointer rounded-md border-2 p-1.5 shadow-md ${
                    isActive ? "border-ink-600" : "border-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    playQueueIndex(i);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setArmedIndex(i);
                  }}
                >
                  <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-sm bg-ink-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {isActive && isPlaying && (
                      <span className="absolute inset-0 flex items-center justify-center bg-ink-600/30 text-lg text-white">♪</span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-center text-[11px] font-semibold text-[#3a332e]">
                    {item.title ?? "..."}
                  </p>
                  {armed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(i);
                        setArmedIndex(null);
                      }}
                      title="대기열에서 제거"
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-strawberry-milk-500 text-[10px] text-white shadow-md"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentVideoTitle && (
        <div className="mt-4 border-t border-[#e3e2de] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9c948b]">Now Playing</p>
          <p className="truncate text-base font-semibold text-[#3a332e]" title={currentVideoTitle}>
            {currentVideoTitle}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-[#9c948b]">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => {
            seekTo(Number(e.target.value));
            onSeekBoost?.();
          }}
          className="h-1 flex-1 accent-ink-600"
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => {
            seekTo(Math.max(0, currentTime - 10));
            onSeekBoost?.();
          }}
          disabled={!isReady}
          title="10초 뒤로"
          className="press-pop flex h-9 w-9 items-center justify-center rounded-full border border-[#e3e2de] bg-white text-[#3a332e] transition hover:border-ink-600 disabled:opacity-40"
        >
          <SkipBackIcon />
        </button>
        <button
          onClick={isPlaying ? pause : play}
          disabled={!isReady}
          className="press-pop flex items-center gap-1.5 rounded-full bg-ink-600 px-5 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-40"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />} {isPlaying ? "일시정지" : "재생"}
        </button>
        <button
          onClick={() => {
            seekTo(Math.min(duration || 0, currentTime + 10));
            onSeekBoost?.();
          }}
          disabled={!isReady}
          title="10초 앞으로"
          className="press-pop flex h-9 w-9 items-center justify-center rounded-full border border-[#e3e2de] bg-white text-[#3a332e] transition hover:border-ink-600 disabled:opacity-40"
        >
          <SkipForwardIcon />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="h-1 flex-1 accent-sky-blue-300"
        />
      </div>
    </div>
  );
}
