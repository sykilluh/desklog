"use client";

import { useDroppable } from "@dnd-kit/core";
import DeskObjectItem from "@/components/desk/DeskObjectItem";
import type { DeskObjectDTO } from "@/types/desk";

export const DESK_CANVAS_ID = "desk-canvas";

export default function DeskCanvas({ objects }: { objects: DeskObjectDTO[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: DESK_CANVAS_ID });

  return (
    <div
      ref={setNodeRef}
      className={`relative mx-auto aspect-[12/7] w-full max-w-[1200px] rounded-2xl border-2 ${
        isOver ? "border-amber-400" : "border-zinc-700"
      } bg-zinc-800/60`}
    >
      {objects.map((object) => (
        <DeskObjectItem key={object.id} object={object} />
      ))}
    </div>
  );
}
