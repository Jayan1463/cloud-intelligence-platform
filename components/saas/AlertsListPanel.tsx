"use client";

import { useMemo } from "react";
import { useState } from "react";

type AlertItem = {
  id: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "acknowledged" | "resolved";
  triggered_at: string;
};

type AlertsView = "active" | "past";

export default function AlertsListPanel({ initialAlerts, view, canNotify }: { initialAlerts: AlertItem[]; view: AlertsView; canNotify: boolean }) {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [busyId, setBusyId] = useState<string | null>(null);

  const visibleAlerts = useMemo(() => {
    if (view === "past") return alerts.filter((alert) => alert.status === "resolved");
    return alerts.filter((alert) => alert.status !== "resolved");
  }, [alerts, view]);

  async function updateStatus(alertId: string, status: AlertItem["status"]) {
    setBusyId(alertId);
    const response = await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ alertId, status })
    });

    if (response.ok) {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status } : a)));
    }
    setBusyId(null);
  }

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => (
        <div key={alert.id} className="surface-soft p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{alert.type} · {alert.severity}</p>
            <p className="text-xs text-[var(--text-muted)]">{alert.status}</p>
          </div>
          <p className="mt-1 text-sm font-medium text-[var(--text)]">{alert.message}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{new Date(alert.triggered_at).toLocaleString()}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {alert.status !== "resolved" && canNotify ? (
              <button
                disabled={busyId === alert.id}
                onClick={() => void updateStatus(alert.id, "resolved")}
                className="rounded-md border border-[var(--primary)] px-2.5 py-1 text-xs text-[var(--primary)]"
              >
                Notified
              </button>
            ) : null}
            {alert.status === "resolved" && canNotify ? (
              <button
                disabled={busyId === alert.id}
                onClick={() => void updateStatus(alert.id, "open")}
                className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs"
              >
                Reopen
              </button>
            ) : null}
          </div>
        </div>
      ))}
      {visibleAlerts.length === 0 ? <div className="surface-soft p-4 text-sm text-[var(--text-muted)]">No alerts in this view.</div> : null}
    </div>
  );
}
