"use client";

import { useEffect, useState } from "react";

type Recommendation = {
  resource: string;
  issue: string;
  recommendation: string;
  estimated_savings: number;
};

export default function CostRecommendationsPanel({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/cost/recommendations`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!active) return;
      if (response.ok) {
        setItems(Array.isArray(payload.recommendations) ? payload.recommendations : []);
      } else {
        setItems([]);
      }
      setLoading(false);
    }
    void load();
    const timer = setInterval(() => void load(), 45000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [projectId]);

  return (
    <article className="surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-lg font-semibold">Optimization Recommendations</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Prioritized actions to reduce waste and improve cost efficiency.</p>
        </div>
        <span className="badge">Top opportunities</span>
      </div>

      {loading ? <p className="mt-3 text-sm text-[var(--text-muted)]">Generating recommendations...</p> : null}
      {!loading && items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">No recommendations available for the current window.</p>
      ) : null}

      {items.length ? (
        <div className="mt-3 space-y-2">
          {items.slice(0, 6).map((item, idx) => (
            <div key={`${item.resource}_${idx}`} className="surface-soft rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{item.resource}</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{item.issue}</p>
                </div>
                <span className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                  Est. savings ${Number(item.estimated_savings).toFixed(0)}/mo
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--text)]">{item.recommendation}</p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

