"use client";

import { useCallback } from "react";

export function useFocusLogs() {
  const logFocusSeconds = useCallback(async (focusDuration: number, audioPresetName?: string) => {
    await fetch("/api/focus-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focusDuration, audioPresetName }),
    });
  }, []);

  return { logFocusSeconds };
}
