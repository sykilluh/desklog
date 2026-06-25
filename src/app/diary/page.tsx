"use client";

import { useState } from "react";
import Link from "next/link";
import FocusRecordsPanel from "@/components/timer/FocusRecordsPanel";
import FocusAnalyticsPanel from "@/components/timer/FocusAnalyticsPanel";
import SubjectMonthlyPanel from "@/components/timer/SubjectMonthlyPanel";
import TodayRecommendMenu from "@/components/timer/TodayRecommendMenu";
import { useGlobalFocusTimer } from "@/components/providers/FocusTimerProvider";
import { useDeskObjects } from "@/hooks/useDeskObjects";
import type { DeskObjectInput } from "@/types/desk";

export default function DiaryPage() {
  const [showRecommendMenu, setShowRecommendMenu] = useState(false);
  const { objects, setObjects, save } = useDeskObjects();
  const { isRunning: isTimerRunning, activeSessionId: activeTimerSessionId, startWithoutSession } = useGlobalFocusTimer();

  async function handleRecommendedDrink(drinkId: string) {
    const existingCup = objects.find((obj) => obj.objectName === "cup");
    const nextObjects = existingCup
      ? objects.map((obj) => (obj.id === existingCup.id ? { ...obj, variant: drinkId } : obj))
      : [
          ...objects,
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
    setObjects(nextObjects);

    const payload: DeskObjectInput[] = nextObjects.map((obj) => ({
      objectName: obj.objectName,
      posX: obj.posX,
      posY: obj.posY,
      isActive: obj.isActive,
      volume: obj.volume,
      scale: obj.scale,
      imageData: obj.imageData,
      variant: obj.variant,
    }));
    await save(payload);
    setShowRecommendMenu(false);
    if (!isTimerRunning && activeTimerSessionId == null) startWithoutSession();
  }

  return (
    <main className="min-h-screen p-6 text-[#3a332e] sm:p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-[#837a82] hover:text-[#3a332e]">
        ← 데스크로 돌아가기
      </Link>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#9c948b]">Shareable Record</p>
      <h1 className="font-title mb-8 text-3xl text-[#3a332e]">RECORD LOG</h1>

      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <FocusAnalyticsPanel />
        <SubjectMonthlyPanel />
        <FocusRecordsPanel onOpenRecommend={() => setShowRecommendMenu(true)} />
      </div>

      {showRecommendMenu && (
        <TodayRecommendMenu onComplete={handleRecommendedDrink} onClose={() => setShowRecommendMenu(false)} />
      )}
    </main>
  );
}
