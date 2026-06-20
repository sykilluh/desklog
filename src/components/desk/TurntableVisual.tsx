export default function TurntableVisual({ isSpinning }: { isSpinning: boolean }) {
  return (
    <div className="relative h-12 w-12">
      <div
        className={`h-12 w-12 rounded-full bg-[radial-gradient(circle,#27272a_0%,#27272a_15%,#18181b_16%,#18181b_30%,#27272a_31%,#27272a_45%,#18181b_46%,#18181b_60%,#27272a_61%,#27272a_75%,#3f3f46_76%)] shadow-md ${
          isSpinning ? "animate-spin-slow" : ""
        }`}
      >
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500" />
      </div>
      <div
        className={`absolute -right-1 -top-1 h-5 w-1 origin-bottom-right rounded-full bg-zinc-400 transition-transform ${
          isSpinning ? "rotate-[20deg]" : "rotate-0"
        }`}
      />
    </div>
  );
}
