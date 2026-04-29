"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const trend = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 76 },
  { day: "Wed", score: 79 },
  { day: "Thu", score: 83 },
  { day: "Fri", score: 86 },
  { day: "Sat", score: 88 },
  { day: "Sun", score: 91 },
];

export function ProductivityChart() {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 text-base font-semibold">Productivity Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <XAxis dataKey="day" stroke="#9aa6c3" />
            <YAxis stroke="#9aa6c3" />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#7c8cff" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

