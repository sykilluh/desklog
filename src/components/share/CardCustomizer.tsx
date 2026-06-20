"use client";

import { CARD_BACKGROUNDS, CARD_FONTS, CARD_STICKERS, type ShareCardConfig } from "@/types/shareCard";

export default function CardCustomizer({
  config,
  onChange,
}: {
  config: ShareCardConfig;
  onChange: (config: ShareCardConfig) => void;
}) {
  return (
    <div className="space-y-4 rounded-3xl border-2 border-white/70 bg-white/80 p-5 shadow-md backdrop-blur">
      <div>
        <p className="font-cute mb-2 text-sm text-[#a8889a]">배경</p>
        <div className="flex gap-2">
          {CARD_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onChange({ ...config, backgroundId: bg.id })}
              className={`h-9 w-9 rounded-full border-2 border-white ${bg.className} ${
                config.backgroundId === bg.id ? "ring-2 ring-angel-pink-300" : ""
              }`}
              title={bg.label}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="font-cute mb-2 text-sm text-[#a8889a]">폰트</p>
        <div className="flex gap-2">
          {CARD_FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => onChange({ ...config, fontId: font.id })}
              className={`rounded-full px-3 py-1 text-xs ${font.className} ${
                config.fontId === font.id
                  ? "bg-angel-pink-300 text-white"
                  : "bg-angel-pink-50 text-[#a8889a]"
              }`}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-cute mb-2 text-sm text-[#a8889a]">스티커</p>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...config, sticker: null })}
            className={`rounded-full px-2 py-1 text-xs ${
              config.sticker === null ? "bg-angel-pink-300 text-white" : "bg-angel-pink-50 text-[#a8889a]"
            }`}
          >
            없음
          </button>
          {CARD_STICKERS.map((sticker) => (
            <button
              key={sticker}
              onClick={() => onChange({ ...config, sticker })}
              className={`rounded-full px-2 py-1 text-base ${
                config.sticker === sticker ? "bg-angel-pink-200" : "bg-angel-pink-50"
              }`}
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
