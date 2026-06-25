"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CafeCorner from "@/components/timer/CafeCorner";
import { useDeskObjects } from "@/hooks/useDeskObjects";
import { useGlobalFocusTimer } from "@/components/providers/FocusTimerProvider";
import type { DeskObjectInput } from "@/types/desk";

export default function CafePage() {
  const router = useRouter();
  const { objects, setObjects, save, isLoading } = useDeskObjects();
  const { isRunning: isTimerRunning, activeSessionId: activeTimerSessionId, startWithoutSession } = useGlobalFocusTimer();

  async function handleComplete(drinkId: string) {
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
    // Persist before navigating away — unlike the in-page recommend modal
    // (which stays mounted on the desk page, so the local state update alone
    // is enough until the next manual "배치 저장하기"), this page navigates
    // to "/" right after, which remounts useDeskObjects and refetches from
    // the API. Without saving here first, the new cup would vanish.
    await save(payload);
    // Same guard as the in-page recommend modal — don't abandon an already
    // running/paused record just because a drink was picked here too.
    if (!isTimerRunning && activeTimerSessionId == null) startWithoutSession();
    router.push("/");
  }

  return (
    <main className="min-h-screen p-6 text-[#3a332e] sm:p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-[#837a82] hover:text-[#3a332e]">
        ← 데스크로 돌아가기
      </Link>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#9c948b]">Cafe Corner</p>
      <h1 className="font-title mb-2 text-3xl text-[#3a332e]">카페 코너</h1>
      <p className="font-hand mb-6 max-w-md text-lg text-[#837a82]">오늘 마실 음료, 직접 만들어볼까요?</p>

      <div className="mx-auto max-w-md overflow-hidden rounded-md border border-[#e3e2de] shadow-[0_18px_36px_rgba(40,32,28,0.14)]">
        <div className="bg-[#ffffff] px-6 pb-6 pt-5">
          {isLoading ? <p className="text-[#837a82]">불러오는 중...</p> : <CafeCorner onComplete={handleComplete} />}
        </div>
      </div>
    </main>
  );
}
