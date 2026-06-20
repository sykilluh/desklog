export const CARD_BACKGROUNDS = [
  { id: "angel-pink", label: "엔젤핑크", className: "bg-gradient-to-br from-angel-pink-200 to-strawberry-milk-200" },
  { id: "sky-blue", label: "스카이블루", className: "bg-gradient-to-br from-sky-blue-200 to-mint-100" },
  { id: "mint", label: "민트초코", className: "bg-gradient-to-br from-mint-200 to-sky-blue-100" },
  { id: "strawberry-milk", label: "딸기우유", className: "bg-gradient-to-br from-strawberry-milk-300 to-angel-pink-100" },
] as const;

export const CARD_FONTS = [
  { id: "cute", label: "큐트", className: "font-cute" },
  { id: "round", label: "라운드", className: "font-round" },
  { id: "sans", label: "Sans", className: "font-sans" },
] as const;

export const CARD_STICKERS = ["📚", "🎧", "☕", "🌈", "✨", "🩷"];

export interface ShareCardConfig {
  backgroundId: string;
  fontId: string;
  sticker: string | null;
}
