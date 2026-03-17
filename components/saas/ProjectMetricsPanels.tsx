"use client";

import { useEffect, useMemo, useState } from "react";
import CPUChart from "@/app/components/charts/CPUChart";
import MemoryChart from "@/app/components/charts/MemoryChart";
import DiskChart from "@/app/components/charts/DiskChart";
import NetworkChart from "@/app/components/charts/NetworkChart";

type MetricPoint = {
  id: number;
  project_id: string;
  server_id: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: string;
};

export default function ProjectMetricsPanels({ projectId, className = "" }: { projectId: string; className?: string }) {
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let source: EventSource | null = null;

    async function loadMetrics() {
      try {
        const response = await fetch(`/api/metrics?projectId=${encodeURIComponent(projectId)}&limit=120`, { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as { metrics?: MetricPoint[] };
        if (active && response.ok) {
          setMetrics(Array.isArray(payload.metrics) ? payload.metrics : []);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMetrics();
    const timer = setInterval(() => void loadMetrics(), 15000);
    try {
      source = new EventSource(`/api/realtime?projectId=${encodeURIComponent(projectId)}`);
      source.addEventListener("snapshot", (event) => {
        const payload = JSON.parse((event as MessageEvent).data) as { metrics?: MetricPoint[] };
        if (active && Array.isArray(payload.metrics)) setMetrics(payload.metrics);
      });
    } catch {
      source = null;
    }
    return () => {
      active = false;
      clearInterval(timer);
      source?.close();
    };
  }, [projectId]);

  const chartData = useMemo(() => metrics.map((m) => ({
    cpu: Number(m.cpu),
    memory: Number(m.memory),
    disk: Number(m.disk),
    network: Number(m.network)
  })), [metrics]);

  if (loading && chartData.length === 0) {
    return <div className={`surface p-5 text-sm text-[var(--text-muted)] ${className}`}>Loading live metrics...</div>;
  }

  if (chartData.length === 0) {
    return (
      <div className={`surface p-5 text-sm text-[var(--text-muted)] ${className}`}>
        No live metrics yet. Register a server and start the monitoring agent to populate charts.
      </div>
    );
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 ${className}`}>
      <CPUChart data={chartData} />
      <MemoryChart data={chartData} />
      <DiskChart data={chartData} />
      <NetworkChart data={chartData} />
    </div>
  );
}
