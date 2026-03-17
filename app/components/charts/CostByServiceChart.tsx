"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ServiceRow = {
  service: string;
  cost: number;
};

export default function CostByServiceChart({ data }: { data: ServiceRow[] }) {
  const chartData = data
    .map((row) => ({ service: row.service, cost: Number(row.cost.toFixed(2)) }))
    .filter((row) => Number.isFinite(row.cost) && row.cost > 0)
    .slice(0, 8);

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Cost by Service</h3>
        <p className="text-xs text-[var(--text-muted)]">Top categories</p>
      </div>
      <div className="mt-3 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 8, right: 8 }} style={{ background: "transparent" }}>
            <CartesianGrid stroke="var(--border)" fill="transparent" vertical={false} />
            <XAxis dataKey="service" stroke="#9ca3af" tickLine={false} axisLine={false} interval={0} minTickGap={20} />
            <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px"
              }}
              cursor={{ fill: "transparent" }}
            />
            <Bar dataKey="cost" fill="var(--primary)" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
