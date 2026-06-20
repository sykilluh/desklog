"use client";

import { useState } from "react";
import { useYoutubePlayer } from "@/hooks/useYoutubePlayer";
import { parseYoutubeUrl } from "@/lib/youtube";

const PLAYER_CONTAINER_ID = "desklog-youtube-player";

export default function YoutubeMixer() {
  const { isReady, isPlaying, loadVideo, loadPlaylist, play, pause, setVolume } =
    useYoutubePlayer(PLAYER_CONTAINER_ID);
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
    <div className="rounded-xl bg-zinc-900 p-5">
      <p className="mb-3 text-sm font-medium text-zinc-300">유튜브 플레이리스트</p>
      <div id={PLAYER_CONTAINER_ID} className="hidden" />

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="유튜브 영상/플레이리스트 URL"
          className="min-w-0 flex-1 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500"
        />
        <button
          onClick={handleLoad}
          disabled={!isReady}
          className="rounded-md bg-zinc-700 px-3 py-1.5 text-sm text-zinc-100 disabled:opacity-40"
        >
          불러오기
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={isPlaying ? pause : play}
          disabled={!isReady}
          className="rounded-md bg-amber-500 px-3 py-1 text-sm text-zinc-900 disabled:opacity-40"
        >
          {isPlaying ? "일시정지" : "재생"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="h-1 flex-1 accent-amber-400"
        />
      </div>
    </div>
  );
}
