"use client";

import { useDroppable } from "@dnd-kit/core";
import DeskObjectItem from "@/components/desk/DeskObjectItem";
import type { DeskObjectDTO } from "@/types/desk";

export const DESK_CANVAS_ID = "desk-canvas";

export default function DeskCanvas({
  objects,
  onToggleAudio,
  onVolumeChange,
  onScaleChange,
  isTurntableSpinning,
  turntableVideoId,
}: {
  objects: DeskObjectDTO[];
  onToggleAudio: (object: DeskObjectDTO) => void;
  onVolumeChange: (id: number, volume: number) => void;
  onScaleChange: (id: number, scale: number) => void;
  isTurntableSpinning: boolean;
  turntableVideoId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: DESK_CANVAS_ID });

  return (
    <div
      ref={setNodeRef}
      className={`relative mx-auto aspect-[12/7] w-full max-w-[1200px] rounded-[2rem] border-4 transition-colors ${
        isOver ? "border-angel-pink-300" : "border-white/70"
      } bg-gradient-to-br from-angel-pink-50 via-sky-blue-50 to-mint-50 shadow-xl`}
    >
      {objects.map((object) => (
        <DeskObjectItem
          key={object.id}
          object={object}
          onToggleAudio={onToggleAudio}
          onVolumeChange={onVolumeChange}
          onScaleChange={onScaleChange}
          isSpinning={object.objectName === "turntable" ? isTurntableSpinning : object.isActive}
          videoId={object.objectName === "turntable" ? turntableVideoId : null}
        />
      ))}
    </div>
  );
}
