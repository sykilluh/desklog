export function getRemainingDays(now: Date, endDate: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function computeDailyGoal(
  totalPages: number,
  currentPages: number,
  endDate: Date,
  now: Date = new Date()
) {
  const remainingPages = Math.max(0, totalPages - currentPages);
  const remainingDays = getRemainingDays(now, endDate);
  return Math.ceil(remainingPages / remainingDays);
}

export function computeProgressRate(totalPages: number, currentPages: number) {
  if (totalPages <= 0) return 0;
  return Math.min(100, Math.round((currentPages / totalPages) * 1000) / 10);
}

export interface WeeklyMilestone {
  weekIndex: number;
  weekStart: string;
  targetPages: number;
}

export function buildWeeklyMilestones(
  totalPages: number,
  currentPages: number,
  startDate: Date,
  endDate: Date
): WeeklyMilestone[] {
  const remainingPages = Math.max(0, totalPages - currentPages);
  const totalDays = Math.max(1, getRemainingDays(startDate, endDate));
  const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));
  const pagesPerWeek = Math.ceil(remainingPages / totalWeeks);

  return Array.from({ length: totalWeeks }, (_, weekIndex) => {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + weekIndex * 7);
    return {
      weekIndex,
      weekStart: weekStart.toISOString().slice(0, 10),
      targetPages: Math.min(remainingPages, pagesPerWeek * (weekIndex + 1)),
    };
  });
}
