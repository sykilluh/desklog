"use client";

import { createContext, useContext, useMemo } from "react";
import { useYoutubePlayer, type YoutubePlayerState } from "@/hooks/useYoutubePlayer";
import { ASMR_PRESETS } from "@/lib/weatherAsmr";

const ASMR_PLAYER_CONTAINER_ID = "desklog-asmr-player";

interface AsmrPlayerContextValue extends YoutubePlayerState {
  currentEmoji: string | null;
  currentPresetLabel: string | null;
}

const AsmrPlayerContext = createContext<AsmrPlayerContextValue | null>(null);

export default function AsmrPlayerProvider({ children }: { children: React.ReactNode }) {
  const player = useYoutubePlayer(ASMR_PLAYER_CONTAINER_ID);

  const activePreset = useMemo(
    () => ASMR_PRESETS.find((preset) => preset.videoId === player.currentVideoId) ?? null,
    [player.currentVideoId]
  );

  const value: AsmrPlayerContextValue = {
    ...player,
    currentEmoji: activePreset?.emoji ?? null,
    currentPresetLabel: activePreset?.label ?? null,
  };

  return (
    <AsmrPlayerContext.Provider value={value}>
      <div id={ASMR_PLAYER_CONTAINER_ID} className="hidden" />
      {children}
    </AsmrPlayerContext.Provider>
  );
}

export function useAsmrPlayer() {
  const context = useContext(AsmrPlayerContext);
  if (!context) {
    throw new Error("useAsmrPlayer는 AsmrPlayerProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}
