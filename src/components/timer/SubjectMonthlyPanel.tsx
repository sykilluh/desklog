"use client";

import { useState } from "react";
import { useSubjectMonthlyLogs } from "@/hooks/useSubjectMonthlyLogs";

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * 같은 이름(과목)으로 들어온 집중 시간을 날짜별로 모아서 한 달 단위로 보여준다 —
 * "수학"을 어제도, 오늘도 이어했으면 두 날짜의 양이 따로따로 쌓여서 표시된다.
 */
export default function SubjectMonthlyPanel() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { subjects, isLoading, editDay } = useSubjectMonthlyLogs(year, month);
  const [editing, setEditing] = useState<{ subjectName: string; date: string } | null>(null);
  const [editMinutes, setEditMinutes] = useState("");

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  function startEdit(subjectName: string, date: string, seconds: number) {
    setEditing({ subjectName, date });
    setEditMinutes(String(Math.round(seconds / 60)));
  }

  async function commitEdit() {
    if (!editing) return;
    const minutes = Number(editMinutes);
    if (Number.isFinite(minutes) && minutes >= 0) {
      await editDay(editing.subjectName, editing.date, Math.round(minutes * 60));
    }
    setEditing(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e3e2de] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#e3e2de] px-6 py-4">
        <h2 className="font-title text-base text-[#3a332e]">과목별 월간 기록</h2>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#eeeeec] px-1 py-1">
          <button onClick={() => shiftMonth(-1)} className="rounded-full px-2 py-0.5 text-sm font-bold text-[#5c5650]">
            ◀
          </button>
          <span className="text-xs font-bold text-[#5c5650]">
            {year}년 {month}월
          </span>
          <button onClick={() => shiftMonth(1)} className="rounded-full px-2 py-0.5 text-sm font-bold text-[#5c5650]">
            ▶
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading ? (
          <p className="text-[#837a82]">불러오는 중...</p>
        ) : subjects.length === 0 ? (
          <p className="rounded-2xl bg-mint-50 px-4 py-6 text-center text-sm text-[#7fa087]">
            이 달엔 아직 기록이 없어요.
            <br />
            타이머에 과목 이름을 짓고 시작해보세요!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {subjects.map((subject) => (
              <div key={subject.subjectName} className="rounded-2xl bg-[#f2f2f0] px-4 py-3.5">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#3a332e]">{subject.subjectName}</span>
                  <span className="text-sm font-bold text-[#3f6f43]">{formatDuration(subject.totalSeconds)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {subject.days.map((d) => {
                    const isEditing = editing?.subjectName === subject.subjectName && editing.date === d.date;
                    return isEditing ? (
                      <span key={d.date} className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 ring-2 ring-mint-300">
                        <span className="text-[11px] font-bold text-[#7fa087]">{formatDay(d.date)}</span>
                        <input
                          autoFocus
                          type="number"
                          min={0}
                          value={editMinutes}
                          onChange={(e) => setEditMinutes(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                          className="w-12 rounded-full border border-mint-200 px-1.5 py-0.5 text-[11px] font-bold text-[#3f6f43]"
                        />
                        <span className="text-[11px] font-bold text-[#7fa087]">분</span>
                      </span>
                    ) : (
                      <button
                        key={d.date}
                        onClick={() => startEdit(subject.subjectName, d.date, d.seconds)}
                        title="눌러서 수정"
                        className="rounded-full bg-mint-100 px-2.5 py-1 text-[11px] font-bold text-[#3f6f43] transition hover:bg-mint-200"
                      >
                        {formatDay(d.date)} · {formatDuration(d.seconds)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
