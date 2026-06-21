"use client";

import { useCallback, useEffect, useState } from "react";

export function useDeskSetting() {
  const [backgroundId, setBackgroundId] = useState("default");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/desks/settings");
      const json = await res.json();
      if (json.ok) {
        setBackgroundId(json.data.backgroundId ?? "default");
        setBackgroundImage(json.data.backgroundImage ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveBackground = useCallback(async (next: string) => {
    setBackgroundId(next);
    setBackgroundImage(null);
    const res = await fetch("/api/desks/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backgroundId: next, backgroundImage: null }),
    });
    return res.json();
  }, []);

  const saveBackgroundImage = useCallback(async (dataUrl: string) => {
    setBackgroundId("custom");
    setBackgroundImage(dataUrl);
    const res = await fetch("/api/desks/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backgroundId: "custom", backgroundImage: dataUrl }),
    });
    return res.json();
  }, []);

  return { backgroundId, backgroundImage, isLoading, setBackground: saveBackground, setBackgroundImage: saveBackgroundImage };
}
