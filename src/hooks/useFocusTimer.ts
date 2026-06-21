"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const POMODORO_PRESETS = [
  { focusMinutes: 25, breakMinutes: 5 },
  { focusMinutes: 45, breakMinutes: 10 },
  { focusMinutes: 60, breakMinutes: 15 },
  { focusMinutes: 90, breakMinutes: 20 },
];

export type TimerMode = "pomodoro" | "stopwatch";
export type TimerPhase = "focus" | "break";

// v2: an earlier bug used to persist a fast-forwarded `seconds` that could
// collapse to 0 and get saved that way. Bumping the key throws away any
// already-corrupted v1 entry sitting in a user's localStorage instead of
// restoring it forever.
const STORAGE_KEY = "desklog:focusTimerState:v2";

interface PersistedTimerState {
  mode: TimerMode;
  phase: TimerPhase;
  preset: { focusMinutes: number; breakMinutes: number };
  isRunning: boolean;
  seconds: number;
  focusElapsedSeconds: number;
}

function loadPersistedState(): PersistedTimerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedTimerState;
  } catch {
    return null;
  }
}

function savePersistedState(state: PersistedTimerState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (e.g. private mode) - persistence is best-effort.
  }
}

export function useFocusTimer(onFocusComplete: (focusSeconds: number) => void) {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [phase, setPhase] = useState<TimerPhase>("focus");
  const [preset, setPreset] = useState(POMODORO_PRESETS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(POMODORO_PRESETS[0].focusMinutes * 60);
  const focusElapsedRef = useRef(0);
  const restoredRef = useRef(false);
  // Mirrors `seconds` so the catch-up tick (run synchronously from
  // pause/stopAndLog, outside the normal setInterval) can read/write the
  // current countdown immediately — going through setSeconds's functional
  // updater there would defer the computation until React's next render,
  // so focusElapsedRef wouldn't be caught up yet when stopAndLog reads it
  // right after.
  const secondsRef = useRef(seconds);
  // Mirrors `phase` for the same reason as secondsRef — stopAndLog needs the
  // phase as of the just-ran catch-up tick, synchronously, to snapshot it
  // for resuming later (setPhase's update wouldn't be visible yet).
  const phaseRef = useRef(phase);

  // Restore persisted state after mount only (not during render), so the client's
  // first render matches the server-rendered HTML and avoids a hydration mismatch.
  //
  // Always restore as paused, with whatever `seconds` was last saved — no
  // attempt to fast-forward by the real-world gap since the last tick.
  // That fast-forward used to subtract the full elapsed wall-clock time from
  // the countdown, so even a routine remount (tab refocus, page nav, dev
  // Fast Refresh) long after the last tick could blow straight through the
  // remaining time and collapse it to 0 — the "keeps resetting to 0" bug.
  // Resuming exactly where it was left, manually, is predictable instead.
  useEffect(() => {
    const initial = loadPersistedState();
    if (initial) {
      setMode(initial.mode);
      setPhase(initial.phase);
      phaseRef.current = initial.phase;
      setPreset(initial.preset);
      setIsRunning(false);
      // A pomodoro countdown should never be sitting at 0 while paused — the
      // interval always moves off 0 the instant it ticks. If it's 0 here, the
      // saved state is stale/corrupt; fall back to a full phase duration
      // instead of showing a dead 00:00 timer.
      const fallback = initial.phase === "focus" ? initial.preset.focusMinutes * 60 : initial.preset.breakMinutes * 60;
      const restoredSeconds = initial.mode === "pomodoro" && initial.seconds <= 0 ? fallback : initial.seconds;
      setSeconds(restoredSeconds);
      secondsRef.current = restoredSeconds;
      focusElapsedRef.current = initial.focusElapsedSeconds;
    }
    restoredRef.current = true;
  }, []);

  // setInterval ticks are throttled hard by browsers once a tab is
  // backgrounded (often to ~once/minute) — counting "+1 per tick" under that
  // throttling barely advances the clock at all, so a session run mostly in a
  // background tab would log close to 0 seconds even though real time had
  // passed. Tracking the actual wall-clock gap (via Date.now()) instead of
  // tick count, and re-syncing on visibilitychange the instant the tab comes
  // back, makes the elapsed time correct regardless of how delayed the ticks
  // were.
  const lastTickRef = useRef<number>(Date.now());

  // Pulled out of the interval effect so pause/stop/flush can call it directly
  // before reading focusElapsedRef — without this, stopping less than a second
  // after the last 1s interval tick (e.g. a quick start-then-save) read a ref
  // that hadn't caught up yet and always saved 0, even though real time had
  // passed.
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    tickRef.current = () => {
      const now = Date.now();
      const elapsedSeconds = Math.round((now - lastTickRef.current) / 1000);
      if (elapsedSeconds <= 0) return;
      lastTickRef.current = now;

      // Computed synchronously against secondsRef/focusElapsedRef (not via a
      // setSeconds functional updater) so a caller like stopAndLog can read
      // focusElapsedRef immediately after calling this, without waiting for
      // React to process a deferred state update first.
      let nextSeconds = secondsRef.current;
      let nextPhase = phaseRef.current;

      if (mode === "stopwatch") {
        focusElapsedRef.current += elapsedSeconds;
        nextSeconds = secondsRef.current + elapsedSeconds;
      } else {
        let remaining = elapsedSeconds;
        let safety = 0;
        while (remaining > 0 && safety < 10000) {
          safety++;
          if (nextPhase === "focus") {
            if (remaining < nextSeconds) {
              focusElapsedRef.current += remaining;
              nextSeconds -= remaining;
              remaining = 0;
            } else {
              focusElapsedRef.current += nextSeconds;
              remaining -= nextSeconds;
              onFocusComplete(preset.focusMinutes * 60);
              focusElapsedRef.current = 0;
              nextPhase = "break";
              nextSeconds = preset.breakMinutes * 60;
            }
          } else {
            if (remaining < nextSeconds) {
              nextSeconds -= remaining;
              remaining = 0;
            } else {
              remaining -= nextSeconds;
              nextPhase = "focus";
              nextSeconds = preset.focusMinutes * 60;
            }
          }
        }
      }

      secondsRef.current = nextSeconds;
      setSeconds(nextSeconds);
      if (nextPhase !== phaseRef.current) {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
      }
      savePersistedState({
        mode,
        phase: nextPhase,
        preset,
        isRunning: true,
        seconds: nextSeconds,
        focusElapsedSeconds: focusElapsedRef.current,
      });
    };
  }, [mode, phase, preset, onFocusComplete]);

  useEffect(() => {
    if (!restoredRef.current) return;
    if (!isRunning) {
      savePersistedState({
        mode,
        phase,
        preset,
        isRunning,
        seconds,
        focusElapsedSeconds: focusElapsedRef.current,
      });
      return;
    }

    lastTickRef.current = Date.now();

    function tick() {
      tickRef.current();
    }

    const interval = setInterval(tick, 1000);
    function handleVisibility() {
      if (document.visibilityState === "visible") tick();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Both guarded against isRunning — switching mode/preset wipes
  // focusElapsedRef and the countdown. Without this guard, an accidental
  // click mid-session (the UI already disables these buttons while running,
  // but this is a backstop) silently threw away whatever time had been
  // accumulated, so the next save logged 0 even though real time had passed.
  const switchMode = useCallback(
    (nextMode: TimerMode) => {
      if (isRunning) return;
      setMode(nextMode);
      setPhase("focus");
      phaseRef.current = "focus";
      focusElapsedRef.current = 0;
      const next = nextMode === "pomodoro" ? preset.focusMinutes * 60 : 0;
      secondsRef.current = next;
      setSeconds(next);
    },
    [preset, isRunning]
  );

  const selectPreset = useCallback(
    (nextPreset: { focusMinutes: number; breakMinutes: number }) => {
      if (isRunning) return;
      setPreset(nextPreset);
      setPhase("focus");
      phaseRef.current = "focus";
      focusElapsedRef.current = 0;
      secondsRef.current = nextPreset.focusMinutes * 60;
      setSeconds(nextPreset.focusMinutes * 60);
    },
    [isRunning]
  );

  const start = useCallback(() => setIsRunning(true), []);

  const pause = useCallback(() => {
    if (isRunning) tickRef.current();
    setIsRunning(false);
  }, [isRunning]);

  // Returns the focus seconds accumulated since the last flush/reset and
  // zeroes the counter, without touching the running phase/countdown — lets
  // a caller (e.g. a named, resumable session) bank partial progress on a
  // plain pause, separately from the pomodoro/stopwatch's own completion
  // bookkeeping (onFocusComplete/stopAndLog).
  const flushFocusElapsed = useCallback(() => {
    const elapsed = focusElapsedRef.current;
    focusElapsedRef.current = 0;
    return elapsed;
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase("focus");
    phaseRef.current = "focus";
    focusElapsedRef.current = 0;
    const next = mode === "pomodoro" ? preset.focusMinutes * 60 : 0;
    secondsRef.current = next;
    setSeconds(next);
  }, [mode, preset]);

  const stopAndLog = useCallback(() => {
    // Catch up on any partial second since the last 1s interval tick — without
    // this, stopping right after starting (before the first tick lands) always
    // read focusElapsedRef as 0 and saved nothing.
    if (isRunning) tickRef.current();
    setIsRunning(false);
    if (focusElapsedRef.current > 0) {
      onFocusComplete(focusElapsedRef.current);
    }
    focusElapsedRef.current = 0;
    // Snapshot the position right before resetting it — this is what lets a
    // caller persist "23 minutes remaining" or "1분 20초 elapsed" onto a
    // named record so resuming it later restores exactly this spot instead
    // of a fresh countdown/0:00.
    const snapshot = { seconds: secondsRef.current, phase: phaseRef.current };
    setPhase("focus");
    phaseRef.current = "focus";
    const next = mode === "pomodoro" ? preset.focusMinutes * 60 : 0;
    secondsRef.current = next;
    setSeconds(next);
    return snapshot;
  }, [mode, preset, onFocusComplete, isRunning]);

  // Restores a previously-saved position (from stopAndLog's snapshot) onto
  // the live timer — used when resuming a record instead of starting it at
  // a fresh full preset / 0:00.
  const loadSavedProgress = useCallback(
    (savedSeconds: number, savedPhase: TimerPhase, savedPreset: { focusMinutes: number; breakMinutes: number }) => {
      setIsRunning(false);
      setPreset(savedPreset);
      setPhase(savedPhase);
      phaseRef.current = savedPhase;
      focusElapsedRef.current = 0;
      const next = Math.max(0, Math.round(savedSeconds));
      secondsRef.current = next;
      setSeconds(next);
    },
    []
  );

  return {
    mode,
    phase,
    preset,
    isRunning,
    seconds,
    switchMode,
    selectPreset,
    loadSavedProgress,
    start,
    pause,
    reset,
    stopAndLog,
    flushFocusElapsed,
  };
}
