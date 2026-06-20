"use client";

import { useEffect, useRef, useState } from "react";
import { domToPng } from "modern-screenshot";
import ShareCardTemplate from "@/components/share/ShareCardTemplate";
import CardCustomizer from "@/components/share/CardCustomizer";
import type { ShareCardConfig } from "@/types/shareCard";
import type { ChallengeDTO } from "@/types/challenge";

interface FocusStatistics {
  totalSeconds: number;
  todaySeconds: number;
  mostUsedAudioPreset: string | null;
}

export default function ArchivePage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<FocusStatistics | null>(null);
  const [challenges, setChallenges] = useState<ChallengeDTO[]>([]);
  const [config, setConfig] = useState<ShareCardConfig>({
    backgroundId: "angel-pink",
    fontId: "cute",
    sticker: "🩷",
  });

  useEffect(() => {
    fetch("/api/focus-logs/statistics")
      .then((res) => res.json())
      .then((json) => json.ok && setStats(json.data));

    fetch("/api/challenges")
      .then((res) => res.json())
      .then((json) => json.ok && setChallenges(json.data));
  }, []);

  async function handleDownload() {
    if (!cardRef.current) return;
    const dataUrl = await domToPng(cardRef.current, { scale: 2 });
    const link = document.createElement("a");
    link.download = "desklog-card.png";
    link.href = dataUrl;
    link.click();
  }

  const completed = challenges.find((c) => c.status === "COMPLETED");

  return (
    <main className="min-h-screen p-6 text-[#5b4a52] sm:p-8">
      <a href="/" className="mb-4 inline-block font-cute text-sm text-[#a8889a]">
        ← 데스크로 돌아가기
      </a>
      <h1 className="font-cute mb-6 text-3xl text-[#ff6fa5]">🎀 SNS 공유 카드</h1>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <ShareCardTemplate
          ref={cardRef}
          config={config}
          totalSeconds={stats?.totalSeconds ?? 0}
          audioPresetName={stats?.mostUsedAudioPreset ?? null}
          completedTitle={completed?.title ?? null}
          completedDate={completed ? completed.endDate.slice(0, 10) : null}
        />

        <div className="w-full max-w-sm space-y-4">
          <CardCustomizer config={config} onChange={setConfig} />
          <button
            onClick={handleDownload}
            className="w-full rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-4 py-2.5 font-bold text-white shadow hover:scale-105"
          >
            💾 PNG로 다운로드
          </button>
        </div>
      </div>
    </main>
  );
}
