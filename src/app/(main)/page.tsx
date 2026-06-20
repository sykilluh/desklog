"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import ObjectInventory from "@/components/desk/ObjectInventory";
import DeskCanvas, { DESK_CANVAS_ID } from "@/components/desk/DeskCanvas";
import { useDeskObjects } from "@/hooks/useDeskObjects";
import { rectToPercent } from "@/hooks/useDragAndDrop";
import type { DeskObjectInput } from "@/types/desk";

export default function MainPage() {
  const { objects, setObjects, isLoading, isSaving, save } = useDeskObjects();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || over.id !== DESK_CANVAS_ID) return;

    const canvasRect = over.rect;
    const itemRect = active.rect.current.translated;
    if (!itemRect) return;

    const { posX, posY } = rectToPercent(itemRect, canvasRect);
    const data = active.data.current as { objectName?: string; source: string; id?: number };

    if (data.source === "inventory" && data.objectName) {
      setObjects((prev) => [
        ...prev,
        { id: -Date.now(), objectName: data.objectName!, posX, posY, isActive: true, volume: 0.5 },
      ]);
      return;
    }

    if (data.source === "placed" && data.id !== undefined) {
      setObjects((prev) =>
        prev.map((obj) => (obj.id === data.id ? { ...obj, posX, posY } : obj))
      );
    }
  }

  function handleSave() {
    const payload: DeskObjectInput[] = objects.map((obj) => ({
      objectName: obj.objectName,
      posX: obj.posX,
      posY: obj.posY,
      isActive: obj.isActive,
      volume: obj.volume,
    }));
    save(payload);
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <h1 className="mb-6 text-2xl font-semibold">데스크로그 · 가상 데스크</h1>

      <DndContext onDragEnd={handleDragEnd}>
        <ObjectInventory />

        <div className="mt-6">
          {isLoading ? (
            <p className="text-zinc-400">불러오는 중...</p>
          ) : (
            <DeskCanvas objects={objects} />
          )}
        </div>
      </DndContext>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 rounded-lg bg-amber-500 px-5 py-2 font-medium text-zinc-900 hover:bg-amber-400 disabled:opacity-50"
      >
        {isSaving ? "저장 중..." : "배치 저장"}
      </button>
    </main>
  );
}
