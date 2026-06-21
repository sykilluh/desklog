import type { ClientRect, Modifier } from "@dnd-kit/core";

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

/**
 * Clamps a desk object's center position (in %) so that its full rendered
 * footprint (in px, accounting for scale) stays inside the canvas bounds,
 * rather than letting the center alone reach the very edge (which would let
 * half the object hang outside the desk).
 */
export function clampPercentToFootprint(
  posX: number,
  posY: number,
  footprintPx: number,
  canvasWidthPx: number,
  canvasHeightPx: number
) {
  if (canvasWidthPx <= 0 || canvasHeightPx <= 0) {
    return { posX: clamp(posX, 0, 100), posY: clamp(posY, 0, 100) };
  }
  const halfWidthPct = ((footprintPx / 2) / canvasWidthPx) * 100;
  const halfHeightPct = ((footprintPx / 2) / canvasHeightPx) * 100;

  // When the footprint is bigger than the canvas, halfPct > 50 and the clamp
  // bounds cross over (min > max). Snap to whichever flush-edge bound is
  // nearest the dragged position instead of always collapsing to the same
  // fixed point — keeps an oversized object flush against the edge you
  // dragged it toward rather than yanking it back to the center.
  return {
    posX: clampOrNearestEdge(posX, halfWidthPct, 100 - halfWidthPct),
    posY: clampOrNearestEdge(posY, halfHeightPct, 100 - halfHeightPct),
  };
}

/**
 * dnd-kit modifier: clamps the live drag transform so the dragged node's
 * footprint never visually exits a given container element, giving direct
 * 1:1 cursor-following with clamping ONLY at the true edge (no mid-drag
 * snapping/jitter). Uses `draggingNodeRect`, which dnd-kit captures once at
 * drag start, as the reference rect — so the clamp math stays consistent
 * for the whole gesture instead of being recomputed from a moving target.
 */
/**
 * Clamps a value into [min, max] — but if the item is bigger than the
 * container in this axis, min ends up greater than max (two "flush to one
 * edge" positions that have crossed over). clamp()/Math.min(max, ...) would
 * then always collapse to the same fixed point regardless of where the
 * cursor is, which is the "snaps back to one spot no matter where I drag"
 * bug. Instead, stick to whichever flush-edge position is nearest the
 * cursor's raw (unclamped) position, so an oversized item still tracks the
 * drag direction and rests flush against the edge you dragged it toward.
 */
function clampOrNearestEdge(value: number, min: number, max: number) {
  if (min <= max) return clamp(value, min, max);
  return Math.abs(value - min) <= Math.abs(value - max) ? min : max;
}

export function createBoundsClampModifier(getContainer: () => HTMLElement | null): Modifier {
  return ({ transform, draggingNodeRect }) => {
    if (typeof document === "undefined") return transform;
    const container = getContainer();
    if (!container || !draggingNodeRect) return transform;

    const containerRect = container.getBoundingClientRect();

    const minX = containerRect.left - draggingNodeRect.left;
    const maxX = containerRect.right - draggingNodeRect.right;
    const minY = containerRect.top - draggingNodeRect.top;
    const maxY = containerRect.bottom - draggingNodeRect.bottom;

    return {
      ...transform,
      x: clampOrNearestEdge(transform.x, minX, maxX),
      y: clampOrNearestEdge(transform.y, minY, maxY),
    };
  };
}
