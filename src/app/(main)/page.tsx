"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import ObjectInventory from "@/components/desk/ObjectInventory";
import DeskCanvas, { DESK_CANVAS_ID } from "@/components/desk/DeskCanvas";
import FocusTimer from "@/components/timer/FocusTimer";
import TodayRecommendMenu from "@/components/timer/TodayRecommendMenu";
import VisualFeedback from "@/components/timer/VisualFeedback";
import YoutubeMixer from "@/components/audio/YoutubeMixer";
import { useDeskObjects } from "@/hooks/useDeskObjects";
import { useDeskSetting } from "@/hooks/useDeskSetting";
import { useChallenges } from "@/hooks/useChallenges";
import { DESK_BACKGROUND_OPTIONS, getDeskBackground } from "@/lib/deskBackgrounds";
import { usePlaylist } from "@/components/providers/PlaylistProvider";
import { useGlobalFocusTimer } from "@/components/providers/FocusTimerProvider";
import { rectToPercent, clampPercentToFootprint } from "@/hooks/useDragAndDrop";
import { getObjectFootprintPx } from "@/components/desk/DeskObjectItem";
import type { DeskObjectDTO, DeskObjectInput } from "@/types/desk";

export default function MainPage() {
  const { objects, setObjects, isLoading, isSaving, save } = useDeskObjects();
  const { challenges } = useChallenges();
  const youtube = usePlaylist();
  const {
    todayFocusSeconds,
    isRunning: isTimerRunning,
    phase: timerPhase,
    activeSessionId: activeTimerSessionId,
    startWithoutSession,
  } = useGlobalFocusTimer();
  const isStudying = isTimerRunning && timerPhase === "focus";
  const [editMode, setEditMode] = useState(false);
  const [showRecommendMenu, setShowRecommendMenu] = useState(false);
  const [seekBoostTick, setSeekBoostTick] = useState<number | undefined>(undefined);
  const { backgroundId, backgroundImage, setBackground, setBackgroundImage } = useDeskSetting();
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  function handleBackgroundFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setBackgroundImage(reader.result);
    };
    reader.readAsDataURL(file);
  }
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const currentBackground = getDeskBackground(backgroundId);

  const progressRate = challenges[0]?.progressRate ?? 0;

  // Small activation distance prevents a plain click (e.g. opening the drink
  // picker) from being misread as the start of a drag, which previously
  // caused a tiny erratic jump right when a drag began.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function getCanvasRect() {
    return document.getElementById(DESK_CANVAS_ID)?.getBoundingClientRect() ?? null;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || over.id !== DESK_CANVAS_ID) return;

    const canvasRect = over.rect;
    const itemRect = active.rect.current.translated;
    if (!itemRect) return;

    const { posX, posY } = rectToPercent(itemRect, canvasRect);
    const data = active.data.current as { objectName?: string; source: string; id?: number };

    if (data.source === "inventory" && data.objectName) {
      const footprint = getObjectFootprintPx(data.objectName, 1);
      const clamped = clampPercentToFootprint(posX, posY, footprint, canvasRect.width, canvasRect.height);
      setObjects((prev) => [
        ...prev,
        {
          id: -Date.now(),
          objectName: data.objectName!,
          posX: clamped.posX,
          posY: clamped.posY,
          isActive: false,
          volume: 0.5,
          scale: 1,
          imageData: null,
          variant: null,
        },
      ]);
      return;
    }

    if (data.source === "placed" && data.id !== undefined) {
      setObjects((prev) =>
        prev.map((obj) => {
          if (obj.id !== data.id) return obj;
          const footprint = getObjectFootprintPx(obj.objectName, obj.scale);
          const clamped = clampPercentToFootprint(posX, posY, footprint, canvasRect.width, canvasRect.height);
          return { ...obj, posX: clamped.posX, posY: clamped.posY };
        })
      );
    }
  }

  function handleTurntableSeek(ratio: number) {
    if (youtube.duration > 0) youtube.seekTo(ratio * youtube.duration);
  }

  function handleSeekBoost() {
    setSeekBoostTick(Date.now());
  }

  function handleToggleAudio(object: DeskObjectDTO) {
    if (object.objectName === "turntable") {
      // Drive play/pause off the real player state (youtube.isPlaying), not the
      // desk object's persisted `isActive` flag — that flag can desync from
      // actual playback (e.g. paused from the playlist panel or floating bar
      // without the turntable's own toggle), which used to make dragging the
      // tonearm silently no-op because the gate compared against a stale flag.
      if (youtube.isPlaying) youtube.pause();
      else youtube.play();
      setObjects((prev) =>
        prev.map((obj) => (obj.id === object.id ? { ...obj, isActive: !youtube.isPlaying } : obj))
      );
      return;
    }
    // 다른 오브제의 화이트노이즈는 너무 시끄럽다는 피드백으로 일단 비활성화.
    setObjects((prev) =>
      prev.map((obj) => (obj.id === object.id ? { ...obj, isActive: !obj.isActive } : obj))
    );
  }

  function handleVolumeChange(id: number, volume: number) {
    const target = objects.find((obj) => obj.id === id);
    if (target?.objectName === "turntable") {
      youtube.setVolume(volume);
    }
    setObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, volume } : obj)));
  }

  // Scale alone, no position clamping — while you're actively dragging the
  // resize handle, the object is free to grow right up to (or past) the
  // canvas edge without its center getting yanked back toward the middle on
  // every pixel of growth. That live yanking was the "튕겨" bounce: as scale
  // grew, the footprint grew, and clamping recomputed a smaller allowed
  // range every frame, snapping the object inward mid-gesture.
  function handleScaleChange(id: number, scale: number) {
    setObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, scale } : obj)));
  }

  // Called once, on resize-handle release — snaps the object flush against
  // the nearest edge only if its new (now-final) size pushed it out of
  // bounds, instead of fighting the live drag the whole time.
  function handleResizeEnd(id: number) {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj;
        const canvasRect = getCanvasRect();
        if (!canvasRect) return obj;
        const footprint = getObjectFootprintPx(obj.objectName, obj.scale);
        const clamped = clampPercentToFootprint(obj.posX, obj.posY, footprint, canvasRect.width, canvasRect.height);
        return { ...obj, posX: clamped.posX, posY: clamped.posY };
      })
    );
  }

  function handleRecommendedDrink(drinkId: string) {
    setObjects((prev) => {
      const existingCup = prev.find((obj) => obj.objectName === "cup");
      if (existingCup) {
        return prev.map((obj) => (obj.id === existingCup.id ? { ...obj, variant: drinkId } : obj));
      }
      return [
        ...prev,
        {
          id: -Date.now(),
          objectName: "cup",
          posX: 50,
          posY: 78,
          isActive: false,
          volume: 0.5,
          scale: 1.5,
          imageData: null,
          variant: drinkId,
        },
      ];
    });
    setShowRecommendMenu(false);
    // Only auto-start a fresh (auto-named) run if nothing's already going or
    // paused-but-attached — unconditionally starting here used to abandon
    // whatever record was already active (named or auto-named, running or
    // paused) every time a drink was picked, silently orphaning its
    // progress and resetting the timer to a brand new session.
    if (!isTimerRunning && activeTimerSessionId == null) startWithoutSession();
  }

  function handleDeleteObject(id: number) {
    setObjects((prev) => prev.filter((obj) => obj.id !== id));
  }

  function handleImageChange(id: number, imageData: string) {
    setObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, imageData } : obj)));
    if (id > 0) {
      fetch(`/api/desks/objects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
      }).catch(() => {});
    }
  }

  function handleVariantChange(id: number, variant: string) {
    setObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, variant } : obj)));
    if (id > 0) {
      fetch(`/api/desks/objects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant }),
      }).catch(() => {});
    }
  }

  function handleSave() {
    const payload: DeskObjectInput[] = objects.map((obj) => ({
      objectName: obj.objectName,
      posX: obj.posX,
      posY: obj.posY,
      isActive: obj.isActive,
      volume: obj.volume,
      scale: obj.scale,
      imageData: obj.imageData,
      variant: obj.variant,
    }));
    save(payload);
  }

  return (
    <main className="min-h-screen p-6 text-[#3a332e] sm:p-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[#e3e2de] pb-6">
        <h1 className="font-title text-3xl text-[#3a332e]">데스크로그</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/cafe"
            className="rounded-full border border-[#e3e2de] bg-white px-5 py-2 text-sm font-semibold text-[#5c5650] transition hover:border-angel-pink-300 hover:text-[#3a332e]"
          >
            카페
          </Link>
          <button
            onClick={() => setShowRecommendMenu(true)}
            className="rounded-full bg-angel-pink-200 px-5 py-2 text-sm font-semibold text-[#7a3c54] shadow-sm transition hover:bg-angel-pink-300"
          >
            오늘의 추천 메뉴
          </button>
          <Link
            href="/diary"
            className="rounded-full border border-[#e3e2de] bg-white px-5 py-2 text-sm font-semibold text-[#5c5650] transition hover:border-angel-pink-300 hover:text-[#3a332e]"
          >
            다이어리
          </Link>
          <Link
            href="/challenge"
            className="rounded-full border border-[#e3e2de] bg-white px-5 py-2 text-sm font-semibold text-[#5c5650] transition hover:border-mint-300 hover:text-[#3a332e]"
          >
            챌린지
          </Link>
          <Link
            href="/plant"
            className="rounded-full border border-[#e3e2de] bg-white px-5 py-2 text-sm font-semibold text-[#5c5650] transition hover:border-mint-300 hover:text-[#3a332e]"
          >
            식물
          </Link>
          <Link
            href="/asmr"
            className="rounded-full border border-[#e3e2de] bg-white px-5 py-2 text-sm font-semibold text-[#5c5650] transition hover:border-sky-blue-300 hover:text-[#3a332e]"
          >
            오늘의 ASMR
          </Link>
          <Link
            href="/reviews"
            className="rounded-full border border-[#e3e2de] bg-white px-5 py-2 text-sm font-semibold text-[#5c5650] transition hover:border-angel-pink-300 hover:text-[#3a332e]"
          >
            후기
          </Link>
          <Link
            href="/archive"
            className="rounded-full border border-[#e3e2de] bg-white px-5 py-2 text-sm font-semibold text-[#5c5650] transition hover:border-sky-blue-300 hover:text-[#3a332e]"
          >
            공유 로그
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-full px-5 py-2 text-sm font-semibold text-[#9c948b] transition hover:text-[#3a332e]"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[#837a82]">
              {editMode ? "✏️ 편집 모드: 자유롭게 끌어서 배치하고, 모서리 핸들로 크기를 조절하세요." : "오브제를 클릭해보세요. 배치를 바꾸려면 편집 모드를 켜주세요."}
            </p>
            <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowBackgroundPicker((prev) => !prev)}
                className="press-pop flex shrink-0 items-center gap-1.5 rounded-full border border-[#e3e2de] bg-white px-4 py-2 text-sm font-semibold text-[#3a332e] transition hover:border-sky-blue-300"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="1.5" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M1.5 10.5l3.5-3.5 2.5 2.5 4-4 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                데스크매트
              </button>
              {showBackgroundPicker && (
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  className="hover-lift absolute right-0 top-full z-40 mt-2 w-56 rounded-md border-2 border-[#e3e2de] bg-white p-2 shadow-xl"
                >
                  <p className="mb-1 px-1 text-[11px] font-bold text-[#837a82]">데스크매트 고르기</p>
                  <div className="flex flex-col gap-1">
                    {DESK_BACKGROUND_OPTIONS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => {
                          setBackground(bg.id);
                          setShowBackgroundPicker(false);
                        }}
                        className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs font-bold transition hover:bg-sky-blue-50 ${
                          backgroundId === bg.id ? "bg-sky-blue-100" : ""
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full border border-black/10 ${bg.className}`} />
                        {bg.label}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        bgFileInputRef.current?.click();
                      }}
                      className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs font-bold transition hover:bg-sky-blue-50 ${
                        backgroundId === "custom" ? "bg-sky-blue-100" : ""
                      }`}
                    >
                      {backgroundImage ? (
                        <span
                          className="h-5 w-5 rounded-full border border-black/10 bg-cover bg-center"
                          style={{ backgroundImage: `url(${backgroundImage})` }}
                        />
                      ) : (
                        <span className="h-5 w-5 rounded-full border border-black/10 bg-gradient-to-br from-angel-pink-100 to-sky-blue-100" />
                      )}
                      내 사진 추가하기
                    </button>
                  </div>
                  <input
                    ref={bgFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleBackgroundFile(e);
                      setShowBackgroundPicker(false);
                    }}
                    className="hidden"
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className={`press-pop flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                editMode ? "border-ink-600 bg-ink-600 text-white" : "border-[#e3e2de] bg-white text-[#3a332e] hover:border-angel-pink-300"
              }`}
            >
              {editMode ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M11 2.5l2.5 2.5-8 8H3v-2.5l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
                </svg>
              )}
              {editMode ? "편집 종료" : "데스크 편집"}
            </button>
            </div>
          </div>

          {/* No live bounds-clamp modifier here on purpose — clamping the
              transform every frame while dragging recomputed the allowed
              range continuously and snapped the object inward mid-gesture
              (the "튕겨" bounce). Letting the drag track the cursor 1:1, with
              handleDragEnd doing the one-time clamp/snap-to-edge on drop, is
              what makes oversized objects move smoothly. */}
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            {editMode && <ObjectInventory />}

            <div className={editMode ? "mt-6" : ""}>
              {isLoading ? (
                <p className="text-[#837a82]">불러오는 중...</p>
              ) : (
                <DeskCanvas
                  objects={objects}
                  onToggleAudio={handleToggleAudio}
                  onVolumeChange={handleVolumeChange}
                  onScaleChange={handleScaleChange}
                  onResizeEnd={handleResizeEnd}
                  onImageChange={handleImageChange}
                  onVariantChange={handleVariantChange}
                  onDelete={handleDeleteObject}
                  isTurntableSpinning={youtube.isPlaying}
                  turntableVideoId={youtube.currentVideoId}
                  isStudying={isStudying}
                  onTurntableSeek={handleTurntableSeek}
                  turntableSeekBoost={seekBoostTick}
                  editMode={editMode}
                  backgroundClassName={currentBackground.className}
                  backgroundImage={backgroundImage}
                />
              )}
            </div>
          </DndContext>

          {editMode && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="mt-6 rounded-2xl bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-8 py-3.5 text-xl font-bold text-white shadow-md shadow-angel-pink-300/40 transition hover:scale-105 disabled:opacity-50"
            >
              {isSaving ? "저장 중... 🫶" : "💾 배치 저장하기"}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <YoutubeMixer
            isReady={youtube.isReady}
            isPlaying={youtube.isPlaying}
            currentVideoTitle={youtube.currentVideoTitle}
            currentTime={youtube.currentTime}
            duration={youtube.duration}
            queue={youtube.queue}
            queueIndex={youtube.queueIndex}
            loadVideo={youtube.loadVideo}
            loadPlaylist={youtube.loadPlaylist}
            addToQueue={youtube.addToQueue}
            removeFromQueue={youtube.removeFromQueue}
            clearQueue={youtube.clearQueue}
            playQueueIndex={youtube.playQueueIndex}
            play={youtube.play}
            pause={youtube.pause}
            setVolume={youtube.setVolume}
            seekTo={youtube.seekTo}
            onSeekBoost={handleSeekBoost}
          />
          <FocusTimer />
          <VisualFeedback todayFocusSeconds={todayFocusSeconds} progressRate={progressRate} />
        </div>
      </div>

      {showRecommendMenu && (
        <TodayRecommendMenu onComplete={handleRecommendedDrink} onClose={() => setShowRecommendMenu(false)} />
      )}
    </main>
  );
}
