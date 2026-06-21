export interface ObjectCatalogEntry {
  objectName: string;
  label: string;
  emoji: string;
}

export const OBJECT_CATALOG: ObjectCatalogEntry[] = [
  { objectName: "turntable", label: "턴테이블", emoji: "🎵" },
  { objectName: "lamp", label: "조명", emoji: "💡" },
  { objectName: "plant", label: "식물", emoji: "🌱" },
  { objectName: "plantDisplay", label: "내 식물 전시", emoji: "🪴" },
  { objectName: "book", label: "책", emoji: "📚" },
  { objectName: "cup", label: "머그컵", emoji: "☕" },
  { objectName: "doll", label: "인형", emoji: "🧸" },
  { objectName: "mouse", label: "마우스", emoji: "🖱️" },
  { objectName: "monitor", label: "모니터", emoji: "🖥️" },
  { objectName: "candle", label: "캔들", emoji: "🕯️" },
  { objectName: "photoFrame", label: "포토 프레임", emoji: "🖼️" },
  { objectName: "deskClock", label: "데스크 타이머", emoji: "⏰" },
];

export function getEmoji(objectName: string) {
  return OBJECT_CATALOG.find((entry) => entry.objectName === objectName)?.emoji ?? "❓";
}
