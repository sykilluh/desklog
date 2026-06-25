"use client";

import { useRef } from "react";

export default function PhotoFrameVisual({
  size,
  imageData,
  onUpload,
}: {
  size: number;
  imageData: string | null;
  onUpload: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onUpload(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    // Extra bottom space for the little easel-stand foot, so the frame reads
    // as a real tabletop frame propped up rather than a flat sticker square.
    <div className="relative" style={{ width: size, height: size * 1.14 }}>
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-[2px]"
        style={{
          width: size * 0.05,
          height: size * 0.16,
          background: "linear-gradient(180deg, #d9b988 0%, #ad8552 100%)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.18)",
        }}
      />

      {/* outer molding: warm gilt gradient with a beveled-edge feel via inset
          highlight/shadow, instead of a flat plastic-looking white border */}
      <div
        className="absolute left-0 top-0 rounded-[10px]"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(145deg, #f6e2c2 0%, #ddb685 45%, #b3875a 100%)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -2px 3px rgba(0,0,0,0.22), 0 10px 22px rgba(168,136,154,0.35)",
        }}
      >
        {/* inner groove between molding and mat, like a real frame's rebate */}
        <div
          className="absolute rounded-[6px]"
          style={{
            inset: size * 0.08,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3), inset 0 -1px 1px rgba(255,255,255,0.45)",
          }}
        />

        {/* mat board */}
        <div
          className="absolute flex items-center justify-center overflow-hidden rounded-[3px] bg-[#fbf6ee] shadow-inner"
          style={{ inset: size * 0.14 }}
        >
          {imageData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageData}
              alt="업로드한 사진"
              className="h-full w-full cursor-pointer object-cover object-center"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            />
          ) : (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="flex h-full w-full flex-col items-center justify-center gap-1 text-[#837a82]"
              style={{ fontSize: size * 0.16 }}
            >
              <span>🖼️</span>
              <span style={{ fontSize: size * 0.08 }}>사진 추가</span>
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
