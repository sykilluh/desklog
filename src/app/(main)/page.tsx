"use client";

import { signOut } from "next-auth/react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import ObjectInventory from "@/components/desk/ObjectInventory";
import DeskCanvas, { DESK_CANVAS_ID } from "@/components/desk/DeskCanvas";
import FocusTimer from "@/components/timer/FocusTimer";
import VisualFeedback from "@/components/timer/VisualFeedback";
import YoutubeMixer from "@/components/audio/YoutubeMixer";
import { useDeskObjects } from "@/hooks/useDeskObjects";
import { useChallenges } from "@/hooks/useChallenges";
import { usePlaylist } from "@/components/providers/PlaylistProvider";
import { useGlobalFocusTimer } from "@/components/providers/FocusTimerProvider";
import { rectToPercent } from "@/hooks/useDragAndDrop";
import type { DeskObjectDTO, DeskObjectInput } from "@/types/desk";

export default function MainPage() {
  const { objects, setObjects, isLoading, isSaving, save } = useDeskObjects();
  const { challenges } = useChallenges();
  const youtube = usePlaylist();
  const { todayFocusSeconds } = useGlobalFocusTimer();

  const progressRate = challenges[0]?.progressRate ?? 0;

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
        {
          id: -Date.now(),
          objectName: data.objectName!,
          posX,
          posY,
          isActive: false,
          volume: 0.5,
          scale: 1,
        },
      ]);
      return;
    }

    if (data.source === "placed" && data.id !== undefined) {
      setObjects((prev) =>
        prev.map((obj) => (obj.id === data.id ? { ...obj, posX, posY } : obj))
      );
    }
  }

  function handleToggleAudio(object: DeskObjectDTO) {
    if (object.objectName === "turntable") {
      if (object.isActive) youtube.pause();
      else youtube.play();
      setObjects((prev) =>
        prev.map((obj) => (obj.id === object.id ? { ...obj, isActive: !obj.isActive } : obj))
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

  function handleScaleChange(id: number, scale: number) {
    setObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, scale } : obj)));
  }

  function handleSave() {
    const payload: DeskObjectInput[] = objects.map((obj) => ({
      objectName: obj.objectName,
      posX: obj.posX,
      posY: obj.posY,
      isActive: obj.isActive,
      volume: obj.volume,
      scale: obj.scale,
    }));
    save(payload);
  }

  return (
    <main className="min-h-screen p-6 text-[#5b4a52] sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl text-[#ff6fa5] drop-shadow-sm">🩷 데스크로그 · 나만의 데스크</h1>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/challenge"
            className="flex items-center gap-1.5 rounded-full border-2 border-mint-200 bg-white px-6 py-3 text-lg font-bold text-[#5b4a52] shadow-sm transition hover:scale-105 hover:bg-mint-50"
          >
            📖 챌린지
          </a>
          <a
            href="/plant"
            className="flex items-center gap-1.5 rounded-full border-2 border-mint-200 bg-white px-6 py-3 text-lg font-bold text-[#5b4a52] shadow-sm transition hover:scale-105 hover:bg-mint-50"
          >
            🌱 식물
          </a>
          <a
            href="/archive"
            className="flex items-center gap-1.5 rounded-full border-2 border-sky-blue-200 bg-white px-6 py-3 text-lg font-bold text-[#5b4a52] shadow-sm transition hover:scale-105 hover:bg-sky-blue-50"
          >
            🎀 공유 카드
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 rounded-full border-2 border-strawberry-milk-200 bg-white px-6 py-3 text-lg font-bold text-[#5b4a52] shadow-sm transition hover:scale-105 hover:bg-strawberry-milk-50"
          >
            🚪 로그아웃
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <DndContext onDragEnd={handleDragEnd}>
            <ObjectInventory />

            <div className="mt-6">
              {isLoading ? (
                <p className="text-[#a8889a]">불러오는 중...</p>
              ) : (
                <DeskCanvas
                  objects={objects}
                  onToggleAudio={handleToggleAudio}
                  onVolumeChange={handleVolumeChange}
                  onScaleChange={handleScaleChange}
                  isTurntableSpinning={youtube.isPlaying}
                  turntableVideoId={youtube.currentVideoId}
                />
              )}
            </div>
          </DndContext>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-6 rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-8 py-3.5 text-xl font-bold text-white shadow-md transition hover:scale-105 disabled:opacity-50"
          >
            {isSaving ? "저장 중... 🫶" : "💾 배치 저장하기"}
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <FocusTimer />
          <VisualFeedback todayFocusSeconds={todayFocusSeconds} progressRate={progressRate} />
          <YoutubeMixer
            isReady={youtube.isReady}
            isPlaying={youtube.isPlaying}
            currentVideoTitle={youtube.currentVideoTitle}
            currentTime={youtube.currentTime}
            duration={youtube.duration}
            loadVideo={youtube.loadVideo}
            loadPlaylist={youtube.loadPlaylist}
            play={youtube.play}
            pause={youtube.pause}
            setVolume={youtube.setVolume}
            seekTo={youtube.seekTo}
          />
        </div>
      </div>
    </main>
  );
}
