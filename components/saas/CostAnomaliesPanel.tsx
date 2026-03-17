"use client";

import { useEffect, useState } from "react";

type Anomaly = {
  service: string;
  expected_cost: number;
  actual_cost: number;
  severity: "low" | "medium" | "high";
  timestamp: string;
};

const severityTone: Record<Anomaly["severity"], string> = {
  high: "text-rose-300 border-rose-400/50 bg-rose-500/10",
  medium: "text-amber-300 border-amber-400/50 bg-amber-500/10",
  low: "text-emerald-300 border-emerald-400/50 bg-emerald-500/10"
};

export default function CostAnomaliesPanel({ projectId }: { projectId: string }) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/cost/anomalies`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!active) return;
      if (response.ok) {
        setAnomalies(Array.isArray(payload.anomalies) ? payload.anomalies : []);
      } else {
        setAnomalies([]);
      }
      setLoading(false);
    }
    void load();
    const timer = setInterval(() => void load(), 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [projectId]);

  return (
    <article className="surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-lg font-semibold">Cost Anomalies</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Detected spikes where cost exceeds 2× historical average.</p>
        </div>
        <span className="badge">Scope: project</span>
      </div>

      {loading ? <p className="mt-3 text-sm text-[var(--text-muted)]">Evaluating cost signals...</p> : null}

      {!loading && anomalies.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">No anomalies detected in the current window.</p>
      ) : null}

      {anomalies.length ? (
        <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)]">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[120px_140px_140px_120px_1fr] gap-3 border-b border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">
              <span>Severity</span>
              <span>Service</span>
              <span>Expected</span>
              <span>Actual</span>
              <span>Timestamp</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {anomalies.slice(0, 10).map((row) => (
                <div key={`${row.service}_${row.timestamp}`} className="grid grid-cols-[120px_140px_140px_120px_1fr] gap-3 px-3 py-2.5 text-sm">
                  <span className={`inline-flex w-fit rounded-md border px-2 py-1 text-xs capitalize ${severityTone[row.severity]}`}>
                    {row.severity}
                  </span>
                  <span className="text-[var(--text)]">{row.service}</span>
                  <span className="text-[var(--text-muted)]">${Number(row.expected_cost).toFixed(2)}</span>
                  <span className="text-[var(--text)] font-medium">${Number(row.actual_cost).toFixed(2)}</span>
                  <span className="text-[var(--text-muted)]">{new Date(row.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

