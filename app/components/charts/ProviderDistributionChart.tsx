"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type ProviderSlice = {
  provider: "AWS" | "Azure" | "GCP";
  cost: number;
};

const COLORS: Record<ProviderSlice["provider"], string> = {
  AWS: "#2563eb",
  Azure: "#0ea5e9",
  GCP: "#a855f7"
};

export default function ProviderDistributionChart({ data }: { data: ProviderSlice[] }) {
  const chartData = data
    .map((row) => ({ name: row.provider, value: Number(row.cost.toFixed(2)), provider: row.provider }))
    .filter((row) => Number.isFinite(row.value) && row.value > 0);

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Provider Distribution</h3>
        <p className="text-xs text-[var(--text-muted)]">Rolling estimate</p>
      </div>
      <div className="mt-3 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={2}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.provider]} stroke="rgba(255,255,255,0.06)" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid gap-2 text-sm md:grid-cols-3">
        {(["AWS", "Azure", "GCP"] as const).map((provider) => {
          const cost = data.find((row) => row.provider === provider)?.cost ?? 0;
          return (
            <div key={provider} className="surface-soft flex items-center justify-between rounded-xl p-3">
              <span className="text-[var(--text-muted)]">{provider}</span>
              <span className="font-semibold">${cost.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

