"use client";

import { useDraggable } from "@dnd-kit/core";
import { getEmoji } from "@/lib/objectCatalog";
import SoundSlider from "@/components/audio/SoundSlider";
import type { DeskObjectDTO } from "@/types/desk";

export default function DeskObjectItem({
  object,
  onToggleAudio,
  onVolumeChange,
}: {
  object: DeskObjectDTO;
  onToggleAudio: (object: DeskObjectDTO) => void;
  onVolumeChange: (id: number, volume: number) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed-${object.id}`,
    data: { source: "placed", id: object.id },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ left: `${object.posX}%`, top: `${object.posY}%` }}
      className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <span {...listeners} {...attributes} className="cursor-grab select-none text-3xl">
        {getEmoji(object.objectName)}
      </span>
      <SoundSlider
        volume={object.volume}
        isActive={object.isActive}
        onToggle={() => onToggleAudio(object)}
        onVolumeChange={(volume) => onVolumeChange(object.id, volume)}
      />
    </div>
  );
}
