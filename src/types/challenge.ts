export interface WeeklyMilestoneDTO {
  weekIndex: number;
  weekStart: string;
  targetPages: number;
}

export interface ChallengeDTO {
  id: number;
  title: string;
  totalPages: number;
  currentPages: number;
  startDate: string;
  endDate: string;
  totalFocusTime: number;
  status: "PROGRESS" | "COMPLETED" | "FAIL";
  dailyGoal: number;
  progressRate: number;
  weeklyMilestones: WeeklyMilestoneDTO[];
}

export interface ChallengeInput {
  title: string;
  totalPages: number;
  startDate: string;
  endDate: string;
}
