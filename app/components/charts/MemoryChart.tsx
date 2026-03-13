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

  const chartData = data.map((m, i) => ({
    time: i + 1,
    memory: m.memory ?? 0
  }));

  return (

    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl">

      <h2 className="text-xl font-semibold mb-4">
        Memory Usage
      </h2>

      <ResponsiveContainer width="100%" height={260}>

        <LineChart data={chartData}>

          <CartesianGrid stroke="#27272a" vertical={false} />

          <XAxis
            dataKey="time"
            stroke="#71717a"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="#71717a"
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px"
            }}
          />

          <Line
            type="monotone"
            dataKey="memory"
            stroke="#22c55e"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );
}