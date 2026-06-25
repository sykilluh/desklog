export const CARD_BACKGROUNDS = [
  { id: "paper", label: "페이퍼", className: "bg-[#fdfbf7]" },
  { id: "white", label: "화이트", className: "bg-white" },
  { id: "black", label: "블랙", className: "bg-ink-600" },
  { id: "angel-pink", label: "핑크", className: "bg-angel-pink-50" },
  { id: "sky-blue", label: "블루", className: "bg-sky-blue-50" },
  { id: "mint", label: "세이지", className: "bg-mint-50" },
] as const;

export const CARD_FONTS = [
  { id: "serif", label: "Serif", className: "font-title" },
  { id: "hand", label: "Hand", className: "font-hand" },
  { id: "sans", label: "Sans", className: "font-sans" },
] as const;

/** Plain glyphs instead of colorful emoji — reads as a wax-seal/stamp mark on
 * the card rather than a sticker-book sticker. Rendered in ink, not color. */
export const CARD_STICKERS = ["✦", "◆", "☾", "❀", "—", "♪"];

export interface ShareCardConfig {
  backgroundId: string;
  fontId: string;
  sticker: string | null;
  /** Data URL of a user-uploaded photo, used as the card background instead
   * of a preset swatch when set — takes priority over backgroundId. */
  customImage?: string | null;
  /** Whether to show the currently-playing playlist track on the card —
   * opt-in since not everyone wants what they're listening to public. */
  includeMusic?: boolean;
}
