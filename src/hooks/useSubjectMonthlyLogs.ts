"use client";

import { useCallback, useEffect, useState } from "react";

export interface SubjectMonthlyDTO {
  subjectName: string;
  totalSeconds: number;
  days: Array<{ date: string; seconds: number }>;
}

export function useSubjectMonthlyLogs(year: number, month: number) {
  const [subjects, setSubjects] = useState<SubjectMonthlyDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/focus-sessions/subjects?year=${year}&month=${month}`);
    const json = await res.json();
    if (json.ok) setSubjects(json.data.subjects);
    setIsLoading(false);
  }, [year, month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const editDay = useCallback(
    async (subjectName: string, date: string, seconds: number) => {
      const res = await fetch("/api/focus-sessions/subjects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName, date, seconds }),
      });
      const json = await res.json();
      if (json.ok) await refresh();
      return json;
    },
    [refresh]
  );

  return { subjects, isLoading, refresh, editDay };
}
