"use client";

import { useDraggable } from "@dnd-kit/core";
import { getEmoji } from "@/lib/objectCatalog";
import SoundSlider from "@/components/audio/SoundSlider";
import TurntableVisual from "@/components/desk/TurntableVisual";
import type { DeskObjectDTO } from "@/types/desk";

const TURNTABLE_BASE_SIZE = 112;

export default function DeskObjectItem({
  object,
  onToggleAudio,
  onVolumeChange,
  onScaleChange,
  isSpinning,
  videoId,
}: {
  object: DeskObjectDTO;
  onToggleAudio: (object: DeskObjectDTO) => void;
  onVolumeChange: (id: number, volume: number) => void;
  onScaleChange: (id: number, scale: number) => void;
  isSpinning: boolean;
  videoId: string | null;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed-${object.id}`,
    data: { source: "placed", id: object.id },
  });

  const isTurntable = object.objectName === "turntable";

  return (
    <div
      ref={setNodeRef}
      style={{ left: `${object.posX}%`, top: `${object.posY}%` }}
      className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <span {...listeners} {...attributes} className="cursor-grab select-none">
        {isTurntable ? (
          <TurntableVisual
            isSpinning={isSpinning}
            videoId={videoId}
            size={TURNTABLE_BASE_SIZE * object.scale}
          />
        ) : (
          <span
            className="inline-block drop-shadow-sm"
            style={{ fontSize: `${1.875 * object.scale}rem` }}
          >
            {getEmoji(object.objectName)}
          </span>
        )}
      </span>

      {isTurntable && (
        <input
          onPointerDown={(e) => e.stopPropagation()}
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={object.scale}
          onChange={(e) => onScaleChange(object.id, Number(e.target.value))}
          className="h-1 w-20 accent-sky-blue-300"
          title="크기 조절"
        />
      )}

      <SoundSlider
        volume={object.volume}
        isActive={object.isActive}
        onToggle={() => onToggleAudio(object)}
        onVolumeChange={(volume) => onVolumeChange(object.id, volume)}
      />
    </div>
  );
}
