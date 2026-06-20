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
      className={`flex flex-col items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 cursor-grab select-none ${
        isDragging ? "opacity-40" : "hover:bg-zinc-700"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs text-zinc-300">{label}</span>
    </div>
  );
}

export default function ObjectInventory() {
  return (
    <div className="flex gap-3 rounded-xl bg-zinc-900 p-4">
      {OBJECT_CATALOG.map((entry) => (
        <InventoryItem key={entry.objectName} {...entry} />
      ))}
    </div>
  );
}
