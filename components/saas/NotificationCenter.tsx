"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type AlertItem = {
  id: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "acknowledged" | "resolved";
  triggered_at: string;
};

export default function NotificationCenter() {
  const params = useSearchParams();
  const projectId = params.get("projectId");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"active" | "past">("active");
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    let source: EventSource | null = null;

    async function load() {
      if (!projectId) {
        setAlerts([]);
        return;
      }
      const response = await fetch(`/api/alerts?projectId=${encodeURIComponent(projectId)}&limit=8`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { alerts?: AlertItem[] };
      if (active) {
        setAlerts(Array.isArray(payload.alerts) ? payload.alerts : []);
      }
    }

    void load();
    const timer = setInterval(() => void load(), 15000);
    if (projectId) {
      try {
        source = new EventSource(`/api/realtime?projectId=${encodeURIComponent(projectId)}`);
        source.addEventListener("snapshot", (event) => {
          const payload = JSON.parse((event as MessageEvent).data) as { alerts?: AlertItem[] };
          if (active && Array.isArray(payload.alerts)) {
            setAlerts(payload.alerts.slice(0, 8));
          }
        });
      } catch {
        source = null;
      }
    }
    return () => {
      active = false;
      clearInterval(timer);
      source?.close();
    };
  }, [projectId]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const activeAlerts = useMemo(() => alerts.filter((a) => a.status !== "resolved"), [alerts]);
  const pastAlerts = useMemo(() => alerts.filter((a) => a.status === "resolved"), [alerts]);
  const visibleAlerts = useMemo(() => (view === "past" ? pastAlerts : activeAlerts), [activeAlerts, pastAlerts, view]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-sm text-[var(--text)]"
      >
        Alerts ({activeAlerts.length})
      </button>
      {open ? (
        <div className="surface absolute right-0 z-20 mt-2 w-80 p-3">
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("active")}
              className={`rounded-md border px-2 py-1 text-xs ${view === "active" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--text-muted)]"}`}
            >
              Active ({activeAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setView("past")}
              className={`rounded-md border px-2 py-1 text-xs ${view === "past" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--text-muted)]"}`}
            >
              Past ({pastAlerts.length})
            </button>
          </div>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {visibleAlerts.length === 0 ? <li className="surface-soft p-2.5">No alerts in this view</li> : null}
            {visibleAlerts.map((item) => (
              <li key={item.id} className="surface-soft p-2.5">
                <p className="text-xs uppercase tracking-wide">{item.type} · {item.severity}</p>
                <p className="mt-1">{item.message}</p>
                <p className="mt-1 text-xs capitalize">{item.status}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
