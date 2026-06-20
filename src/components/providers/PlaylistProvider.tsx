"use client";

import { createContext, useContext } from "react";
import { useYoutubePlayer, type YoutubePlayerState } from "@/hooks/useYoutubePlayer";

const PLAYER_CONTAINER_ID = "desklog-youtube-player";

const PlaylistContext = createContext<YoutubePlayerState | null>(null);

export default function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const player = useYoutubePlayer(PLAYER_CONTAINER_ID);

  return (
    <PlaylistContext.Provider value={player}>
      <div id={PLAYER_CONTAINER_ID} className="hidden" />
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist는 PlaylistProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}
