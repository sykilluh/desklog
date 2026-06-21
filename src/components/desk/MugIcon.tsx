"use client";

import { useEffect, useRef, useState } from "react";

export interface DrinkOption {
  id: string;
  label: string;
  cupFill: string;
  cupStroke: string;
  liquidFill: string;
  liquidStroke: string;
  /** Path under /public to a real product photo. When set, MugIcon renders this
   * photo instead of the drawn SVG cup. */
  photo?: string;
}

export const DRINK_OPTIONS: DrinkOption[] = [
  {
    id: "vanillaLatte",
    label: "Vanilla Latte",
    cupFill: "#fdf3e3",
    cupStroke: "#a8825a",
    liquidFill: "#e8c89a",
    liquidStroke: "#a8825a",
    photo: "/drinks/vanilla-latte.png",
  },
  {
    id: "iceAmericano",
    label: "Iced Americano",
    cupFill: "#f1ece4",
    cupStroke: "#6b4a35",
    liquidFill: "#5c3b28",
    liquidStroke: "#3f2a1c",
    photo: "/drinks/iced-americano.png",
  },
  {
    id: "milkTea",
    label: "Milk Tea",
    cupFill: "#fdf3e3",
    cupStroke: "#a8825a",
    liquidFill: "#d8b48c",
    liquidStroke: "#a8825a",
    photo: "/drinks/milk-tea.png",
  },
  {
    id: "matcha",
    label: "Matcha Latte",
    cupFill: "#eef7e3",
    cupStroke: "#6f8f4a",
    liquidFill: "#9bc26b",
    liquidStroke: "#6f8f4a",
    photo: "/drinks/matcha-latte.png",
  },
];

export function getDrinkOption(id: string | null | undefined): DrinkOption {
  return DRINK_OPTIONS.find((d) => d.id === id) ?? DRINK_OPTIONS[0];
}

function darken(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = Math.max(0, parseInt(h.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(h.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(h.slice(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function lighten(hex: string, amount: number): string {
  return darken(hex, -amount);
}

export default function MugIcon({
  size = 32,
  cupFill = "#ffe4ee",
  cupStroke = "#a8576b",
  liquidFill = "#ffc9dd",
  liquidStroke = "#a8576b",
  variantId,
  photo,
  brewing = false,
  revealed,
}: {
  size?: number;
  cupFill?: string;
  cupStroke?: string;
  liquidFill?: string;
  liquidStroke?: string;
  variantId?: string;
  /** Real photo path; when provided, renders the photo instead of the drawn SVG cup. */
  photo?: string;
  /** Set true to play the ice-then-drink pour-in intro (e.g. when a focus session starts). */
  brewing?: boolean;
  /** Drives a step-by-step "empty cup filling up" reveal instead of showing
   * everything (or the finished photo) at once — used while a drink is
   * being crafted, so the cup visibly gains ice/liquid/cream as each step
   * completes rather than looking done from the very first click. When
   * omitted, falls back to the normal fully-shown (or photo) rendering. */
  revealed?: { ice: boolean; liquid: boolean; cream: boolean };
}) {
  const uid = `${cupFill}-${liquidFill}`.replace(/[^a-zA-Z0-9]/g, "");
  const isIced = variantId === "iceAmericano";
  const hasCrema = variantId === "iceAmericano";
  const hasMilkPour = variantId === "milkTea" || variantId === "vanillaLatte" || variantId === "matcha";
  const showIce = revealed ? revealed.ice : true;
  const showLiquid = revealed ? revealed.liquid : true;
  const showCream = !!revealed?.cream;

  // Replay the pour-in animation only on the false -> true edge of `brewing`
  // (e.g. the moment a focus session starts), not on every re-render while
  // it stays true.
  const [pourKey, setPourKey] = useState(0);
  const prevBrewing = useRef(brewing);
  useEffect(() => {
    if (brewing && !prevBrewing.current) setPourKey((k) => k + 1);
    prevBrewing.current = brewing;
  }, [brewing]);

  // `revealed` always forces the drawn SVG cup (even if a photo is set) —
  // the real product photo is the finished-drink reward shown only once
  // every step is done, not the thing being progressively filled in.
  if (photo && !revealed) {
    return (
      <div key={pourKey} className="pour-photo" style={{ width: size, height: size * 1.1 }}>
        <img
          src={photo}
          alt={variantId ?? "drink"}
          className="h-full w-full object-contain"
          style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }}
        />
        <style jsx>{`
          .pour-photo {
            animation: pour-photo-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards;
          }
          @keyframes pour-photo-in {
            0% {
              transform: translateY(-14px) scale(0.85);
              opacity: 0;
            }
            60% {
              transform: translateY(2px) scale(1.04);
              opacity: 1;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <svg
      key={pourKey}
      width={size}
      height={size}
      viewBox="0 0 48 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.18))" }}
    >
      <defs>
        <linearGradient id={`cupBody-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(cupFill, 8)} />
          <stop offset="100%" stopColor={darken(cupFill, 10)} />
        </linearGradient>
        <linearGradient id={`liquid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(liquidFill, 18)} />
          <stop offset="55%" stopColor={liquidFill} />
          <stop offset="100%" stopColor={darken(liquidFill, 14)} />
        </linearGradient>
        <radialGradient id={`shadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.28)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* shadow under the cup */}
      <ellipse cx="23" cy="48" rx="15" ry="2.6" fill={`url(#shadow-${uid})`} />

      {/* cup body: slight taper, rounded base */}
      <path
        d="M10 21c0-1.1.4-2 1.4-2h23.2c1 0 1.4.9 1.4 2l-2.4 19.5C33 44 29 46.5 23 46.5S13 44 12.4 40.5L10 21z"
        fill={`url(#cupBody-${uid})`}
        stroke={cupStroke}
        strokeWidth="1.6"
      />

      {/* ice cubes drop in first, then the liquid pours in underneath them */}
      {isIced && showIce && (
        <g className="pour-ice" opacity="0.9" style={{ transformOrigin: "23px 22px" }}>
          <rect x="16" y="19.5" width="4.4" height="4.4" rx="0.8" fill="#eaf7ff" stroke="#bfe6f7" strokeWidth="0.8" transform="rotate(-8 18 22)" />
          <rect x="24" y="20.5" width="4" height="4" rx="0.8" fill="#f3fbff" stroke="#bfe6f7" strokeWidth="0.8" transform="rotate(10 26 22)" />
          <rect x="20" y="23.5" width="3.6" height="3.6" rx="0.7" fill="#eaf7ff" stroke="#bfe6f7" strokeWidth="0.8" transform="rotate(4 22 25)" />
        </g>
      )}

      {showLiquid && (
        <g className="pour-liquid" style={{ transformOrigin: "23px 46px" }}>
          {/* liquid surface */}
          <ellipse cx="23" cy="21.3" rx="12.5" ry="3" fill={`url(#liquid-${uid})`} stroke={liquidStroke} strokeWidth="1.2" />

          {/* crema/foam layer for americano (subtle bubbles ring at surface edge) */}
          {hasCrema && !isIced && <ellipse cx="23" cy="20.4" rx="11.5" ry="1.5" fill="#caa37a" opacity="0.55" />}

          {/* milk-pour layered gradient look for latte/milk tea/matcha */}
          {hasMilkPour && (
            <path
              d="M16 21c1.5 1.4 2.7 3 2.7 5.2 0 2-1.2 3.3-1.2 5.2 0 1.7 1 2.7 1 4.3"
              stroke="#fff7ec"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
          )}
        </g>
      )}

      {/* whipped cream dollop — only ever rendered while progressively
          revealing a drink that has a cream step; the finished photo (not
          this drawn version) is the reward once everything is done. */}
      {showCream && (
        <g className="pour-cream" style={{ transformOrigin: "23px 18px" }}>
          <path
            d="M13.5 19c2-3.2 5.3-4.4 9.5-4.4s7.5 1.2 9.5 4.4c-1.1 2.1-4.6 3.2-9.5 3.2s-8.4-1.1-9.5-3.2z"
            fill="#fff8ee"
            stroke="#f0e3cf"
            strokeWidth="1"
          />
          <circle cx="18.5" cy="15" r="2.3" fill="#fff8ee" stroke="#f0e3cf" strokeWidth="0.8" />
          <circle cx="24.5" cy="13.3" r="1.7" fill="#fff8ee" stroke="#f0e3cf" strokeWidth="0.8" />
        </g>
      )}

      {/* rim highlight */}
      <path d="M12.4 22.5c1.6 1 6 1.8 10.6 1.8s9-0.8 10.6-1.8" stroke="rgba(255,255,255,0.55)" strokeWidth="1" fill="none" />

      {/* cup body highlight stripe */}
      <path d="M14 24c-0.3 4 1 11 1.6 15" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {/* handle */}
      <path d="M35.5 25c4.4 0 7 2.3 7 6s-2.6 6.5-7 6.5" stroke={cupStroke} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* steam (omitted for iced drinks) */}
      {!isIced && (
        <>
          <path d="M16 9c-1.5 2-1.5 3.5 0 5.5" stroke="#cdeaff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M23 6c-1.5 2-1.5 3.5 0 5.5" stroke="#cdeaff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.65" />
          <path d="M30 9c-1.5 2-1.5 3.5 0 5.5" stroke="#cdeaff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.5" />
        </>
      )}

      <style jsx>{`
        .pour-ice {
          animation: pour-ice-in 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) backwards;
        }
        .pour-liquid {
          animation: pour-liquid-in 0.5s ease-out backwards;
        }
        .pour-cream {
          animation: pour-cream-in 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) backwards;
        }
        @keyframes pour-cream-in {
          0% {
            transform: translateY(-10px) scale(0.7);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes pour-ice-in {
          0% {
            transform: translateY(-14px) scale(0.6);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.9;
          }
        }
        @keyframes pour-liquid-in {
          0% {
            transform: scaleY(0) translateY(8px);
            opacity: 0;
          }
          100% {
            transform: scaleY(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </svg>
  );
}
