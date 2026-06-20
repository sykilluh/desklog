"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const POMODORO_FOCUS_SECONDS = 25 * 60;
const POMODORO_BREAK_SECONDS = 5 * 60;

export type TimerMode = "pomodoro" | "stopwatch";
export type TimerPhase = "focus" | "break";

export function useFocusTimer(onFocusComplete: (focusSeconds: number) => void) {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [phase, setPhase] = useState<TimerPhase>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(POMODORO_FOCUS_SECONDS);
  const focusElapsedRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (mode === "stopwatch") {
          focusElapsedRef.current += 1;
          return prev + 1;
        }

        if (prev <= 1) {
          if (phase === "focus") {
            focusElapsedRef.current += 1;
            onFocusComplete(POMODORO_FOCUS_SECONDS);
            focusElapsedRef.current = 0;
            setPhase("break");
            return POMODORO_BREAK_SECONDS;
          }
          setPhase("focus");
          return POMODORO_FOCUS_SECONDS;
        }

        if (phase === "focus") focusElapsedRef.current += 1;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, phase, onFocusComplete]);

  const switchMode = useCallback((nextMode: TimerMode) => {
    setIsRunning(false);
    setMode(nextMode);
    setPhase("focus");
    focusElapsedRef.current = 0;
    setSeconds(nextMode === "pomodoro" ? POMODORO_FOCUS_SECONDS : 0);
  }, []);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase("focus");
    focusElapsedRef.current = 0;
    setSeconds(mode === "pomodoro" ? POMODORO_FOCUS_SECONDS : 0);
  }, [mode]);

  const stopAndLog = useCallback(() => {
    setIsRunning(false);
    if (focusElapsedRef.current > 0) {
      onFocusComplete(focusElapsedRef.current);
    }
    focusElapsedRef.current = 0;
    setPhase("focus");
    setSeconds(mode === "pomodoro" ? POMODORO_FOCUS_SECONDS : 0);
  }, [mode, onFocusComplete]);

  return { mode, phase, isRunning, seconds, switchMode, start, pause, reset, stopAndLog };
}
