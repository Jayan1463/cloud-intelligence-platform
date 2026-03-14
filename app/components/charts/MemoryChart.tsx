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
  memory?: number;
};

export default function MemoryChart({ data }: { data: Metric[] }) {

  const recent = data.slice(-30);

  const chartData = recent.map((m, i) => ({
    time: i + 1,
    memory: m.memory ?? 0
  }));

  const memorySpike = recent.some(m => (m.memory ?? 0) > 90);

  return (

    <div className="chart-card">

      <h2 className="text-xl font-semibold mb-4 text-[var(--text)]">
        Memory Usage
      </h2>

      <ResponsiveContainer width="100%" height={260}>

        <LineChart data={chartData}>

          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="#9ca3af"
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px"
            }}
          />

          <Line
            type="natural"
            dataKey="memory"
            stroke={memorySpike ? "#ef4444" : "#22c55e"}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            animationDuration={700}
            style={{
              filter: memorySpike
                ? "drop-shadow(0px 0px 10px #ef4444)"
                : "drop-shadow(0px 0px 8px #22c55e)"
            }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}