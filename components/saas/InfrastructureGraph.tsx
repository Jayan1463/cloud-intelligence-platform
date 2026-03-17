"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";

type ServerItem = {
  id: string;
  name: string;
  ip_address: string;
};

type MetricItem = {
  server_id: string;
  cpu: number;
  memory: number;
  timestamp: string;
};

function getStatus(cpu: number): "healthy" | "warning" | "critical" {
  if (cpu > 90) return "critical";
  if (cpu > 75) return "warning";
  return "healthy";
}

function statusColor(status: "healthy" | "warning" | "critical"): string {
  if (status === "critical") return "#ef4444";
  if (status === "warning") return "#f59e0b";
  return "#22c55e";
}

export default function InfrastructureGraph({ projectId }: { projectId: string }) {
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);

  useEffect(() => {
    let active = true;
    let source: EventSource | null = null;

    async function load() {
      const [serversRes, metricsRes] = await Promise.all([
        fetch(`/api/servers?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" }),
        fetch(`/api/metrics?projectId=${encodeURIComponent(projectId)}&limit=300`, { cache: "no-store" })
      ]);

      const serversJson = (await serversRes.json().catch(() => ({}))) as { servers?: ServerItem[] };
      const metricsJson = (await metricsRes.json().catch(() => ({}))) as { metrics?: MetricItem[] };

      if (!active) return;
      setServers(Array.isArray(serversJson.servers) ? serversJson.servers : []);
      setMetrics(Array.isArray(metricsJson.metrics) ? metricsJson.metrics : []);
    }

    void load();
    const timer = setInterval(() => void load(), 15000);
    try {
      source = new EventSource(`/api/realtime?projectId=${encodeURIComponent(projectId)}`);
      source.addEventListener("snapshot", (event) => {
        const payload = JSON.parse((event as MessageEvent).data) as { servers?: ServerItem[]; metrics?: MetricItem[] };
        if (!active) return;
        if (Array.isArray(payload.servers)) setServers(payload.servers);
        if (Array.isArray(payload.metrics)) setMetrics(payload.metrics);
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

  const latestByServer = useMemo(() => {
    const map = new Map<string, MetricItem>();
    for (const sample of metrics) {
      const existing = map.get(sample.server_id);
      if (!existing || existing.timestamp < sample.timestamp) {
        map.set(sample.server_id, sample);
      }
    }
    return map;
  }, [metrics]);

  const nodes = useMemo<Node[]>(() => {
    return servers.map((server, index) => {
      const latest = latestByServer.get(server.id);
      const cpu = Number(latest?.cpu ?? 0);
      const memory = Number(latest?.memory ?? 0);
      const status = getStatus(cpu);
      const borderColor = statusColor(status);

      return {
        id: server.id,
        position: { x: (index % 4) * 260, y: Math.floor(index / 4) * 160 },
        width: 360,
        style: {
          background: "transparent",
          border: "none",
          padding: 0,
          boxShadow: "none",
          width: 360
        },
        data: {
          label: (
            <div
              className="w-[360px] rounded-3xl bg-[var(--card)] px-6 py-7 text-center"
              style={{ border: `2px solid ${borderColor}` }}
            >
              <p className="text-sm font-semibold text-[var(--text)]">{server.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{server.ip_address}</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">CPU: {cpu.toFixed(1)}%</p>
              <p className="text-xs text-[var(--text-muted)]">Memory: {memory.toFixed(1)}%</p>
              <p className="mt-1 text-xs" style={{ color: borderColor }}>Status: {status}</p>
            </div>
          )
        },
        draggable: false,
        selectable: false
      };
    });
  }, [latestByServer, servers]);

  const edges = useMemo<Edge[]>(() => {
    if (servers.length <= 1) return [];
    const list: Edge[] = [];
    for (let i = 1; i < servers.length; i += 1) {
      list.push({
        id: `e-${servers[i - 1].id}-${servers[i].id}`,
        source: servers[i - 1].id,
        target: servers[i].id,
        animated: true,
        style: { stroke: "#60a5fa" }
      });
    }
    return list;
  }, [servers]);

  if (servers.length === 0) {
    return <div className="surface p-5 text-sm text-[var(--text-muted)]">No servers registered for this project yet.</div>;
  }

  return (
    <div className="surface p-3 md:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Infrastructure Graph</h3>
        <span className="text-xs text-[var(--text-muted)]">React Flow topology</span>
      </div>
      <div className="h-[520px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-soft)]">
        <ReactFlow fitView nodes={nodes} edges={edges}>
          <Controls />
          <Background gap={20} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
