export interface ObjectCatalogEntry {
  objectName: string;
  label: string;
  emoji: string;
}

export const OBJECT_CATALOG: ObjectCatalogEntry[] = [
  { objectName: "turntable", label: "턴테이블", emoji: "🎵" },
  { objectName: "lamp", label: "조명", emoji: "💡" },
  { objectName: "plant", label: "식물", emoji: "🌱" },
  { objectName: "book", label: "책", emoji: "📚" },
  { objectName: "cup", label: "머그컵", emoji: "☕" },
];

export function getEmoji(objectName: string) {
  return OBJECT_CATALOG.find((entry) => entry.objectName === objectName)?.emoji ?? "❓";
}
