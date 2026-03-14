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
  cpu?: number;
  memory?: number;
  network?: number;
};

export default function CostChart({ data }: { data: Metric[] }) {

  // convert metrics → cost trend
  const chartData = data.map((m, i) => {

    const cpu = m.cpu ?? 0;
    const memory = m.memory ?? 0;
    const network = m.network ?? 0;

    const cost =
      cpu * 0.02 +
      memory * 0.015 +
      network * 0.01;

    return {
      time: i + 1,
      cost: Number(cost.toFixed(2))
    };

  });

  return (

    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl">

      <h2 className="text-xl font-semibold mb-4">
        Cost Prediction Trend
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
            dataKey="cost"
            stroke="#a855f7"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );
}