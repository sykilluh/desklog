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
  onResizeEnd,
  onImageChange,
  onVariantChange,
  onDelete,
  isTurntableSpinning,
  turntableVideoId,
  isStudying,
  onTurntableSeek,
  turntableSeekBoost,
  editMode,
  backgroundClassName,
  backgroundImage,
}: {
  objects: DeskObjectDTO[];
  onToggleAudio: (object: DeskObjectDTO) => void;
  onVolumeChange: (id: number, volume: number) => void;
  onScaleChange: (id: number, scale: number) => void;
  onResizeEnd: (id: number) => void;
  onImageChange: (id: number, dataUrl: string) => void;
  onVariantChange: (id: number, variant: string) => void;
  onDelete: (id: number) => void;
  isTurntableSpinning: boolean;
  turntableVideoId: string | null;
  isStudying?: boolean;
  onTurntableSeek?: (ratio: number) => void;
  turntableSeekBoost?: number;
  editMode: boolean;
  backgroundClassName?: string;
  backgroundImage?: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: DESK_CANVAS_ID });

  return (
    <div
      ref={setNodeRef}
      id={DESK_CANVAS_ID}
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
      className={`relative mx-auto aspect-[12/7] w-full max-w-[1200px] overflow-hidden rounded-2xl border-2 transition-colors ${
        isOver ? "border-angel-pink-400" : "border-[#e3e2de]"
      } ${!backgroundImage ? backgroundClassName ?? "bg-gradient-to-br from-angel-pink-50 via-sky-blue-50 to-mint-50" : ""} shadow-[0_18px_36px_rgba(40,32,28,0.12)]`}
    >
      {objects.map((object) => (
        <DeskObjectItem
          key={object.id}
          object={object}
          onToggleAudio={onToggleAudio}
          onVolumeChange={onVolumeChange}
          onScaleChange={onScaleChange}
          onResizeEnd={onResizeEnd}
          onImageChange={onImageChange}
          onVariantChange={onVariantChange}
          onDelete={onDelete}
          isSpinning={object.objectName === "turntable" ? isTurntableSpinning : object.isActive}
          videoId={object.objectName === "turntable" ? turntableVideoId : null}
          editMode={editMode}
          isStudying={isStudying}
          onTurntableSeek={onTurntableSeek}
          turntableSeekBoost={turntableSeekBoost}
        />
      ))}
    </div>
  );
}
