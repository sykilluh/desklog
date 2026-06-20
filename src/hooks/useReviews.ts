"use client";

import { useCallback, useEffect, useState } from "react";
import type { BookReviewDTO, BookReviewInput } from "@/types/review";

export function useReviews() {
  const [reviews, setReviews] = useState<BookReviewDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/reviews");
    const json = await res.json();
    if (json.ok) setReviews(json.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addReview = useCallback(async (input: BookReviewInput) => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (json.ok) setReviews((prev) => [json.data, ...prev]);
    return json;
  }, []);

  const editReview = useCallback(async (id: number, input: Partial<BookReviewInput>) => {
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (json.ok) setReviews((prev) => prev.map((r) => (r.id === id ? json.data : r)));
    return json;
  }, []);

  const removeReview = useCallback(async (id: number) => {
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
    return json;
  }, []);

  return { reviews, isLoading, addReview, editReview, removeReview };
}
