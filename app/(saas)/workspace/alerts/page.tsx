export default function WorkspaceAlertsPage() {
  const alerts = [
    { id: "a1", type: "cpu", severity: "high", message: "CPU > 85% on core-api" },
    { id: "a2", type: "memory", severity: "medium", message: "Memory spike on worker queue" },
    { id: "a3", type: "network", severity: "medium", message: "Network anomaly detected" }
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Alerts</h2>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{alert.type}</p>
            <p className="mt-1 text-sm font-medium text-[var(--text)]">{alert.message}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Severity: {alert.severity}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
