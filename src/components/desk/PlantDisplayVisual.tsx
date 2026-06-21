"use client";

import { useEffect, useState } from "react";

const GROWTH_STAGES = [
  { label: "새싹" },
  { label: "잎새" },
  { label: "꽃봉오리" },
  { label: "튼튼한 나무" },
  { label: "무지개 꽃 만개!" },
];

export default function PlantDisplayVisual({ size }: { size: number }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/plant")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.ok) setStage(json.data.stage ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const s = Math.min(stage, GROWTH_STAGES.length - 1);
  const current = GROWTH_STAGES[s];

  // leaf pairs and stem height scale up with growth stage; the pot itself
  // stays put so the plant reads as actually growing out of it, instead of
  // swapping out a single floating emoji inside a circular badge.
  const leafPairs = [1, 2, 2, 3, 3][s];
  const stemHeight = [0.16, 0.26, 0.32, 0.4, 0.42][s];
  const hasBud = s === 2;
  const hasBloom = s >= 3;
  const rainbowBloom = s === 4;

  return (
    <div
      className="relative"
      style={{ width: size, height: size * 1.15 }}
      title={`내 식물: ${current.label}`}
    >
      {/* ambient shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/15 blur-sm"
        style={{ width: size * 0.5, height: size * 0.08 }}
      />

      <svg width={size} height={size * 1.15} viewBox="0 0 100 115" className="absolute inset-0">
        {/* terracotta pot */}
        <path
          d="M28 78 L72 78 L66 108 a4 4 0 0 1 -4 4 H38 a4 4 0 0 1 -4 -4 Z"
          fill="#d98e5f"
          stroke="#b06f42"
          strokeWidth="1.5"
        />
        <rect x="24" y="72" width="52" height="10" rx="3" fill="#e3a374" stroke="#b06f42" strokeWidth="1.5" />
        {/* soil */}
        <ellipse cx="50" cy="78" rx="22" ry="4" fill="#5b4632" />

        {/* stem */}
        <path
          d={`M50 78 C 50 ${78 - 100 * stemHeight * 0.6}, 48 ${78 - 100 * stemHeight}, 50 ${78 - 100 * stemHeight}`}
          fill="none"
          stroke="#5fa363"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* leaf pairs climbing the stem */}
        {Array.from({ length: leafPairs }).map((_, i) => {
          const t = (i + 1) / (leafPairs + 0.5);
          const y = 78 - 100 * stemHeight * t;
          const leafSize = 9 + i * 1.5;
          return (
            <g key={i}>
              <ellipse
                cx={50 - leafSize}
                cy={y}
                rx={leafSize}
                ry={leafSize * 0.55}
                fill="#7cc285"
                stroke="#5fa363"
                strokeWidth="1"
                transform={`rotate(-25 ${50 - leafSize} ${y})`}
              />
              <ellipse
                cx={50 + leafSize}
                cy={y}
                rx={leafSize}
                ry={leafSize * 0.55}
                fill="#8fd198"
                stroke="#5fa363"
                strokeWidth="1"
                transform={`rotate(25 ${50 + leafSize} ${y})`}
              />
            </g>
          );
        })}

        {/* flower bud */}
        {hasBud && <circle cx="50" cy={78 - 100 * stemHeight} r="5" fill="#ffb3cd" stroke="#e88aab" strokeWidth="1" />}

        {/* full bloom: a center flower plus, at the final stage, extra rainbow-colored blossoms */}
        {hasBloom && (
          <g>
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <ellipse
                key={angle}
                cx={50 + 7 * Math.cos((angle * Math.PI) / 180)}
                cy={78 - 100 * stemHeight + 7 * Math.sin((angle * Math.PI) / 180)}
                rx="6"
                ry="4"
                fill={rainbowBloom ? ["#ffadc6", "#ffd28a", "#fff3a3", "#a8e6a3", "#a8d8ff"][i % 5] : "#ffb3cd"}
                stroke="#e88aab"
                strokeWidth="0.8"
                transform={`rotate(${angle} ${50 + 7 * Math.cos((angle * Math.PI) / 180)} ${78 - 100 * stemHeight + 7 * Math.sin((angle * Math.PI) / 180)})`}
              />
            ))}
            <circle cx="50" cy={78 - 100 * stemHeight} r="4.5" fill="#ffe27a" stroke="#e8b94a" strokeWidth="0.8" />
          </g>
        )}

        {/* tiny seedling sprout tip for stage 0 */}
        {s === 0 && (
          <>
            <ellipse cx="46" cy={78 - 100 * stemHeight} rx="5" ry="3" fill="#8fd198" transform={`rotate(-30 46 ${78 - 100 * stemHeight})`} />
            <ellipse cx="54" cy={78 - 100 * stemHeight} rx="5" ry="3" fill="#7cc285" transform={`rotate(30 54 ${78 - 100 * stemHeight})`} />
          </>
        )}
      </svg>
    </div>
  );
}
