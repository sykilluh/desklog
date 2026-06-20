"use client";

import { useCallback, useEffect, useState } from "react";
import type { DeskObjectDTO, DeskObjectInput } from "@/types/desk";

export function useDeskObjects() {
  const [objects, setObjects] = useState<DeskObjectDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/desks/objects");
    const json = await res.json();
    if (json.ok) setObjects(json.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (next: DeskObjectInput[]) => {
    setIsSaving(true);
    const res = await fetch("/api/desks/objects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objects: next }),
    });
    const json = await res.json();
    if (json.ok) setObjects(json.data);
    setIsSaving(false);
    return json;
  }, []);

  return { objects, setObjects, isLoading, isSaving, load, save };
}
