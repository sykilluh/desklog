"use client";

import { useCallback, useEffect, useState } from "react";
import type { TodoDTO } from "@/types/todo";

export function useTodos() {
  const [todos, setTodos] = useState<TodoDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/todos");
    const json = await res.json();
    if (json.ok) setTodos(json.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTodo = useCallback(async (title: string) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const json = await res.json();
    if (json.ok) setTodos((prev) => [...prev, json.data]);
    return json;
  }, []);

  const patchTodo = useCallback(
    async (id: number, data: { title?: string; isDone?: boolean; addFocusSeconds?: number }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) setTodos((prev) => prev.map((t) => (t.id === id ? json.data : t)));
      return json;
    },
    []
  );

  const removeTodo = useCallback(async (id: number) => {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.ok) setTodos((prev) => prev.filter((t) => t.id !== id));
    return json;
  }, []);

  return { todos, isLoading, addTodo, patchTodo, removeTodo };
}
