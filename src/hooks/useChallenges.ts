"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChallengeDTO, ChallengeInput } from "@/types/challenge";

export function useChallenges() {
  const [challenges, setChallenges] = useState<ChallengeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/challenges");
    const json = await res.json();
    if (json.ok) setChallenges(json.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createChallenge = useCallback(
    async (input: ChallengeInput) => {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (json.ok) setChallenges((prev) => [json.data, ...prev]);
      return json;
    },
    []
  );

  const updateProgress = useCallback(async (id: number, currentPages: number) => {
    const res = await fetch(`/api/challenges/${id}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPages }),
    });
    const json = await res.json();
    if (json.ok) {
      setChallenges((prev) => prev.map((c) => (c.id === id ? json.data : c)));
    }
    return json;
  }, []);

  return { challenges, isLoading, createChallenge, updateProgress };
}
