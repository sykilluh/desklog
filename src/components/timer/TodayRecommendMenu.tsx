"use client";

import CafeCorner from "@/components/timer/CafeCorner";

export default function TodayRecommendMenu({
  onComplete,
  onClose,
}: {
  onComplete: (drinkId: string) => void;
  onClose: () => void;
}) {
  return (
    // z-[60] — above the always-on bottom floating bar (z-50, mounted after
    // this in the DOM at the layout level), which otherwise painted over the
    // lower half of this modal and ate clicks on the bottom buttons whenever
    // the modal's content reached down that far.
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-white shadow-2xl"
      >
        {/* shelf backdrop */}
        <div className="bg-gradient-to-b from-sky-blue-100 via-[#f2f2f0] to-[#f3dcc0] px-6 pb-6 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-title text-xl text-[#d2658f]">🧋 오늘의 카페 코너</h2>
            <button onClick={onClose} className="text-sm font-bold text-[#837a82]">
              ✕
            </button>
          </div>

          <CafeCorner onComplete={onComplete} />
        </div>
      </div>
    </div>
  );
}
