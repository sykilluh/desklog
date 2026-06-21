"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface FocusSessionDTO {
  id: number;
  name: string;
  totalSeconds: number;
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

  const createSession = useCallback(async (name: string) => {
    const res = await fetch("/api/focus-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (json.ok) {
      setSessions((prev) => [json.data, ...prev]);
      return json.data as FocusSessionDTO;
    }
    return null;
  }, []);

  const addSeconds = useCallback(async (id: number, seconds: number) => {
    const res = await fetch(`/api/focus-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addSeconds: seconds }),
    });
    const json = await res.json();
    if (json.ok) setSessions((prev) => prev.map((s) => (s.id === id ? json.data : s)));
  }, []);

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
    () => ({ sessions, isLoading, refresh, createSession, addSeconds, renameSession, setCompleted, deleteSession }),
    [sessions, isLoading, refresh, createSession, addSeconds, renameSession, setCompleted, deleteSession]
  );
}
