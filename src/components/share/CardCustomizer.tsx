"use client";

import { useRef } from "react";
import { CARD_BACKGROUNDS, CARD_FONTS, CARD_STICKERS, type ShareCardConfig } from "@/types/shareCard";

export default function CardCustomizer({
  config,
  onChange,
}: {
  config: ShareCardConfig;
  onChange: (config: ShareCardConfig) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange({ ...config, customImage: reader.result });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5 rounded-2xl border border-[#e3e2de] bg-white p-5 shadow-sm">
      <div>
        <p className="mb-2 text-sm font-semibold text-[#3a332e]">배경</p>
        <div className="flex flex-wrap gap-2">
          {CARD_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onChange({ ...config, backgroundId: bg.id, customImage: null })}
              className={`h-9 w-9 rounded-full border-2 ${bg.className} ${
                !config.customImage && config.backgroundId === bg.id
                  ? "ring-2 ring-ink-600 ring-offset-2"
                  : "border-[#e3e2de]"
              }`}
              title={bg.label}
            />
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="내 사진으로 배경 설정"
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-base font-bold ${
              config.customImage ? "border-ink-600 bg-ink-100 text-ink-600" : "border-dashed border-[#cdc4b8] text-[#9c948b]"
            }`}
          >
            +
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[#3a332e]">폰트</p>
        <div className="flex gap-2">
          {CARD_FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => onChange({ ...config, fontId: font.id })}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${font.className} ${
                config.fontId === font.id
                  ? "border-ink-600 bg-ink-600 text-white"
                  : "border-[#e3e2de] text-[#837a82] hover:border-ink-400"
              }`}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[#3a332e]">스티커</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange({ ...config, sticker: null })}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              config.sticker === null ? "border-ink-600 bg-ink-600 text-white" : "border-[#e3e2de] text-[#837a82]"
            }`}
          >
            없음
          </button>
          {CARD_STICKERS.map((sticker) => (
            <button
              key={sticker}
              onClick={() => onChange({ ...config, sticker })}
              className={`font-hand flex h-8 w-8 items-center justify-center rounded-full border text-lg transition ${
                config.sticker === sticker ? "border-ink-600 bg-ink-100" : "border-[#e3e2de] text-[#3a332e]"
              }`}
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#e3e2de] pt-4">
        <div>
          <p className="text-sm font-semibold text-[#3a332e]">플레이리스트 포함</p>
          <p className="text-xs text-[#9c948b]">지금 듣고 있는 곡을 카드에 같이 보여줘요 (선택)</p>
        </div>
        <button
          onClick={() => onChange({ ...config, includeMusic: !config.includeMusic })}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${config.includeMusic ? "bg-ink-600" : "bg-[#e3e2de]"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              config.includeMusic ? "translate-x-[1.375rem]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
