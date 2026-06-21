import Link from "next/link";
import ChallengeScheduler from "@/components/dashboard/ChallengeScheduler";
import TodoChecklist from "@/components/dashboard/TodoChecklist";

export default function ChallengePage() {
  return (
    <main className="min-h-screen p-6 text-[#5b4a52] sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-[#a8889a]">
          ← 데스크로 돌아가기
        </Link>
        <Link href="/plant" className="text-sm font-bold text-[#3a6e58]">
          🌱 식물 키우기 →
        </Link>
      </div>
      <h1 className="font-title mb-6 text-3xl text-[#3a6e58]">📖 독서 기록 & 할 일</h1>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <ChallengeScheduler />
        <TodoChecklist />
      </div>
    </main>
  );
}
