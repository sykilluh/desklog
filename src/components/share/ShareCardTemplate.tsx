import { forwardRef } from "react";
import { CARD_BACKGROUNDS, CARD_FONTS, type ShareCardConfig } from "@/types/shareCard";

function formatHours(totalSeconds: number) {
  return (totalSeconds / 3600).toFixed(1);
}

const ShareCardTemplate = forwardRef<
  HTMLDivElement,
  {
    config: ShareCardConfig;
    totalSeconds: number;
    audioPresetName: string | null;
    completedTitle: string | null;
    completedDate: string | null;
  }
>(({ config, totalSeconds, audioPresetName, completedTitle, completedDate }, ref) => {
  const background = CARD_BACKGROUNDS.find((b) => b.id === config.backgroundId) ?? CARD_BACKGROUNDS[0];
  const font = CARD_FONTS.find((f) => f.id === config.fontId) ?? CARD_FONTS[0];

  return (
    <div
      ref={ref}
      className={`relative flex h-[480px] w-[360px] flex-col justify-between rounded-3xl border-4 border-white p-8 text-[#5b4a52] shadow-xl ${background.className} ${font.className}`}
    >
      {config.sticker && <span className="absolute right-6 top-6 text-3xl">{config.sticker}</span>}

      <div>
        <p className="text-sm uppercase tracking-widest text-[#a8889a]">🩷 DeskLog</p>
        <h2 className="mt-2 text-2xl font-bold">{completedTitle ?? "나의 독서 기록"}</h2>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-[#a8889a]">총 독서 시간</p>
          <p className="text-3xl font-bold text-[#ff6fa5]">{formatHours(totalSeconds)}시간</p>
        </div>
        {audioPresetName && (
          <div>
            <p className="text-xs text-[#a8889a]">주요 사운드</p>
            <p className="text-lg">{audioPresetName}</p>
          </div>
        )}
        {completedDate && (
          <div>
            <p className="text-xs text-[#a8889a]">완독 날짜</p>
            <p className="text-lg">{completedDate}</p>
          </div>
        )}
      </div>
    </div>
  );
});

ShareCardTemplate.displayName = "ShareCardTemplate";

export default ShareCardTemplate;
