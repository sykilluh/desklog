"use client";

import { useEffect, useRef, useState } from "react";
import { domToPng } from "modern-screenshot";
import ShareCardTemplate from "@/components/share/ShareCardTemplate";
import CardCustomizer from "@/components/share/CardCustomizer";
import { usePlaylist } from "@/components/providers/PlaylistProvider";
import type { ShareCardConfig } from "@/types/shareCard";
import type { ChallengeDTO } from "@/types/challenge";

interface FocusStatistics {
  totalSeconds: number;
  todaySeconds: number;
  mostUsedAudioPreset: string | null;
}

export default function ArchivePage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const playlist = usePlaylist();
  const [stats, setStats] = useState<FocusStatistics | null>(null);
  const [challenges, setChallenges] = useState<ChallengeDTO[]>([]);
  const [title, setTitle] = useState("나의 독서 기록");
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
      .then((json) => {
        if (!json.ok) return;
        setChallenges(json.data);
        const completed = json.data.find((c: ChallengeDTO) => c.status === "COMPLETED");
        if (completed) setTitle(completed.title);
      });
  }, []);

  async function renderCardPng() {
    if (!cardRef.current) return null;
    return domToPng(cardRef.current, { scale: 2 });
  }

  async function handleDownload() {
    const dataUrl = await renderCardPng();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = "desklog-card.png";
    link.href = dataUrl;
    link.click();
  }

  async function handleShare() {
    const dataUrl = await renderCardPng();
    if (!dataUrl) return;

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "desklog-card.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "데스크로그 독서 카드",
        text: `${title} - DeskLog에서 만든 독서 기록 카드예요 🩷`,
      });
      return;
    }

    alert("이 브라우저는 직접 공유를 지원하지 않아요. 카드를 다운로드해서 직접 공유해주세요!");
    handleDownload();
  }

  function handleEmailShare() {
    const subject = encodeURIComponent(`[DeskLog] ${title}`);
    const body = encodeURIComponent(
      `${title}\n총 독서 시간: ${((stats?.totalSeconds ?? 0) / 3600).toFixed(1)}시간\n\n데스크로그에서 만든 카드를 다운로드해서 첨부해주세요!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  const completed = challenges.find((c) => c.status === "COMPLETED");
  const nowPlaying = playlist.currentVideoTitle;

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
          title={title}
          totalSeconds={stats?.totalSeconds ?? 0}
          nowPlaying={nowPlaying}
          completedDate={completed ? completed.endDate.slice(0, 10) : null}
        />

        <div className="w-full max-w-sm space-y-4">
          <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-4 shadow-md backdrop-blur">
            <p className="font-cute mb-2 text-sm text-[#a8889a]">카드 제목 수정</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-full border border-angel-pink-100 bg-white px-4 py-2 text-sm"
            />
          </div>

          <CardCustomizer config={config} onChange={setConfig} />

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-4 py-2.5 font-bold text-white shadow hover:scale-105"
            >
              💾 다운로드
            </button>
            <button
              onClick={handleShare}
              className="flex-1 rounded-full bg-gradient-to-r from-sky-blue-300 to-mint-300 px-4 py-2.5 font-bold text-white shadow hover:scale-105"
            >
              📤 공유하기
            </button>
          </div>
          <button
            onClick={handleEmailShare}
            className="w-full rounded-full border-2 border-angel-pink-200 bg-white px-4 py-2.5 font-bold text-[#5b4a52] shadow-sm hover:bg-angel-pink-50"
          >
            ✉️ 이메일로 공유
          </button>
          <p className="text-center text-xs text-[#cdb8c4]">
            카카오톡 공유는 카카오 앱 키 등록 후 연결해드릴게요!
          </p>
        </div>
      </div>
    </main>
  );
}
