"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

type Metric = {
  disk?: number;
};

export default function DiskChart({ data }: { data: Metric[] }) {
  const recent = data.slice(-30);
  const chartData = recent.map((m, i) => ({ time: i + 1, disk: m.disk ?? 0 }));
  const xTicks = chartData
    .map((point) => point.time)
    .filter((time, index, arr) => index % 2 === 0 || time === arr[arr.length - 1]);

  return (
    <div className="chart-card">
      <h2 className="mb-4 text-xl font-semibold text-[var(--text)]">Disk Usage</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="time" stroke="#9ca3af" tickLine={false} axisLine={false} ticks={xTicks} interval={0} minTickGap={20} />
          <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
          <Line
            type="natural"
            dataKey="disk"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
            isAnimationActive
            animationDuration={700}
            style={{ filter: "drop-shadow(0px 0px 8px #06b6d4)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
