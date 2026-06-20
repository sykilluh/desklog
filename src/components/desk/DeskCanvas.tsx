"use client";

import { useDroppable } from "@dnd-kit/core";
import DeskObjectItem from "@/components/desk/DeskObjectItem";
import type { DeskObjectDTO } from "@/types/desk";

export const DESK_CANVAS_ID = "desk-canvas";

export default function DeskCanvas({
  objects,
  onToggleAudio,
  onVolumeChange,
}: {
  objects: DeskObjectDTO[];
  onToggleAudio: (object: DeskObjectDTO) => void;
  onVolumeChange: (id: number, volume: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: DESK_CANVAS_ID });

  return (
    <div
      ref={setNodeRef}
      className={`relative mx-auto aspect-[12/7] w-full max-w-[1200px] rounded-2xl border-2 transition-colors ${
        isOver ? "border-amber-400" : "border-zinc-700"
      } bg-gradient-to-br from-zinc-900 to-zinc-800`}
    >
      {objects.map((object) => (
        <DeskObjectItem
          key={object.id}
          object={object}
          onToggleAudio={onToggleAudio}
          onVolumeChange={onVolumeChange}
        />
      ))}
    </div>
  );
}
