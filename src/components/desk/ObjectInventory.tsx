"use client";

import { useDraggable } from "@dnd-kit/core";
import { OBJECT_CATALOG } from "@/lib/objectCatalog";

function InventoryItem({ objectName, label, emoji }: { objectName: string; label: string; emoji: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `inventory-${objectName}`,
    data: { objectName, source: "inventory" },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center gap-1 rounded-2xl border-2 border-white bg-white/80 px-4 py-3 shadow-sm cursor-grab select-none transition ${
        isDragging ? "opacity-40" : "hover:scale-110 hover:border-angel-pink-200 hover:bg-white"
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-xs text-[#a8889a]">{label}</span>
    </div>
  );
}

export default function ObjectInventory() {
  return (
    <div className="flex flex-wrap gap-3 rounded-3xl border-2 border-white/70 bg-white/50 p-4 shadow-sm backdrop-blur">
      {OBJECT_CATALOG.map((entry) => (
        <InventoryItem key={entry.objectName} {...entry} />
      ))}
    </div>
  );
}
