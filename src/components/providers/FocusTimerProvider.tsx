"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { POMODORO_PRESETS, useFocusTimer } from "@/hooks/useFocusTimer";

interface FocusTimerContextValue extends ReturnType<typeof useFocusTimer> {
  todayFocusSeconds: number;
  refreshTodayFocus: () => Promise<void>;
}

const FocusTimerContext = createContext<FocusTimerContextValue | null>(null);

export default function FocusTimerProvider({ children }: { children: React.ReactNode }) {
  const [todayFocusSeconds, setTodayFocusSeconds] = useState(0);

  const refreshTodayFocus = useCallback(async () => {
    const res = await fetch("/api/focus-logs");
    const json = await res.json();
    if (json.ok) setTodayFocusSeconds(json.data.todaySeconds);
  }, []);

  const logFocusSeconds = useCallback(
    async (focusDuration: number, audioPresetName?: string) => {
      await fetch("/api/focus-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusDuration, audioPresetName }),
      });
      refreshTodayFocus();
    },
    [refreshTodayFocus]
  );

  const timer = useFocusTimer(logFocusSeconds);

  useEffect(() => {
    refreshTodayFocus();
  }, [refreshTodayFocus]);

  return (
    <FocusTimerContext.Provider value={{ ...timer, todayFocusSeconds, refreshTodayFocus }}>
      {children}
    </FocusTimerContext.Provider>
  );
}

export function useGlobalFocusTimer() {
  const context = useContext(FocusTimerContext);
  if (!context) {
    throw new Error("useGlobalFocusTimer는 FocusTimerProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

export { POMODORO_PRESETS };
