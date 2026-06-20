export default function TurntableVisual({
  isSpinning,
  videoId,
  size,
}: {
  isSpinning: boolean;
  videoId: string | null;
  size: number;
}) {
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  const armLength = size * 0.32;

  return (
    <div className="relative drop-shadow-xl" style={{ width: size, height: size }}>
      <div
        className={`overflow-hidden rounded-full border-4 border-white bg-[radial-gradient(circle,#3b2a35_0%,#3b2a35_15%,#1f1620_16%,#1f1620_28%,#3b2a35_29%,#3b2a35_42%,#1f1620_43%,#1f1620_56%,#3b2a35_57%,#3b2a35_70%,#1f1620_71%)] shadow-[0_0_20px_rgba(255,168,203,0.55)] ${
          isSpinning ? "animate-spin-slow" : ""
        }`}
        style={{ width: size, height: size }}
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="재생 중인 영상 썸네일"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-angel-pink-200 object-cover"
            style={{ width: size * 0.58, height: size * 0.58 }}
          />
        )}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-angel-pink-300"
          style={{ width: size * 0.1, height: size * 0.1 }}
        />
      </div>
      <div
        className="absolute origin-bottom-right rounded-full bg-sky-blue-300 transition-transform"
        style={{
          width: size * 0.05,
          height: armLength,
          right: -size * 0.06,
          top: -size * 0.06,
          transform: isSpinning ? "rotate(24deg)" : "rotate(0deg)",
        }}
      />
    </div>
  );
}
