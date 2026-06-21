export interface DeskBackgroundOption {
  id: string;
  label: string;
  emoji: string;
  className: string;
}

// CSS gradient/pattern presets only — no external image assets.
export const DESK_BACKGROUND_OPTIONS: DeskBackgroundOption[] = [
  {
    id: "default",
    label: "기본 파스텔",
    emoji: "🩷",
    className: "bg-gradient-to-br from-angel-pink-50 via-sky-blue-50 to-mint-50",
  },
  {
    id: "wood",
    label: "우드 데스크매트",
    emoji: "🪵",
    // layered to read as actual wood: wavy grain lines (repeating-linear-gradient
    // with slight angle variance per layer) + plank seams, over a warm brown base
    // — a single flat diagonal stripe gradient (the old version) just looked like
    // a brown ramp, not wood.
    className:
      "bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.05)_0px,transparent_3px,transparent_180px,rgba(0,0,0,0.05)_183px)," +
      "repeating-linear-gradient(0.4deg,rgba(255,228,186,0.12)_0px,transparent_2px,transparent_7px,rgba(120,72,38,0.1)_9px,transparent_11px)," +
      "repeating-linear-gradient(-0.6deg,rgba(255,228,186,0.08)_0px,transparent_3px,transparent_13px,rgba(90,54,28,0.12)_15px,transparent_18px)," +
      "linear-gradient(100deg,#caa06c_0%,#b9885a_35%,#a8754a_65%,#94613c_100%)]",
  },
  {
    id: "mint",
    label: "파스텔 민트",
    emoji: "🌿",
    className: "bg-gradient-to-br from-mint-100 via-mint-50 to-sky-blue-50",
  },
  {
    id: "pink",
    label: "파스텔 핑크",
    emoji: "🌸",
    className: "bg-gradient-to-br from-angel-pink-100 via-strawberry-milk-50 to-angel-pink-50",
  },
  {
    id: "linen",
    label: "소프트 리넨 그레이",
    emoji: "🧵",
    className: "bg-gradient-to-br from-[#f4f1ec] via-[#e9e5dd] to-[#dcd7cd]",
  },
];

export const CUSTOM_BACKGROUND_OPTION: DeskBackgroundOption = {
  id: "custom",
  label: "내 사진",
  emoji: "🖼️",
  className: "bg-gradient-to-br from-angel-pink-50 to-sky-blue-50",
};

export function getDeskBackground(id: string | null | undefined): DeskBackgroundOption {
  if (id === "custom") return CUSTOM_BACKGROUND_OPTION;
  return DESK_BACKGROUND_OPTIONS.find((b) => b.id === id) ?? DESK_BACKGROUND_OPTIONS[0];
}
