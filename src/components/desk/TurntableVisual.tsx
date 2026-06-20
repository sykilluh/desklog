export default function TurntableVisual({
  isSpinning,
  videoId,
}: {
  isSpinning: boolean;
  videoId: string | null;
}) {
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  return (
    <div className="relative h-28 w-28 drop-shadow-xl">
      <div
        className={`h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-[radial-gradient(circle,#3b2a35_0%,#3b2a35_15%,#1f1620_16%,#1f1620_28%,#3b2a35_29%,#3b2a35_42%,#1f1620_43%,#1f1620_56%,#3b2a35_57%,#3b2a35_70%,#1f1620_71%)] shadow-[0_0_20px_rgba(255,168,203,0.55)] ${
          isSpinning ? "animate-spin-slow" : ""
        }`}
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="재생 중인 영상 썸네일"
            className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-angel-pink-200 object-cover"
          />
        )}
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-angel-pink-300" />
      </div>
      <div
        className={`absolute -right-2 -top-2 h-9 w-1.5 origin-bottom-right rounded-full bg-sky-blue-300 transition-transform ${
          isSpinning ? "rotate-[24deg]" : "rotate-0"
        }`}
      />
    </div>
  );
}
