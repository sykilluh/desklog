"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface FocusSessionDTO {
  id: number;
  name: string;
  /** Fixed at creation — 뽀모도로/타이머는 단위가 달라서 한 레코드가 모드를 넘나들며
   * 누적되지 않도록, 이어하기 시에도 이 모드로 강제된다. */
  mode: "pomodoro" | "stopwatch";
  totalSeconds: number;
  /** Live-timer snapshot at the last 종료·저장 — remaining countdown (pomodoro)
   * or elapsed count (stopwatch), restored exactly on resume. */
  lastSeconds: number;
  lastPhase: "focus" | "break";
  presetFocusMinutes: number;
  presetBreakMinutes: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useFocusSessions() {
  const [sessions, setSessions] = useState<FocusSessionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/focus-sessions");
    const json = await res.json();
    if (json.ok) setSessions(json.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createSession = useCallback(
    async (
      name: string,
      mode: "pomodoro" | "stopwatch" = "pomodoro",
      preset?: { focusMinutes: number; breakMinutes: number }
    ) => {
      const res = await fetch("/api/focus-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mode, preset }),
      });
      const json = await res.json();
      if (json.ok) {
        setSessions((prev) => [json.data, ...prev]);
        return json.data as FocusSessionDTO;
      }
      return null;
    },
    []
  );

  const addSeconds = useCallback(async (id: number, seconds: number) => {
    const res = await fetch(`/api/focus-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addSeconds: seconds }),
    });
    const json = await res.json();
    if (json.ok) setSessions((prev) => prev.map((s) => (s.id === id ? json.data : s)));
  }, []);

  /** Persists the live timer's exact position so resuming later restores it
   * instead of restarting the full preset / 0:00. */
  const saveProgress = useCallback(
    async (
      id: number,
      data: { lastSeconds: number; lastPhase: "focus" | "break"; presetFocusMinutes: number; presetBreakMinutes: number }
    ) => {
      const res = await fetch(`/api/focus-sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) setSessions((prev) => prev.map((s) => (s.id === id ? json.data : s)));
    },
    []
  );

  const renameSession = useCallback(async (id: number, name: string) => {
    const res = await fetch(`/api/focus-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (json.ok) setSessions((prev) => prev.map((s) => (s.id === id ? json.data : s)));
  }, []);

  const setCompleted = useCallback(async (id: number, isCompleted: boolean) => {
    const res = await fetch(`/api/focus-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted }),
    });
    const json = await res.json();
    if (json.ok) setSessions((prev) => prev.map((s) => (s.id === id ? json.data : s)));
  }, []);

  const deleteSession = useCallback(async (id: number) => {
    await fetch(`/api/focus-sessions/${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Memoized so consumers (like FocusTimerProvider, whose own `seconds`
  // state re-renders every tick) get a stable reference instead of a new
  // object every render — otherwise anything depending on "the sessions
  // API" (e.g. the timer's interval effect) tears down and rebuilds once a
  // second for no reason.
  return useMemo(
    () => ({
      sessions,
      isLoading,
      refresh,
      createSession,
      addSeconds,
      saveProgress,
      renameSession,
      setCompleted,
      deleteSession,
    }),
    [sessions, isLoading, refresh, createSession, addSeconds, saveProgress, renameSession, setCompleted, deleteSession]
  );
}
