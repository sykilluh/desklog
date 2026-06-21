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
    <div
      className="relative flex items-center justify-center rounded-2xl border-[6px] border-white bg-white p-2 shadow-[0_10px_24px_rgba(168,136,154,0.35)]"
      style={{ width: size, height: size }}
    >
      {imageData ? (
        <div
          className="h-full w-full overflow-hidden rounded-lg border border-angel-pink-100/60 bg-angel-pink-50 shadow-inner"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageData}
            alt="업로드한 사진"
            className="h-full w-full cursor-pointer object-cover object-center"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          />
        </div>
      ) : (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-angel-pink-50 to-sky-blue-50 text-[#a8889a]"
          style={{ fontSize: size * 0.18 }}
        >
          <span>🖼️</span>
          <span style={{ fontSize: size * 0.09 }}>사진 추가</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
