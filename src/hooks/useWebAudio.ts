"use client";

import { useCallback, useEffect, useState } from "react";
import {
  activateObjectAudio,
  deactivateObjectAudio,
  setMasterMuted,
  setObjectVolume,
  stopAllAudio,
} from "@/lib/audio/audioEngine";

export function useWebAudio() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    return () => stopAllAudio();
  }, []);

  const toggleObject = useCallback(
    (id: number, objectName: string, volume: number, isActive: boolean) => {
      if (isActive) {
        deactivateObjectAudio(id);
      } else {
        activateObjectAudio(id, objectName, volume);
      }
    },
    []
  );

  const changeVolume = useCallback((id: number, volume: number) => {
    setObjectVolume(id, volume);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setMasterMuted(next);
      return next;
    });
  }, []);

  return { isMuted, toggleObject, changeVolume, toggleMute };
}
