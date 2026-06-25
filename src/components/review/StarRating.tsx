"use client";

import { useState } from "react";

function Star({ filled, size, onClick, onHover }: { filled: boolean; size: number; onClick?: () => void; onHover?: () => void }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      onClick={onClick}
      onMouseEnter={onHover}
      className={`cursor-pointer transition-transform ${filled ? "scale-110" : ""}`}
      style={filled ? { filter: "drop-shadow(0 2px 6px rgba(255,111,165,0.6))" } : undefined}
    >
      <defs>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd1e6" />
          <stop offset="50%" stopColor="#ff9fc4" />
          <stop offset="100%" stopColor="#d2658f" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 6.2 6.6.7-5 4.6 1.4 6.5L12 17.6l-5.9 3.1 1.4-6.5-5-4.6 6.6-.7L12 2.5z"
        fill={filled ? "url(#starGradient)" : "#ffeaf2"}
        stroke="#ffb8d3"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function StarRating({
  rating,
  onChange,
  size = 32,
  readOnly = false,
}: {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayRating = hovered ?? rating;

  return (
    <div
      className="flex gap-1"
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          filled={value <= displayRating}
          onClick={readOnly ? undefined : () => onChange?.(value)}
          onHover={readOnly ? undefined : () => setHovered(value)}
        />
      ))}
    </div>
  );
}
