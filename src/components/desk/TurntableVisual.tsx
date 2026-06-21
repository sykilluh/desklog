"use client";

import { useEffect, useState } from "react";

const REST_ANGLE = -22; // arm lifted, parked off the platter
const PLAY_ANGLE = 24; // arm resting down on an outer groove
const ENGAGE_ANGLE = 4; // crossing this angle while dragging counts as "dropped onto the record"
const MIN_ANGLE = -26;
const MAX_ANGLE = 30;

export default function TurntableVisual({
  isSpinning,
  videoId,
  size,
  onPlayToggle,
  onSeek,
  seekBoost,
}: {
  isSpinning: boolean;
  videoId: string | null;
  size: number;
  onPlayToggle?: (playing: boolean) => void;
  /** Called continuously while the tonearm is dragged across the record, with
   * 0 = outer edge (start of track) and 1 = innermost groove (end of track) —
   * mirrors how moving a real tonearm across the radius moves through the
   * record. Lets the headshell act as a scrub/seek control. */
  onSeek?: (ratio: number) => void;
  /** Bump this (e.g. a counter/timestamp) whenever a skip/seek happens
   * elsewhere (skip buttons, the playlist scrubber) so the disc spins fast
   * for a beat even though nobody's dragging the tonearm right now. */
  seekBoost?: number;
}) {
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  const armLength = size * 0.5;
  const [dragAngle, setDragAngle] = useState<number | null>(null);
  const [isBoosting, setIsBoosting] = useState(false);

  useEffect(() => {
    if (seekBoost === undefined) return;
    setIsBoosting(true);
    const timeout = window.setTimeout(() => setIsBoosting(false), 500);
    return () => window.clearTimeout(timeout);
  }, [seekBoost]);
  const armAngle = dragAngle ?? (isSpinning ? PLAY_ANGLE : REST_ANGLE);

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);

    // Track the drag as a plain pixel delta from the start point rather than
    // recomputing an absolute bearing (atan2) from the pivot on every move.
    // The absolute-bearing version could wrap around unpredictably once the
    // cursor was dragged far from the pivot (e.g. pulled the arm well off
    // the platter), which is what let "lift the arm off" sometimes land back
    // on an angle that still read as "on the record" and kept playing. A
    // pixel delta clamped into [MIN_ANGLE, MAX_ANGLE] has no wrap-around: a
    // big enough pull away always clamps to fully-off, every time.
    const startAngle = armAngle;
    const startX = e.clientX;
    const startY = e.clientY;

    function angleFromDelta(clientX: number, clientY: number) {
      const dx = clientX - startX;
      const dy = clientY - startY;
      // pivot sits at the top-right; swinging the cursor down-and-right
      // sweeps the arm onto the record, up-and-left lifts it off.
      const delta = (dx + dy) / 2.4;
      return Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, startAngle + delta));
    }

    setDragAngle(startAngle);

    function handleMove(moveEvent: PointerEvent) {
      const next = angleFromDelta(moveEvent.clientX, moveEvent.clientY);
      setDragAngle(next);
      if (next > ENGAGE_ANGLE) {
        const ratio = Math.min(1, Math.max(0, (next - ENGAGE_ANGLE) / (MAX_ANGLE - ENGAGE_ANGLE)));
        onSeek?.(ratio);
      }
    }

    function handleUp(upEvent: PointerEvent) {
      const finalAngle = angleFromDelta(upEvent.clientX, upEvent.clientY);
      const playing = finalAngle > ENGAGE_ANGLE;
      onPlayToggle?.(playing);
      setDragAngle(null);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <div className="relative" style={{ width: size, height: size * 1.16 }}>
      {/* ambient shadow under the whole unit */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/20 blur-md"
        style={{ width: size * 0.96, height: size * 0.13 }}
      />
      <div
        className="relative"
        style={{ width: size, height: size, filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.22))" }}
      >
        {/* plinth: transparent body with just a thin outline — reads as a real
            slim deck sitting on the desk rather than an opaque white slab */}
        <div
          className="absolute inset-0 rounded-xl bg-transparent"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.1)" }}
        />

        {/* speed selector switch — small physical detail real tables have */}
        <div
          className="absolute flex items-center gap-[2px] rounded-sm bg-slate-700/90 px-[2px] py-[1px]"
          style={{ left: size * 0.1, bottom: size * 0.055 }}
        >
          <span
            className="rounded-[1px] bg-slate-300 text-center font-bold text-slate-800"
            style={{ fontSize: size * 0.018, width: size * 0.04, lineHeight: `${size * 0.026}px` }}
          >
            33
          </span>
          <span
            className="rounded-[1px] bg-slate-500 text-center font-bold text-slate-100"
            style={{ fontSize: size * 0.018, width: size * 0.04, lineHeight: `${size * 0.026}px` }}
          >
            45
          </span>
        </div>

        {/* platter: thin metal rim only — a 1-2px ring, not a thick chrome bezel */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.96,
            height: size * 0.96,
            left: size * 0.02,
            top: size * 0.02,
            background: "#cbd5e1",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.7)",
          }}
        />

        {/* vinyl disc: matte black with subtle concentric groove rings for realism */}
        <div
          className="absolute overflow-hidden rounded-full"
          style={{
            width: size * 0.935,
            height: size * 0.935,
            left: size * 0.0325,
            top: size * 0.0325,
            animation:
              (dragAngle !== null && dragAngle > ENGAGE_ANGLE) || (isBoosting && isSpinning)
                ? "turntable-spin 0.3s linear infinite" // seeking/skipping: spin fast like winding across the grooves
                : isSpinning
                  ? "turntable-spin 1.8s linear infinite"
                  : undefined,
            background:
              "radial-gradient(circle, #1c1c1e 0%, #1c1c1e 40%, #161616 41%, #1a1a1c 70%, #131314 100%)",
          }}
        >
          {/* groove rings — thin, kept outside the label */}
          {[0.95, 0.88, 0.81, 0.74].map((r) => (
            <div
              key={r}
              className="absolute rounded-full border border-white/[0.06]"
              style={{ width: `${r * 100}%`, height: `${r * 100}%`, left: `${(1 - r) * 50}%`, top: `${(1 - r) * 50}%` }}
            />
          ))}

          {/* video thumbnail fills almost the whole disc, just inside the
              outermost groove ring, instead of sitting as a small center label.
              YouTube's hqdefault thumbnail is a 4:3 frame with black letterbox
              bars baked in around the actual 16:9 video — object-cover alone
              just scales that whole 4:3 image (bars included), so the circle
              still shows black top/bottom. Scaling the img up inside an
              overflow-hidden circular mask crops those bars out instead. */}
          {thumbnailUrl ? (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-white"
              style={{ width: size * 0.92, height: size * 0.92 }}
            >
              <img
                src={thumbnailUrl}
                alt="재생 중인 영상 썸네일"
                className="h-full w-full object-cover"
                style={{ transform: "scale(1.34)" }}
              />
            </div>
          ) : (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gradient-to-br from-angel-pink-200 to-strawberry-milk-200"
              style={{ width: size * 0.36, height: size * 0.36 }}
            />
          )}

          {/* center spindle hub */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 ring-1 ring-white/70"
            style={{ width: size * 0.04, height: size * 0.04 }}
          />
        </div>

        {/* tonearm pivot base (drag handle) — thin metal capsule, like a real tonearm bearing housing */}
        <div
          onPointerDown={handlePointerDown}
          title="톤암을 끌어서 레코드 위에 내리거나, 더 안쪽으로 끌면 빨리감기처럼 재생 위치가 바뀌어요"
          className="absolute cursor-grab rounded-full bg-gradient-to-br from-slate-100 to-slate-300 ring-1 ring-slate-400/50 active:cursor-grabbing"
          style={{
            width: size * 0.13,
            height: size * 0.13,
            right: size * 0.005,
            top: size * 0.005,
            zIndex: 5,
          }}
        />

        {/* rigid tonearm assembly: thin rod + counterweight + headshell/cartridge, all rotating around the pivot like a real arm */}
        <div
          onPointerDown={handlePointerDown}
          className="absolute origin-top-right cursor-grab active:cursor-grabbing"
          style={{
            width: size * 0.018,
            height: armLength,
            right: size * 0.068,
            top: size * 0.068,
            transform: `rotate(${armAngle}deg)`,
            transition: dragAngle === null ? "transform 0.5s ease-out" : "none",
          }}
        >
          {/* enlarged invisible grab target around the tip — the drawn tip is
              tiny at most desk scales, so dragging just the visible pixels
              was unreliable */}
          <div
            onPointerDown={handlePointerDown}
            className="absolute left-1/2 cursor-grab rounded-full active:cursor-grabbing"
            style={{
              width: size * 0.22,
              height: size * 0.22,
              bottom: -size * 0.13,
              transform: "translateX(-50%)",
            }}
          />

          {/* counterweight: small knurled cylinder on the back end, opposite the headshell */}
          <div
            className="absolute -left-1/2 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 ring-1 ring-white/50"
            style={{ width: size * 0.055, height: size * 0.075, top: -size * 0.08 }}
          />

          {/* tonearm rod: thin chrome tube */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-100 via-slate-300 to-slate-400" />

          {/* headshell mount: small white block */}
          <div
            className="absolute -left-1/2 rounded-[2px] bg-gradient-to-br from-slate-100 to-slate-300 ring-1 ring-slate-400/40"
            style={{ width: size * 0.065, height: size * 0.03, bottom: -size * 0.003 }}
          />

          {/* cartridge body: black, clipped under the headshell */}
          <div
            className="absolute -left-1/2 rounded-[2px] bg-gradient-to-br from-[#3a3a3d] to-[#0c0c0e]"
            style={{ width: size * 0.058, height: size * 0.038, bottom: -size * 0.025 }}
          />

          {/* stylus/needle tip touching the groove */}
          <div
            className="absolute rounded-full bg-slate-200"
            style={{ width: size * 0.01, height: size * 0.01, left: size * 0.0, bottom: -size * 0.038 }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes turntable-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
