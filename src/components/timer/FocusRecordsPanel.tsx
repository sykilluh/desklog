"use client";

import { useState } from "react";
import { useGlobalFocusTimer } from "@/components/providers/FocusTimerProvider";
import type { FocusSessionDTO } from "@/hooks/useFocusSessions";

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  return `${m}분 ${s}초`;
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5l.6 9a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-9" />
    </svg>
  );
}

/**
 * Always-visible diary/graph panel for saved focus sessions — sits inline on
 * the page (under the timer card) rather than behind a button as a popup
 * modal, so the records and the graph are visible at a glance every time.
 */
export default function FocusRecordsPanel({ onOpenRecommend }: { onOpenRecommend?: () => void }) {
  const { sessions, renameSession, setSessionCompleted, deleteSession, dailyFocusSeconds: daily } = useGlobalFocusTimer();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const maxSeconds = Math.max(1, ...daily.map((d) => d.seconds));
  const weekTotal = daily.reduce((sum, d) => sum + d.seconds, 0);

  function startEdit(s: FocusSessionDTO) {
    setEditingId(s.id);
    setEditName(s.name);
  }

  function commitEdit() {
    if (editingId != null && editName.trim()) renameSession(editingId, editName.trim());
    setEditingId(null);
  }

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-white/70 bg-white/80 shadow-md backdrop-blur">
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-6 py-3">
        <h2 className="font-title text-lg text-white">📔 공부·독서 다이어리</h2>
        {onOpenRecommend && (
          <button
            onClick={onOpenRecommend}
            className="shrink-0 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#ff6fa5] shadow-sm transition hover:scale-105"
          >
            🥤 오늘의 추천 메뉴
          </button>
        )}
      </div>

      <div className="px-6 py-5">
        {/* graph */}
        <div className="mb-1.5 flex items-baseline justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-[#cdb8c4]">최근 14일</p>
          <p className="text-xs font-bold text-[#ff6fa5]">총 {formatDuration(weekTotal)}</p>
        </div>
        <div className="mb-7 flex h-24 items-end gap-[3px]">
          {daily.map((d, i) => (
            <div key={d.date} className="group flex flex-1 flex-col items-center gap-1.5">
              <div className="relative flex h-20 w-full items-end justify-center">
                <div
                  className="w-full rounded-full bg-angel-pink-200 transition-colors group-hover:bg-angel-pink-400"
                  style={{ height: `${Math.max(6, (d.seconds / maxSeconds) * 100)}%` }}
                />
                {d.seconds > 0 && (
                  <span className="pointer-events-none absolute -top-5 whitespace-nowrap rounded-full bg-[#5b4a52] px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {formatDuration(d.seconds)}
                  </span>
                )}
              </div>
              {i % 2 === 0 && <span className="text-[9px] text-[#cdb8c4]">{formatDay(d.date)}</span>}
            </div>
          ))}
        </div>

        {/* saved records */}
        <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-[#cdb8c4]">저장된 기록</p>
        {sessions.length === 0 ? (
          <p className="rounded-2xl bg-angel-pink-50 px-4 py-6 text-center text-sm text-[#cdb8c4]">
            아직 저장된 기록이 없어요.
            <br />
            타이머에서 이름을 짓고 시작해보세요!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-[#fdf6f0] px-4 py-3">
                <span className="text-lg">{s.isCompleted ? "🌟" : "📌"}</span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      title={s.mode === "stopwatch" ? "타이머(스톱워치) 기록" : "뽀모도로 기록"}
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        s.mode === "stopwatch" ? "bg-sky-blue-100 text-[#2b6f8f]" : "bg-angel-pink-100 text-[#a8576b]"
                      }`}
                    >
                      {s.mode === "stopwatch" ? "⏱️" : "🍅"}
                    </span>
                    {editingId === s.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                        className="w-full rounded-full border border-angel-pink-200 bg-white px-2.5 py-0.5 text-sm"
                      />
                    ) : (
                      <button onClick={() => startEdit(s)} className="block min-w-0 max-w-full truncate text-left text-sm font-bold text-[#5b4a52]">
                        {s.name}
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#cdb8c4]">{new Date(s.createdAt).toLocaleDateString("ko-KR")}</p>
                </div>

                <span className="shrink-0 text-sm font-bold text-[#ff6fa5]">{formatDuration(s.totalSeconds)}</span>

                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setSessionCompleted(s.id, !s.isCompleted)}
                    title={s.isCompleted ? "완료 취소" : "완료로 표시"}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                      s.isCompleted ? "bg-mint-200 text-[#3a6e58]" : "bg-white text-[#cdb8c4] hover:text-mint-400"
                    }`}
                  >
                    <CheckIcon />
                  </button>
                  <button
                    onClick={() => deleteSession(s.id)}
                    title="삭제"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#cdb8c4] transition hover:text-strawberry-milk-400"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
