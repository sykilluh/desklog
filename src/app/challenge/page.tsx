import ChallengeScheduler from "@/components/dashboard/ChallengeScheduler";

export default function ChallengePage() {
  return (
    <main className="min-h-screen p-6 text-[#5b4a52] sm:p-8">
      <a href="/" className="mb-4 inline-block font-cute text-sm text-[#a8889a]">
        ← 데스크로 돌아가기
      </a>
      <h1 className="font-cute mb-6 text-3xl text-[#3a6e58]">📖 완독 데드라인 챌린지</h1>
      <div className="mx-auto max-w-2xl">
        <ChallengeScheduler />
      </div>
    </main>
  );
}
