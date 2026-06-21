"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import type { TodoDTO } from "@/types/todo";

function TodoRow({
  todo,
  onPatch,
  onRemove,
}: {
  todo: TodoDTO;
  onPatch: (id: number, data: { title?: string; isDone?: boolean }) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm">
      <input
        type="checkbox"
        checked={todo.isDone}
        onChange={(e) => onPatch(todo.id, { isDone: e.target.checked })}
        className="h-5 w-5 accent-mint-300"
      />
      <span className={`flex-1 text-sm ${todo.isDone ? "text-[#cdb8c4] line-through" : "text-[#5b4a52]"}`}>
        {todo.title}
      </span>
      <button onClick={() => onRemove(todo.id)} className="text-xs text-[#cdb8c4]">
        🗑️
      </button>
    </div>
  );
}

export default function TodoChecklist() {
  const { todos, isLoading, addTodo, patchTodo, removeTodo } = useTodos();
  const [title, setTitle] = useState("");

  async function handleAdd() {
    if (!title.trim()) return;
    await addTodo(title);
    setTitle("");
  }

  return (
    <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-5 shadow-md backdrop-blur">
      <h2 className="mb-4 text-xl text-[#3a8fb8]">✅ 할 일 체크리스트</h2>

      <div className="mb-4 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="할 일 추가 (예: 3장 읽기)"
          className="min-w-0 flex-1 rounded-full border border-sky-blue-100 bg-white px-4 py-2 text-sm placeholder:text-[#b8d3e3]"
        />
        <button
          onClick={handleAdd}
          className="rounded-full bg-gradient-to-r from-sky-blue-300 to-mint-300 px-4 py-2 text-sm font-bold text-white shadow"
        >
          추가
        </button>
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-[#a8889a]">불러오는 중...</p>}
        {!isLoading && todos.length === 0 && (
          <p className="text-[#cdb8c4]">할 일을 추가해보세요!</p>
        )}
        {todos.map((todo) => (
          <TodoRow key={todo.id} todo={todo} onPatch={patchTodo} onRemove={removeTodo} />
        ))}
      </div>
    </div>
  );
}
