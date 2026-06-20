"use client";

import { useState } from "react";
import { parseYoutubeUrl } from "@/lib/youtube";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function YoutubeMixer({
  isReady,
  isPlaying,
  currentVideoTitle,
  currentTime,
  duration,
  loadVideo,
  loadPlaylist,
  play,
  pause,
  setVolume,
  seekTo,
}: {
  isReady: boolean;
  isPlaying: boolean;
  currentVideoTitle: string | null;
  currentTime: number;
  duration: number;
  loadVideo: (videoId: string) => void;
  loadPlaylist: (listId: string) => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  seekTo: (seconds: number) => void;
}) {
  const [url, setUrl] = useState("");
  const [volume, setVolumeState] = useState(0.5);
  const [error, setError] = useState("");

  function handleLoad() {
    const { videoId, listId } = parseYoutubeUrl(url);
    if (listId) {
      loadPlaylist(listId);
      setError("");
      return;
    }
    if (videoId) {
      loadVideo(videoId);
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
      <p className="mb-3 text-xs text-[#8fb0c4]">턴테이블을 켜면 이 음악도 함께 재생/정지돼요!</p>

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="유튜브 영상/플레이리스트 URL"
          className="min-w-0 flex-1 rounded-full border border-sky-blue-200 bg-white px-4 py-2 text-sm text-[#5b4a52] placeholder:text-[#b8d3e3]"
        />
        <button
          onClick={handleLoad}
          disabled={!isReady}
          className="rounded-full bg-sky-blue-300 px-4 py-2 text-sm font-bold text-white shadow disabled:opacity-40"
        >
          불러오기
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-strawberry-milk-400">{error}</p>}

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
          onChange={(e) => seekTo(Number(e.target.value))}
          className="h-1 flex-1 accent-mint-300"
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={isPlaying ? pause : play}
          disabled={!isReady}
          className="rounded-full bg-gradient-to-r from-sky-blue-300 to-mint-300 px-4 py-2 text-sm font-bold text-white shadow disabled:opacity-40"
        >
          {isPlaying ? "⏸ 일시정지" : "▶ 재생"}
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
