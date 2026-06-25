"use client";

import { useCallback, useEffect, useState } from "react";

export type AnalyticsPeriod = "weekly" | "monthly";

export interface FocusAnalyticsDTO {
  daily: Array<{ date: string; seconds: number }>;
  totalSeconds: number;
  averageSeconds: number;
  goalMinutes: number;
  goalAchievementRate: number;
  goalMetDays: number;
  periodDays: number;
  streakDays: number;
  weeklyMedals: Array<{
    weekStart: string;
    weekEnd: string;
    medal: "gold" | "silver" | "bronze" | null;
    achievementRate: number;
    totalSeconds: number;
  }>;
}

export function useFocusAnalytics(period: AnalyticsPeriod) {
  const [data, setData] = useState<FocusAnalyticsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/focus-logs/analytics?period=${period}`);
    const json = await res.json();
    if (json.ok) setData(json.data);
    setIsLoading(false);
  }, [period]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setGoal = useCallback(
    async (goalMinutes: number) => {
      const res = await fetch("/api/focus-logs/analytics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalMinutes }),
      });
      const json = await res.json();
      if (json.ok) refresh();
      return json;
    },
    [refresh]
  );

  return { data, isLoading, refresh, setGoal };
}
