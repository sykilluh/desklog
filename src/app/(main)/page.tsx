"use client";

import { useCallback, useEffect, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import ObjectInventory from "@/components/desk/ObjectInventory";
import DeskCanvas, { DESK_CANVAS_ID } from "@/components/desk/DeskCanvas";
import AudioController from "@/components/audio/AudioController";
import FocusTimer from "@/components/timer/FocusTimer";
import VisualFeedback from "@/components/timer/VisualFeedback";
import YoutubeMixer from "@/components/audio/YoutubeMixer";
import { useDeskObjects } from "@/hooks/useDeskObjects";
import { useWebAudio } from "@/hooks/useWebAudio";
import { useChallenges } from "@/hooks/useChallenges";
import { useYoutubePlayer } from "@/hooks/useYoutubePlayer";
import { rectToPercent } from "@/hooks/useDragAndDrop";
import type { DeskObjectDTO, DeskObjectInput } from "@/types/desk";

const YOUTUBE_PLAYER_CONTAINER_ID = "desklog-youtube-player";

export default function MainPage() {
  const { objects, setObjects, isLoading, isSaving, save } = useDeskObjects();
  const { isMuted, toggleObject, changeVolume, toggleMute } = useWebAudio();
  const { challenges } = useChallenges();
  const youtube = useYoutubePlayer(YOUTUBE_PLAYER_CONTAINER_ID);
  const [todayFocusSeconds, setTodayFocusSeconds] = useState(0);

  const refreshTodayFocus = useCallback(async () => {
    const res = await fetch("/api/focus-logs");
    const json = await res.json();
    if (json.ok) setTodayFocusSeconds(json.data.todaySeconds);
  }, []);

  useEffect(() => {
    refreshTodayFocus();
  }, [refreshTodayFocus]);

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
        { id: -Date.now(), objectName: data.objectName!, posX, posY, isActive: false, volume: 0.5 },
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
    } else {
      toggleObject(object.id, object.objectName, object.volume, object.isActive);
    }
    setObjects((prev) =>
      prev.map((obj) => (obj.id === object.id ? { ...obj, isActive: !obj.isActive } : obj))
    );
  }

  function handleVolumeChange(id: number, volume: number) {
    const target = objects.find((obj) => obj.id === id);
    if (target?.objectName === "turntable") {
      youtube.setVolume(volume);
    } else {
      changeVolume(id, volume);
    }
    setObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, volume } : obj)));
  }

  function handleSave() {
    const payload: DeskObjectInput[] = objects.map((obj) => ({
      objectName: obj.objectName,
      posX: obj.posX,
      posY: obj.posY,
      isActive: obj.isActive,
      volume: obj.volume,
    }));
    save(payload);
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">데스크로그 · 가상 데스크</h1>
        <div className="flex items-center gap-3">
          <a
            href="/challenge"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            챌린지 관리
          </a>
          <a
            href="/archive"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            공유 카드
          </a>
          <AudioController isMuted={isMuted} onToggleMute={toggleMute} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <DndContext onDragEnd={handleDragEnd}>
            <ObjectInventory />

            <div className="mt-6">
              {isLoading ? (
                <p className="text-zinc-400">불러오는 중...</p>
              ) : (
                <DeskCanvas
                  objects={objects}
                  onToggleAudio={handleToggleAudio}
                  onVolumeChange={handleVolumeChange}
                  isTurntableSpinning={youtube.isPlaying}
                />
              )}
            </div>
          </DndContext>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-6 rounded-lg bg-amber-500 px-5 py-2 font-medium text-zinc-900 hover:bg-amber-400 disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "배치 저장"}
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <FocusTimer onFocusLogged={refreshTodayFocus} />
          <VisualFeedback todayFocusSeconds={todayFocusSeconds} progressRate={progressRate} />
          <div id={YOUTUBE_PLAYER_CONTAINER_ID} className="hidden" />
          <YoutubeMixer
            isReady={youtube.isReady}
            isPlaying={youtube.isPlaying}
            loadVideo={youtube.loadVideo}
            loadPlaylist={youtube.loadPlaylist}
            play={youtube.play}
            pause={youtube.pause}
            setVolume={youtube.setVolume}
          />
        </div>
      </div>
    </main>
  );
}
