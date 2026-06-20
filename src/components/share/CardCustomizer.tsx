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
    <div className="space-y-4 rounded-xl bg-zinc-900 p-5">
      <div>
        <p className="mb-2 text-xs text-zinc-400">배경</p>
        <div className="flex gap-2">
          {CARD_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onChange({ ...config, backgroundId: bg.id })}
              className={`h-8 w-8 rounded-full ${bg.className} ${
                config.backgroundId === bg.id ? "ring-2 ring-amber-400" : ""
              }`}
              title={bg.label}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-zinc-400">폰트</p>
        <div className="flex gap-2">
          {CARD_FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => onChange({ ...config, fontId: font.id })}
              className={`rounded-md px-3 py-1 text-xs ${font.className} ${
                config.fontId === font.id ? "bg-amber-500 text-zinc-900" : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-zinc-400">스티커</p>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...config, sticker: null })}
            className={`rounded-md px-2 py-1 text-xs ${
              config.sticker === null ? "bg-amber-500 text-zinc-900" : "bg-zinc-800 text-zinc-300"
            }`}
          >
            없음
          </button>
          {CARD_STICKERS.map((sticker) => (
            <button
              key={sticker}
              onClick={() => onChange({ ...config, sticker })}
              className={`rounded-md px-2 py-1 text-base ${
                config.sticker === sticker ? "bg-amber-500" : "bg-zinc-800"
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
