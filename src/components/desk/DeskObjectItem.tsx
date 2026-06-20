"use client";

import { useDraggable } from "@dnd-kit/core";
import { getEmoji } from "@/lib/objectCatalog";
import type { DeskObjectDTO } from "@/types/desk";

export default function DeskObjectItem({ object }: { object: DeskObjectDTO }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed-${object.id}`,
    data: { source: "placed", id: object.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ left: `${object.posX}%`, top: `${object.posY}%` }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab select-none text-3xl ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {getEmoji(object.objectName)}
    </div>
  );
}
