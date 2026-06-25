"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import ConfirmButton from "@/components/ui/ConfirmButton";
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
    <div className="flex items-center gap-3 rounded-xl border border-[#e3e2de] bg-white p-3">
      <input
        type="checkbox"
        checked={todo.isDone}
        onChange={(e) => onPatch(todo.id, { isDone: e.target.checked })}
        className="h-5 w-5 accent-mint-400"
      />
      <span className={`flex-1 text-sm ${todo.isDone ? "text-[#b3a8ad] line-through" : "text-[#3a332e]"}`}>
        {todo.title}
      </span>
      <ConfirmButton
        onConfirm={() => onRemove(todo.id)}
        confirmLabel="삭제?"
        className="text-xs text-[#b3a8ad] hover:text-strawberry-milk-400"
        confirmClassName="rounded-full bg-strawberry-milk-400 px-2 py-0.5 text-[11px] font-bold text-white"
      >
        삭제
      </ConfirmButton>
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
    <div className="rounded-2xl border border-[#e3e2de] bg-white p-5 shadow-sm">
      <h2 className="font-title mb-4 text-xl text-[#3a332e]">할 일 체크리스트</h2>

      <div className="mb-4 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="할 일 추가 (예: 보고서 검토, 운동 30분)"
          className="min-w-0 flex-1 rounded-full border border-[#e3e2de] bg-white px-4 py-2 text-sm placeholder:text-[#b3a8ad]"
        />
        <button
          onClick={handleAdd}
          className="press-pop rounded-full bg-sky-blue-400 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-blue-500"
        >
          추가
        </button>
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-[#837a82]">불러오는 중...</p>}
        {!isLoading && todos.length === 0 && (
          <p className="text-[#b3a8ad]">할 일을 추가해보세요!</p>
        )}
        {todos.map((todo) => (
          <TodoRow key={todo.id} todo={todo} onPatch={patchTodo} onRemove={removeTodo} />
        ))}
      </div>
    </div>
  );
}
