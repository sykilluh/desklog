"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { POMODORO_PRESETS, useFocusTimer } from "@/hooks/useFocusTimer";
import { useFocusSessions, type FocusSessionDTO } from "@/hooks/useFocusSessions";

const ACTIVE_SESSION_KEY = "desklog:activeFocusSessionId";

interface FocusTimerContextValue extends ReturnType<typeof useFocusTimer> {
  todayFocusSeconds: number;
  refreshTodayFocus: () => Promise<void>;
  sessions: FocusSessionDTO[];
  activeSessionId: number | null;
  activeSessionName: string | null;
  /** Create a brand-new named record (e.g. "수학 숙제") and start the timer against it. */
  startNewSession: (name: string) => Promise<void>;
  /** Resume a previously saved, unfinished record and start the timer against it. */
  resumeSession: (session: FocusSessionDTO) => void;
  /** Start the timer with no named record attached (today's total still counts). */
  startWithoutSession: () => void;
  /** Resume the currently-active (paused) named session without detaching it. */
  continueActiveSession: () => void;
  /** Pause and bank whatever's accumulated so far onto the active named record. */
  pauseSession: () => void;
  /** Clears which record is "active" (e.g. after 종료·기록) without deleting it — it stays available to resume later. */
  clearActiveSession: () => void;
  deleteSession: (id: number) => Promise<void>;
  renameSession: (id: number, name: string) => Promise<void>;
  setSessionCompleted: (id: number, isCompleted: boolean) => Promise<void>;
  dailyFocusSeconds: Array<{ date: string; seconds: number }>;
  refreshDailyFocus: () => Promise<void>;
}

const FocusTimerContext = createContext<FocusTimerContextValue | null>(null);

export default function FocusTimerProvider({ children }: { children: React.ReactNode }) {
  const [todayFocusSeconds, setTodayFocusSeconds] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [activeSessionName, setActiveSessionName] = useState<string | null>(null);
  const [dailyFocusSeconds, setDailyFocusSeconds] = useState<Array<{ date: string; seconds: number }>>([]);
  // Single shared instance — FocusRecordsPanel used to call useFocusSessions()
  // again on its own, which meant it had its own copy of `sessions` that never
  // learned about addSeconds() calls made through this provider (e.g. on
  // pause/stop). The displayed total just sat at whatever it was on that
  // panel's own initial fetch (0 for a freshly created record) forever.
  const focusSessions = useFocusSessions();

  useEffect(() => {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) setActiveSessionId(Number(raw));
  }, []);

  // Keep the displayed name in sync once the session list has loaded — and if
  // the active id no longer exists there (e.g. deleted, or a stale id left
  // over in localStorage from testing), drop it. Otherwise every pause/stop
  // would keep silently PATCHing a session that's gone, which looks exactly
  // like "saving does nothing".
  useEffect(() => {
    if (activeSessionId == null || focusSessions.isLoading) return;
    const found = focusSessions.sessions.find((s) => s.id === activeSessionId);
    if (found) setActiveSessionName(found.name);
    else {
      setActiveSessionId(null);
      setActiveSessionName(null);
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }, [activeSessionId, focusSessions.sessions, focusSessions.isLoading]);

  const refreshTodayFocus = useCallback(async () => {
    const res = await fetch("/api/focus-logs");
    const json = await res.json();
    if (json.ok) setTodayFocusSeconds(json.data.todaySeconds);
  }, []);

  const refreshDailyFocus = useCallback(async () => {
    const res = await fetch("/api/focus-logs/daily?days=14");
    const json = await res.json();
    if (json.ok) setDailyFocusSeconds(json.data);
  }, []);

  const logFocusSeconds = useCallback(
    async (focusDuration: number, audioPresetName?: string) => {
      await fetch("/api/focus-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusDuration, audioPresetName }),
      });
      refreshTodayFocus();
      refreshDailyFocus();
      if (activeSessionId) focusSessions.addSeconds(activeSessionId, focusDuration);
    },
    [refreshTodayFocus, refreshDailyFocus, activeSessionId, focusSessions]
  );

  const timer = useFocusTimer(logFocusSeconds);

  useEffect(() => {
    refreshTodayFocus();
    refreshDailyFocus();
  }, [refreshTodayFocus, refreshDailyFocus]);

  const setActiveSession = useCallback((id: number | null, name: string | null) => {
    setActiveSessionId(id);
    setActiveSessionName(name);
    if (id == null) window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    else window.localStorage.setItem(ACTIVE_SESSION_KEY, String(id));
  }, []);

  const startNewSession = useCallback(
    async (name: string) => {
      const created = await focusSessions.createSession(name);
      if (created) setActiveSession(created.id, created.name);
      timer.start();
    },
    [focusSessions, setActiveSession, timer]
  );

  const resumeSession = useCallback(
    (session: FocusSessionDTO) => {
      setActiveSession(session.id, session.name);
      timer.start();
    },
    [setActiveSession, timer]
  );

  // Resumes whatever session is already marked active (e.g. after a pause)
  // without touching activeSessionId — startWithoutSession would wipe it,
  // which silently detached a paused, named record from the timer the
  // moment "시작" was pressed again with an empty name field.
  const continueActiveSession = useCallback(() => {
    timer.start();
  }, [timer]);

  const startWithoutSession = useCallback(() => {
    setActiveSession(null, null);
    timer.start();
  }, [setActiveSession, timer]);

  const pauseSession = useCallback(() => {
    timer.pause();
    const elapsed = timer.flushFocusElapsed();
    // Route through logFocusSeconds (not focusSessions.addSeconds directly) so a
    // plain pause still saves to today's focus log — previously this only banked
    // time onto a named session, and only when one was active. Since flushing
    // always zeroes the internal counter, pausing an unnamed run (or pausing
    // before naming one) silently discarded that time forever: a later "종료·저장"
    // had nothing left to save.
    if (elapsed > 0) logFocusSeconds(elapsed);
  }, [timer, logFocusSeconds]);

  const clearActiveSession = useCallback(() => {
    setActiveSession(null, null);
  }, [setActiveSession]);

  const deleteSession = useCallback(
    async (id: number) => {
      await focusSessions.deleteSession(id);
      if (activeSessionId === id) setActiveSession(null, null);
    },
    [focusSessions, activeSessionId, setActiveSession]
  );

  return (
    <FocusTimerContext.Provider
      value={{
        ...timer,
        todayFocusSeconds,
        refreshTodayFocus,
        sessions: focusSessions.sessions,
        activeSessionId,
        activeSessionName,
        startNewSession,
        resumeSession,
        startWithoutSession,
        continueActiveSession,
        pauseSession,
        clearActiveSession,
        deleteSession,
        renameSession: focusSessions.renameSession,
        setSessionCompleted: focusSessions.setCompleted,
        dailyFocusSeconds,
        refreshDailyFocus,
      }}
    >
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
