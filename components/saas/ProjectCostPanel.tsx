"use client";

import { useEffect, useMemo, useState } from "react";
import CostChart from "@/app/components/charts/CostChart";
import ProviderDistributionChart from "@/app/components/charts/ProviderDistributionChart";
import CostByServiceChart from "@/app/components/charts/CostByServiceChart";
import { estimateSampleCost } from "@/lib/cost/model";

type MetricPoint = {
  timestamp?: string;
  server_id?: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
};

type Provider = "AWS" | "Azure" | "GCP";

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickProvider(serverId: string): Provider {
  const n = stableHash(serverId) % 3;
  return n === 0 ? "AWS" : n === 1 ? "Azure" : "GCP";
}

function inferServiceFromSample(sample: MetricPoint): string {
  const cpuCost = Math.max(Number(sample.cpu ?? 0), 0) / 100 * 0.045;
  const storageCost = Math.max(Number(sample.disk ?? 0), 0) / 100 * 100 * 0.00014;
  const networkCost = Math.max(Number(sample.network ?? 0), 0) / 1024 * 0.09;

  const max = Math.max(cpuCost, storageCost, networkCost);
  if (max === cpuCost) return "Compute";
  if (max === storageCost) return "Storage";
  return "Network";
}

export default function ProjectCostPanel({ projectId }: { projectId: string }) {
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const response = await fetch(`/api/metrics?projectId=${encodeURIComponent(projectId)}&limit=180`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { metrics?: MetricPoint[] };
      if (active && response.ok) {
        setMetrics(Array.isArray(payload.metrics) ? payload.metrics : []);
      }
    }
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [projectId]);

  const forecast = useMemo(() => {
    if (!metrics.length) return { hourly: 0, daily: 0, monthly: 0 };
    const total = metrics.reduce((sum, sample) => sum + estimateSampleCost({
      cpuPercent: Number(sample.cpu),
      diskPercent: Number(sample.disk),
      networkUnits: Number(sample.network)
    }), 0);
    const avg = total / metrics.length;
    return {
      hourly: avg,
      daily: avg * 24,
      monthly: avg * 24 * 30
    };
  }, [metrics]);

  const providerBreakdown = useMemo(() => {
    const totals: Record<Provider, number> = { AWS: 0, Azure: 0, GCP: 0 };
    for (const sample of metrics) {
      const serverId = String(sample.server_id ?? "unknown");
      const provider = pickProvider(serverId);
      const cost = estimateSampleCost({
        cpuPercent: Number(sample.cpu),
        diskPercent: Number(sample.disk),
        networkUnits: Number(sample.network)
      });
      totals[provider] += cost;
    }
    return (Object.keys(totals) as Provider[]).map((provider) => ({ provider, cost: totals[provider] }));
  }, [metrics]);

  const serviceBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    for (const sample of metrics) {
      const service = inferServiceFromSample(sample);
      const cost = estimateSampleCost({
        cpuPercent: Number(sample.cpu),
        diskPercent: Number(sample.disk),
        networkUnits: Number(sample.network)
      });
      totals.set(service, (totals.get(service) ?? 0) + cost);
    }
    return Array.from(totals.entries())
      .map(([service, cost]) => ({ service, cost }))
      .sort((a, b) => b.cost - a.cost);
  }, [metrics]);

  if (!metrics.length) {
    return <div className="surface p-5 text-sm text-[var(--text-muted)]">No metric samples yet for cost forecasting.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="kpi-tile"><p className="text-xs text-[var(--text-muted)]">Estimated Hourly</p><p className="mt-1 text-2xl font-semibold">${forecast.hourly.toFixed(2)}</p></div>
        <div className="kpi-tile"><p className="text-xs text-[var(--text-muted)]">Estimated Daily</p><p className="mt-1 text-2xl font-semibold">${forecast.daily.toFixed(2)}</p></div>
        <div className="kpi-tile"><p className="text-xs text-[var(--text-muted)]">Estimated Monthly</p><p className="mt-1 text-2xl font-semibold">${forecast.monthly.toFixed(2)}</p></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ProviderDistributionChart data={providerBreakdown} />
        <CostByServiceChart data={serviceBreakdown} />
      </div>
      <CostChart data={metrics} />
    </div>
  );
}
