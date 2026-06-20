import ChallengeScheduler from "@/components/dashboard/ChallengeScheduler";

export default function ChallengePage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">완독 데드라인 챌린지</h1>
      <div className="mx-auto max-w-2xl">
        <ChallengeScheduler />
      </div>
    </main>
  );
}
