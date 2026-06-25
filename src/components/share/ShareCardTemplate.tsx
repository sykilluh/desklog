import { forwardRef } from "react";
import { CARD_BACKGROUNDS, CARD_FONTS, type ShareCardConfig } from "@/types/shareCard";

function formatHours(totalSeconds: number) {
  return (totalSeconds / 3600).toFixed(1);
}

const ShareCardTemplate = forwardRef<
  HTMLDivElement,
  {
    config: ShareCardConfig;
    title: string;
    message?: string;
    totalSeconds: number;
    nowPlaying: string | null;
    completedDate: string | null;
  }
>(({ config, title, message, totalSeconds, nowPlaying, completedDate }, ref) => {
  const background = CARD_BACKGROUNDS.find((b) => b.id === config.backgroundId) ?? CARD_BACKGROUNDS[0];
  const font = CARD_FONTS.find((f) => f.id === config.fontId) ?? CARD_FONTS[0];
  const isDark = !config.customImage && config.backgroundId === "black";

  return (
    <div
      ref={ref}
      style={
        config.customImage
          ? { backgroundImage: `url(${config.customImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
      className={`relative flex h-[480px] w-[360px] flex-col justify-between rounded-md border border-[#e3e2de] p-8 shadow-[0_20px_40px_rgba(40,32,28,0.18)] ${
        config.customImage ? "" : background.className
      } ${font.className}`}
    >
      {config.customImage && <div className="absolute inset-0 rounded-md bg-black/35" />}

      {config.sticker && (
        <span
          className={`font-hand absolute right-6 top-6 rotate-6 text-3xl ${
            isDark || config.customImage ? "text-white/80" : "text-[#3a332e]/70"
          }`}
        >
          {config.sticker}
        </span>
      )}

      <div className="relative">
        <p
          className={`text-[11px] uppercase tracking-[0.25em] ${
            isDark || config.customImage ? "text-white/70" : "text-[#9c948b]"
          }`}
        >
          DeskLog · Record
        </p>
        <h2 className={`mt-3 text-2xl font-bold ${isDark || config.customImage ? "text-white" : "text-[#3a332e]"}`}>
          {title || "오늘의 기록"}
        </h2>
        <div className={`mt-4 h-px w-10 ${isDark || config.customImage ? "bg-white/40" : "bg-[#3a332e]/20"}`} />
      </div>

      {message && (
        <div className="relative flex flex-1 items-center justify-center px-2 py-4">
          <p
            className={`font-hand text-center text-xl leading-snug ${
              isDark || config.customImage ? "text-white/90" : "text-[#3a332e]"
            }`}
          >
            “{message}”
          </p>
        </div>
      )}

      <div className="relative space-y-3">
        <div>
          <p className={`text-xs uppercase tracking-wide ${isDark || config.customImage ? "text-white/60" : "text-[#9c948b]"}`}>
            Total Focus
          </p>
          <p className={`text-3xl font-bold ${isDark || config.customImage ? "text-white" : "text-[#d2658f]"}`}>
            {formatHours(totalSeconds)}시간
          </p>
        </div>
        {nowPlaying && (
          <div>
            <p className={`text-xs uppercase tracking-wide ${isDark || config.customImage ? "text-white/60" : "text-[#9c948b]"}`}>
              Now Playing
            </p>
            <p
              className={`line-clamp-2 text-base ${isDark || config.customImage ? "text-white/90" : "text-[#3a332e]"}`}
            >
              {nowPlaying}
            </p>
          </div>
        )}
        {completedDate && (
          <div>
            <p className={`text-xs ${isDark || config.customImage ? "text-white/60" : "text-[#9c948b]"}`}>
              완료 날짜
            </p>
            <p className={`text-lg ${isDark || config.customImage ? "text-white/90" : "text-[#3a332e]"}`}>
              {completedDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ShareCardTemplate.displayName = "ShareCardTemplate";

export default ShareCardTemplate;
