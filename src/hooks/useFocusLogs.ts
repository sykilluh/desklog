"use client";

import { useCallback } from "react";

export function useFocusLogs(onLogged?: () => void) {
  const logFocusSeconds = useCallback(
    async (focusDuration: number, audioPresetName?: string) => {
      await fetch("/api/focus-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusDuration, audioPresetName }),
      });
      onLogged?.();
    },
    [onLogged]
  );

  const fetchTodaySeconds = useCallback(async () => {
    const res = await fetch("/api/focus-logs");
    const json = await res.json();
    return json.ok ? (json.data.todaySeconds as number) : 0;
  }, []);

  return { logFocusSeconds, fetchTodaySeconds };
}
