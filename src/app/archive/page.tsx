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
    backgroundId: "midnight",
    fontId: "sans",
    sticker: "📚",
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
    <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">SNS 공유 카드</h1>

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
            className="w-full rounded-lg bg-amber-500 px-4 py-2 font-medium text-zinc-900 hover:bg-amber-400"
          >
            PNG로 다운로드
          </button>
        </div>
      </div>
    </main>
  );
}
