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
    <main className="min-h-screen p-6 text-[#5b4a52] sm:p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-[#a8889a]">
        ← 데스크로 돌아가기
      </Link>
      <h1 className="font-title mb-6 text-3xl text-[#ff6fa5]">🧋 카페 코너</h1>
      <p className="mb-6 max-w-md text-sm text-[#a8889a]">
        오늘 공부할 때 마실 음료를 직접 만들어보세요. 완성하면 데스크에 컵 오브제로 놓여요.
      </p>

      <div className="mx-auto max-w-md overflow-hidden rounded-3xl border-2 border-white shadow-xl">
        <div className="bg-gradient-to-b from-sky-blue-100 via-[#fdf6f0] to-[#f3dcc0] px-6 pb-6 pt-5">
          {isLoading ? <p className="text-[#a8889a]">불러오는 중...</p> : <CafeCorner onComplete={handleComplete} />}
        </div>
      </div>
    </main>
  );
}
