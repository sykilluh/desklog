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
    <div className="rounded-3xl border-2 border-sky-blue-200 bg-gradient-to-br from-sky-blue-50 to-mint-50 p-5 shadow-md">
      <p className="mb-1 text-lg text-[#3a8fb8]">🎧 플레이리스트</p>
      <p className="mb-3 text-xs text-[#8fb0c4]">턴테이블을 켜면 이 음악도 함께 재생/정지돼요! 링크를 여러 개 추가해보세요.</p>

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLoad()}
          placeholder="유튜브 영상/플레이리스트 URL"
          className="min-w-0 flex-1 rounded-full border border-sky-blue-200 bg-white px-4 py-2 text-sm text-[#5b4a52] placeholder:text-[#b8d3e3]"
        />
        <button
          onClick={handleLoad}
          disabled={!isReady}
          className="rounded-full bg-sky-blue-300 px-4 py-2 text-sm font-bold text-white shadow disabled:opacity-40"
        >
          추가
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-strawberry-milk-400">{error}</p>}

      {queue.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-[#8fb0c4]">대기열 {queue.length}곡</p>
            <button
              onClick={clearQueue}
              className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#a8889a] shadow-sm hover:bg-angel-pink-50"
            >
              🗑️ 초기화
            </button>
          </div>
          <div className="flex max-h-32 flex-col gap-1 overflow-y-auto">
            {queue.map((item, i) => (
              <div
                key={`${item.videoId}-${i}`}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${
                  i === queueIndex ? "bg-sky-blue-200 font-bold text-[#2b6f8f]" : "bg-white text-[#8fb0c4]"
                }`}
              >
                <button onClick={() => playQueueIndex(i)} className="min-w-0 flex-1 truncate text-left">
                  {i === queueIndex ? "▶ " : ""}
                  {item.title ?? "제목 불러오는 중..."}
                </button>
                <button
                  onClick={() => removeFromQueue(i)}
                  title="대기열에서 제거"
                  className="shrink-0 text-[#cdb8c4] hover:text-strawberry-milk-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentVideoTitle && (
        <p className="mt-3 truncate text-sm font-bold text-[#3a6e58]" title={currentVideoTitle}>
          🎵 {currentVideoTitle}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2 text-xs text-[#8fb0c4]">
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
          className="h-1 flex-1 accent-mint-300"
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
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#3a8fb8] shadow-sm transition hover:scale-105 hover:bg-sky-blue-50 disabled:opacity-40"
        >
          <SkipBackIcon />
        </button>
        <button
          onClick={isPlaying ? pause : play}
          disabled={!isReady}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-sky-blue-300 to-mint-300 px-5 py-2 text-sm font-bold text-white shadow transition hover:scale-105 disabled:opacity-40"
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
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#3a8fb8] shadow-sm transition hover:scale-105 hover:bg-sky-blue-50 disabled:opacity-40"
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
