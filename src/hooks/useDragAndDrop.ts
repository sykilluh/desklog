import type { ClientRect } from "@dnd-kit/core";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function rectToPercent(itemRect: ClientRect, canvasRect: ClientRect) {
  const centerX = itemRect.left + itemRect.width / 2 - canvasRect.left;
  const centerY = itemRect.top + itemRect.height / 2 - canvasRect.top;

  return {
    posX: clamp((centerX / canvasRect.width) * 100, 0, 100),
    posY: clamp((centerY / canvasRect.height) * 100, 0, 100),
  };
}
