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

export function useFocusTimer(onFocusComplete: (focusSeconds: number) => void) {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [phase, setPhase] = useState<TimerPhase>("focus");
  const [preset, setPreset] = useState(POMODORO_PRESETS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(POMODORO_PRESETS[0].focusMinutes * 60);
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
            onFocusComplete(preset.focusMinutes * 60);
            focusElapsedRef.current = 0;
            setPhase("break");
            return preset.breakMinutes * 60;
          }
          setPhase("focus");
          return preset.focusMinutes * 60;
        }

        if (phase === "focus") focusElapsedRef.current += 1;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, phase, preset, onFocusComplete]);

  const switchMode = useCallback(
    (nextMode: TimerMode) => {
      setIsRunning(false);
      setMode(nextMode);
      setPhase("focus");
      focusElapsedRef.current = 0;
      setSeconds(nextMode === "pomodoro" ? preset.focusMinutes * 60 : 0);
    },
    [preset]
  );

  const selectPreset = useCallback(
    (nextPreset: { focusMinutes: number; breakMinutes: number }) => {
      setIsRunning(false);
      setPreset(nextPreset);
      setPhase("focus");
      focusElapsedRef.current = 0;
      setSeconds(nextPreset.focusMinutes * 60);
    },
    []
  );

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase("focus");
    focusElapsedRef.current = 0;
    setSeconds(mode === "pomodoro" ? preset.focusMinutes * 60 : 0);
  }, [mode, preset]);

  const stopAndLog = useCallback(() => {
    setIsRunning(false);
    if (focusElapsedRef.current > 0) {
      onFocusComplete(focusElapsedRef.current);
    }
    focusElapsedRef.current = 0;
    setPhase("focus");
    setSeconds(mode === "pomodoro" ? preset.focusMinutes * 60 : 0);
  }, [mode, preset, onFocusComplete]);

  return {
    mode,
    phase,
    preset,
    isRunning,
    seconds,
    switchMode,
    selectPreset,
    start,
    pause,
    reset,
    stopAndLog,
  };
}
