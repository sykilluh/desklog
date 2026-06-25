"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { domToPng } from "modern-screenshot";
import ShareCardTemplate from "@/components/share/ShareCardTemplate";
import CardCustomizer from "@/components/share/CardCustomizer";
import { usePlaylist } from "@/components/providers/PlaylistProvider";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import type { ShareCardConfig } from "@/types/shareCard";
import type { ChallengeDTO } from "@/types/challenge";

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

interface FocusStatistics {
  totalSeconds: number;
  todaySeconds: number;
  mostUsedAudioPreset: string | null;
}

export default function ArchivePage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const playlist = usePlaylist();
  const { sessions } = useFocusSessions();
  const [stats, setStats] = useState<FocusStatistics | null>(null);
  const [challenges, setChallenges] = useState<ChallengeDTO[]>([]);
  const [title, setTitle] = useState("오늘의 기록");
  const [message, setMessage] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [config, setConfig] = useState<ShareCardConfig>({
    backgroundId: "paper",
    fontId: "serif",
    sticker: null,
    includeMusic: false,
  });

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;
  const cardSeconds = selectedSession ? selectedSession.totalSeconds : stats?.totalSeconds ?? 0;

  function handleSelectSession(id: number | null) {
    setSelectedSessionId(id);
    const found = sessions.find((s) => s.id === id);
    if (found) setTitle(found.name);
  }

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
  const nowPlaying = config.includeMusic ? playlist.currentVideoTitle : null;

  return (
    <main className="min-h-screen p-6 text-[#3a332e] sm:p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-[#837a82] hover:text-[#3a332e]">
        ← 데스크로 돌아가기
      </Link>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#9c948b]">Shareable Record</p>
      <h1 className="font-title mb-6 text-3xl text-[#3a332e]">SHARE LOG</h1>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <ShareCardTemplate
          ref={cardRef}
          config={config}
          title={title}
          message={message}
          totalSeconds={cardSeconds}
          nowPlaying={nowPlaying}
          completedDate={completed ? completed.endDate.slice(0, 10) : null}
        />

        <div className="w-full max-w-sm space-y-4">
          {sessions.length > 0 && (
            <div className="rounded-2xl border border-[#e3e2de] bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-[#3a332e]">저장해둔 기록으로 카드 만들기</p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleSelectSession(null)}
                  className={`rounded-xl px-3 py-1.5 text-left text-xs font-bold transition ${
                    selectedSessionId === null ? "bg-angel-pink-50 text-[#d2658f]" : "text-[#837a82] hover:bg-[#eeeeec]"
                  }`}
                >
                  전체 누적 기록 ({((stats?.totalSeconds ?? 0) / 3600).toFixed(1)}시간)
                </button>
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`rounded-xl px-3 py-1.5 text-left text-xs font-bold transition ${
                      selectedSessionId === s.id ? "bg-angel-pink-50 text-[#d2658f]" : "text-[#837a82] hover:bg-[#eeeeec]"
                    }`}
                  >
                    {s.name} ({formatDuration(s.totalSeconds)}){s.isCompleted ? " ✓" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 rounded-2xl border border-[#e3e2de] bg-white p-4 shadow-sm">
            <div>
              <p className="mb-2 text-sm font-semibold text-[#3a332e]">카드 제목 수정</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-full border border-[#e3e2de] bg-white px-4 py-2 text-sm"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[#3a332e]">메시지 (선택)</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="카드 가운데에 남길 한마디를 적어보세요"
                rows={2}
                maxLength={80}
                className="w-full resize-none rounded-2xl border border-[#e3e2de] bg-white px-4 py-2 text-sm placeholder:text-[#b3a8ad]"
              />
            </div>
          </div>

          <CardCustomizer config={config} onChange={setConfig} />

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="press-pop flex-1 rounded-full bg-ink-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-ink-500"
            >
              다운로드
            </button>
            <button
              onClick={handleShare}
              className="press-pop flex-1 rounded-full border border-[#e3e2de] bg-white px-4 py-2.5 font-semibold text-[#3a332e] transition hover:border-ink-400"
            >
              공유하기
            </button>
          </div>
          <button
            onClick={handleEmailShare}
            className="press-pop w-full rounded-full border border-[#e3e2de] bg-white px-4 py-2.5 font-semibold text-[#3a332e] transition hover:border-ink-400"
          >
            이메일로 공유
          </button>
          <p className="text-center text-xs text-[#b3a8ad]">
            카카오톡 공유는 카카오 앱 키 등록 후 연결해드릴게요!
          </p>
        </div>
      </div>
    </main>
  );
}
