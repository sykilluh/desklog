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
          <XAxis dataKey="name" stroke="#cdb8c4" fontSize={11} />
          <YAxis stroke="#cdb8c4" fontSize={11} />
          <Tooltip
            contentStyle={{ background: "#fff5f8", border: "1px solid #ffc9dd", borderRadius: 12 }}
            labelStyle={{ color: "#5b4a52" }}
          />
          <Bar dataKey="targetPages" fill="#ff9fc4" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
