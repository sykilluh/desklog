export const CARD_BACKGROUNDS = [
  { id: "midnight", label: "미드나이트", className: "bg-gradient-to-br from-zinc-900 to-zinc-700" },
  { id: "amber", label: "앰버", className: "bg-gradient-to-br from-amber-700 to-amber-900" },
  { id: "forest", label: "포레스트", className: "bg-gradient-to-br from-emerald-900 to-zinc-900" },
  { id: "rose", label: "로즈", className: "bg-gradient-to-br from-rose-800 to-zinc-900" },
] as const;

export const CARD_FONTS = [
  { id: "sans", label: "Sans", className: "font-sans" },
  { id: "serif", label: "Serif", className: "font-serif" },
  { id: "mono", label: "Mono", className: "font-mono" },
] as const;

export const CARD_STICKERS = ["📚", "🎧", "☕", "🌙", "✨"];

export interface ShareCardConfig {
  backgroundId: string;
  fontId: string;
  sticker: string | null;
}
