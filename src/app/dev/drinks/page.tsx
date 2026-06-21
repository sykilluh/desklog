"use client";

import { useState } from "react";
import MugIcon, { DRINK_OPTIONS } from "@/components/desk/MugIcon";

export default function DrinkVisualPreviewPage() {
  const [activeId, setActiveId] = useState(DRINK_OPTIONS[0].id);
  const [brewingId, setBrewingId] = useState<string | null>(null);
  const [size, setSize] = useState(180);
  const active = DRINK_OPTIONS.find((d) => d.id === activeId) ?? DRINK_OPTIONS[0];

  function select(id: string) {
    setActiveId(id);
    setBrewingId(null);
    requestAnimationFrame(() => setBrewingId(id));
  }

  return (
    <main className="min-h-screen bg-[#fdf6f0] p-8 text-[#5b4a52]">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-bold">🥤 음료 비주얼 미리보기</h1>
        <p className="mb-6 text-sm text-[#a8889a]">
          항목을 누르면 그 음료 하나만 크게 보여줍니다.
        </p>

        {/* tab list — click an item to show only that drink below */}
        <div className="mb-6 flex flex-wrap gap-2">
          {DRINK_OPTIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => select(d.id)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                activeId === d.id
                  ? "border-angel-pink-300 bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 text-white shadow"
                  : "border-angel-pink-100 bg-white text-[#5b4a52]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <label className="mb-6 flex items-center gap-3 text-sm font-bold">
          크기
          <input
            type="range"
            min={60}
            max={260}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
          <span>{size}px</span>
        </label>

        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-white bg-white/70 p-8 shadow-md">
          <div className="flex h-[320px] w-full items-center justify-center">
            <MugIcon
              key={active.id}
              size={size}
              cupFill={active.cupFill}
              cupStroke={active.cupStroke}
              liquidFill={active.liquidFill}
              liquidStroke={active.liquidStroke}
              variantId={active.id}
              photo={active.photo}
              brewing={brewingId === active.id}
            />
          </div>
          <p className="text-base font-bold">{active.label}</p>
          <code className="text-[10px] text-[#a8889a]">{active.photo}</code>
          <button
            onClick={() => select(active.id)}
            className="rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-4 py-1.5 text-xs font-bold text-white shadow"
          >
            ☕ 붓기 애니메이션 재생
          </button>
        </div>

        <p className="mt-8 text-xs text-[#a8889a]">
          사진을 쓰려면 <code>public/drinks/</code> 폴더에 위 경로와 같은 파일명으로 이미지를 넣어주세요.
          파일이 없으면 자동으로 그려진 SVG 컵으로 표시됩니다.
        </p>
      </div>
    </main>
  );
}
