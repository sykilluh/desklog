"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeeklyMilestoneDTO } from "@/types/challenge";

export default function ProgressChart({ milestones }: { milestones: WeeklyMilestoneDTO[] }) {
  const data = milestones.map((m) => ({
    name: `${m.weekIndex + 1}주차`,
    targetPages: m.targetPages,
  }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
          <YAxis stroke="#71717a" fontSize={11} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
            labelStyle={{ color: "#e4e4e7" }}
          />
          <Bar dataKey="targetPages" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
