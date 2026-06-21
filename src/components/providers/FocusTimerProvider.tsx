"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  /** Start the timer with no name typed in — still creates a record (auto-named "timeN"). */
  startWithoutSession: () => void;
  /** Give the currently-active (auto-named or otherwise) record a real name without losing its accumulated time. */
  nameActiveSession: (name: string) => Promise<void>;
  /** Resume the currently-active (paused) named session without detaching it. */
  continueActiveSession: () => void;
  /** Pause and bank whatever's accumulated so far onto the active named record. */
  pauseSession: () => void;
  /** Clears which record is "active" (e.g. after 종료·기록) without deleting it — it stays available to resume later. */
  clearActiveSession: () => void;
  /** The "종료·저장" action — banks elapsed time, snapshots the exact timer position onto the record, and detaches it. */
  stopAndSaveSession: () => Promise<void>;
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
  const [dailyFocusSeconds, setDailyFocusSeconds] = useState<Array<{ date: string; seconds: number }>>([]);
  // Single shared instance — FocusRecordsPanel used to call useFocusSessions()
  // again on its own, which meant it had its own copy of `sessions` that never
  // learned about addSeconds() calls made through this provider (e.g. on
  // pause/stop). The displayed total just sat at whatever it was on that
  // panel's own initial fetch (0 for a freshly created record) forever.
  const focusSessions = useFocusSessions();

  // Derived, not separately tracked — renaming the active session from the
  // diary list (FocusRecordsPanel) updates `sessions` directly; if the name
  // were copied into its own state at start/resume time, that edit wouldn't
  // show up here until the next start/resume.
  const activeSessionName = useMemo(() => {
    if (activeSessionId == null) return null;
    return focusSessions.sessions.find((s) => s.id === activeSessionId)?.name ?? null;
  }, [activeSessionId, focusSessions.sessions]);

  useEffect(() => {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) setActiveSessionId(Number(raw));
  }, []);

  // Drop the active id if it no longer exists in the loaded list (e.g.
  // deleted, or a stale id left over in localStorage from testing).
  // Otherwise every pause/stop would keep silently PATCHing a session that's
  // gone, which looks exactly like "saving does nothing".
  useEffect(() => {
    if (activeSessionId == null || focusSessions.isLoading) return;
    const found = focusSessions.sessions.some((s) => s.id === activeSessionId);
    if (!found) {
      setActiveSessionId(null);
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

  const setActiveSession = useCallback((id: number | null) => {
    setActiveSessionId(id);
    if (id == null) window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    else window.localStorage.setItem(ACTIVE_SESSION_KEY, String(id));
  }, []);

  const startNewSession = useCallback(
    async (name: string) => {
      const created = await focusSessions.createSession(name, timer.mode, timer.preset);
      if (created) setActiveSession(created.id);
      timer.start();
    },
    [focusSessions, setActiveSession, timer]
  );

  const resumeSession = useCallback(
    (session: FocusSessionDTO) => {
      // A session is locked to whichever mode it was created under — 뽀모도로
      // and 타이머(스톱워치) count time in different units, so resuming must
      // force the timer back into that mode rather than let it keep
      // whatever mode happens to be selected right now.
      //
      // Restores the exact spot it was left at (remaining countdown for a
      // pomodoro record, elapsed count for a stopwatch one) instead of
      // starting over from a fresh preset / 0:00 — lastSeconds is 0 only for
      // a record that's never been stopped·저장 yet, in which case there's
      // nothing to restore and a plain mode/preset switch is enough.
      if (session.mode !== timer.mode) timer.switchMode(session.mode);

      const preset = { focusMinutes: session.presetFocusMinutes, breakMinutes: session.presetBreakMinutes };
      if (session.lastSeconds > 0) {
        timer.loadSavedProgress(session.lastSeconds, session.lastPhase, preset);
      } else if (session.mode === "pomodoro" && preset.focusMinutes !== timer.preset.focusMinutes) {
        timer.selectPreset(preset);
      }
      setActiveSession(session.id);
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

  // Starting with no name still creates a record (the server auto-names it
  // "time1", "time2", ...) instead of leaving the run completely untracked —
  // so it shows up in the diary and can be renamed later from there or from
  // FocusTimer's inline name field while it's running.
  const startWithoutSession = useCallback(async () => {
    const created = await focusSessions.createSession("", timer.mode, timer.preset);
    if (created) setActiveSession(created.id);
    timer.start();
  }, [focusSessions, setActiveSession, timer]);

  // Lets a run that was started anonymously (no name typed before pressing
  // 시작) get a real name once one occurs to you, without losing whatever
  // time has already accumulated under the auto "timeN" name — renames the
  // already-created session in place instead of starting a second one.
  const nameActiveSession = useCallback(
    async (name: string) => {
      if (activeSessionId == null || !name.trim()) return;
      await focusSessions.renameSession(activeSessionId, name.trim());
    },
    [activeSessionId, focusSessions]
  );

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
    setActiveSession(null);
  }, [setActiveSession]);

  // The "종료·저장" action: banks the elapsed focus time as usual, but also
  // snapshots exactly where the live timer was (remaining countdown for
  // pomodoro, elapsed count for stopwatch) onto the active record so the
  // next "이어하기" restores that same spot instead of a fresh start.
  const stopAndSaveSession = useCallback(async () => {
    const sessionId = activeSessionId;
    const presetAtStop = timer.preset;
    const { seconds: lastSeconds, phase: lastPhase } = timer.stopAndLog();
    if (sessionId) {
      await focusSessions.saveProgress(sessionId, {
        lastSeconds,
        lastPhase,
        presetFocusMinutes: presetAtStop.focusMinutes,
        presetBreakMinutes: presetAtStop.breakMinutes,
      });
    }
    clearActiveSession();
  }, [activeSessionId, timer, focusSessions, clearActiveSession]);

  const deleteSession = useCallback(
    async (id: number) => {
      await focusSessions.deleteSession(id);
      if (activeSessionId === id) setActiveSession(null);
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
        nameActiveSession,
        continueActiveSession,
        pauseSession,
        clearActiveSession,
        stopAndSaveSession,
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
