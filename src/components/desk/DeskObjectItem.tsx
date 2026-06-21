"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { getEmoji } from "@/lib/objectCatalog";
import SoundSlider from "@/components/audio/SoundSlider";
import TurntableVisual from "@/components/desk/TurntableVisual";
import PlantDisplayVisual from "@/components/desk/PlantDisplayVisual";
import PhotoFrameVisual from "@/components/desk/PhotoFrameVisual";
import DeskClockVisual from "@/components/desk/DeskClockVisual";
import MugIcon, { DRINK_OPTIONS, getDrinkOption } from "@/components/desk/MugIcon";
import type { DeskObjectDTO } from "@/types/desk";

const TURNTABLE_BASE_SIZE = 112;
const PLANT_DISPLAY_BASE_SIZE = 88;
const PHOTO_FRAME_BASE_SIZE = 160;
const DESK_CLOCK_BASE_SIZE = 96;
const MUG_BASE_SIZE = 56;
const EMOJI_BASE_REM = 1.875;

export const MIN_SCALE = 0.5;
export const MAX_SCALE = 6;

export function getObjectFootprintPx(objectName: string, scale: number): number {
  if (objectName === "turntable") return TURNTABLE_BASE_SIZE * scale;
  if (objectName === "plantDisplay") return PLANT_DISPLAY_BASE_SIZE * scale;
  if (objectName === "photoFrame") return PHOTO_FRAME_BASE_SIZE * scale;
  if (objectName === "deskClock") return DESK_CLOCK_BASE_SIZE * scale;
  if (objectName === "cup") return MUG_BASE_SIZE * scale;
  // emoji objects: approximate square footprint from font size (rem -> px @ 16px root)
  return EMOJI_BASE_REM * scale * 16;
}

export default function DeskObjectItem({
  object,
  onToggleAudio,
  onVolumeChange,
  onScaleChange,
  onResizeEnd,
  onImageChange,
  onVariantChange,
  onDelete,
  isSpinning,
  videoId,
  editMode,
  isStudying,
  onTurntableSeek,
  turntableSeekBoost,
}: {
  object: DeskObjectDTO;
  onToggleAudio: (object: DeskObjectDTO) => void;
  onVolumeChange: (id: number, volume: number) => void;
  onScaleChange: (id: number, scale: number) => void;
  onResizeEnd: (id: number) => void;
  onImageChange: (id: number, dataUrl: string) => void;
  onVariantChange: (id: number, variant: string) => void;
  onDelete: (id: number) => void;
  isSpinning: boolean;
  videoId: string | null;
  editMode: boolean;
  isStudying?: boolean;
  onTurntableSeek?: (ratio: number) => void;
  turntableSeekBoost?: number;
}) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `placed-${object.id}`,
    data: { source: "placed", id: object.id },
    disabled: !editMode,
  });

  const [showDrinkPicker, setShowDrinkPicker] = useState(false);
  const [resizing, setResizing] = useState(false);

  const isTurntable = object.objectName === "turntable";
  const isPlantDisplay = object.objectName === "plantDisplay";
  const isPhotoFrame = object.objectName === "photoFrame";
  const isDeskClock = object.objectName === "deskClock";
  const isMug = object.objectName === "cup";
  const drink = isMug ? getDrinkOption(object.variant) : null;

  function handleResizeStart(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!editMode) return;
    setResizing(true);
    const startX = e.clientX;
    const startScale = object.scale;

    function handleMove(moveEvent: PointerEvent) {
      const delta = moveEvent.clientX - startX;
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale + delta / 80));
      onScaleChange(object.id, Math.round(nextScale * 100) / 100);
    }

    function handleUp() {
      setResizing(false);
      onResizeEnd(object.id);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  const combinedTransform = transform
    ? `translate(-50%, -50%) ${CSS.Translate.toString(transform)}`
    : "translate(-50%, -50%)";

  return (
    <div
      ref={setNodeRef}
      style={{
        left: `${object.posX}%`,
        top: `${object.posY}%`,
        transform: combinedTransform,
      }}
      className={`absolute flex flex-col items-center gap-1 ${
        isDragging || resizing ? "z-30 opacity-90" : "z-0"
      }`}
    >
      <div className="group relative">
        <span
          {...(editMode ? listeners : {})}
          {...(editMode ? attributes : {})}
          onClick={() => {
            if (isMug && !editMode) setShowDrinkPicker((prev) => !prev);
          }}
          className={`select-none ${editMode ? "cursor-grab active:cursor-grabbing" : isMug ? "cursor-pointer" : ""}`}
        >
          {isTurntable ? (
            <TurntableVisual
              isSpinning={isSpinning}
              videoId={videoId}
              size={TURNTABLE_BASE_SIZE * object.scale}
              onPlayToggle={(playing) => {
                if (playing !== isSpinning) onToggleAudio(object);
              }}
              onSeek={onTurntableSeek}
              seekBoost={turntableSeekBoost}
            />
          ) : isPlantDisplay ? (
            <PlantDisplayVisual size={PLANT_DISPLAY_BASE_SIZE * object.scale} />
          ) : isPhotoFrame ? (
            <PhotoFrameVisual
              size={PHOTO_FRAME_BASE_SIZE * object.scale}
              imageData={object.imageData}
              onUpload={(dataUrl) => onImageChange(object.id, dataUrl)}
            />
          ) : isDeskClock ? (
            <DeskClockVisual size={DESK_CLOCK_BASE_SIZE * object.scale} />
          ) : isMug ? (
            <div className="flex flex-col items-center gap-0.5">
              <MugIcon
                size={MUG_BASE_SIZE * object.scale}
                cupFill={drink!.cupFill}
                cupStroke={drink!.cupStroke}
                liquidFill={drink!.liquidFill}
                liquidStroke={drink!.liquidStroke}
                variantId={drink!.id}
                photo={drink!.photo}
                brewing={isStudying}
              />
              <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-[#5b4a52] shadow-sm">
                {drink!.label}
              </span>
            </div>
          ) : (
            <span
              className="inline-block drop-shadow-sm"
              style={{ fontSize: `${EMOJI_BASE_REM * object.scale}rem` }}
            >
              {getEmoji(object.objectName)}
            </span>
          )}
        </span>

        {isMug && showDrinkPicker && !editMode && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute left-1/2 top-full z-40 mt-2 w-40 -translate-x-1/2 rounded-2xl border-2 border-angel-pink-100 bg-white p-2 shadow-xl"
          >
            <p className="mb-1 px-1 text-[11px] font-bold text-[#a8889a]">음료 고르기</p>
            <div className="flex flex-col gap-1">
              {DRINK_OPTIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    onVariantChange(object.id, d.id);
                    setShowDrinkPicker(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs font-bold transition hover:bg-angel-pink-50 ${
                    object.variant === d.id ? "bg-angel-pink-100" : ""
                  }`}
                >
                  <MugIcon size={18} cupFill={d.cupFill} cupStroke={d.cupStroke} liquidFill={d.liquidFill} liquidStroke={d.liquidStroke} variantId={d.id} photo={d.photo} />
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {editMode && (
          <div
            onPointerDown={handleResizeStart}
            title="크기 조절"
            className="absolute -bottom-1 -right-1 z-20 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-sky-blue-300 shadow-md"
          />
        )}

        {editMode && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(object.id);
            }}
            title="삭제"
            className="absolute -right-1 -top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-strawberry-milk-400 text-[10px] font-bold leading-none text-white shadow-md transition hover:scale-110"
          >
            ✕
          </button>
        )}
      </div>

      {!isPhotoFrame && !isDeskClock && (
        <SoundSlider
          volume={object.volume}
          isActive={object.isActive}
          onToggle={() => onToggleAudio(object)}
          onVolumeChange={(volume) => onVolumeChange(object.id, volume)}
        />
      )}
    </div>
  );
}
