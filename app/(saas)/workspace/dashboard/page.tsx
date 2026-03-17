import Link from "next/link";
import ProjectMetricsPanels from "@/components/saas/ProjectMetricsPanels";
import { getWorkspaceProjects, selectProject } from "@/lib/workspace/projects";
import { listAlerts } from "@/lib/database/alerts";
import { getRecentMetrics } from "@/lib/database/metrics";
import { estimateSampleCost } from "@/lib/cost/model";
import { computeHealthScore } from "@/lib/org/health-score";
import { getSessionContext } from "@/lib/auth/session";
import { resolveOrganizationId } from "@/lib/database/organizations";
import { evaluateProjectAlertsFromRecentMetrics, evaluateServerHeartbeatAlerts } from "@/lib/alerts/engine";

type DashboardPageProps = {
  searchParams?: Promise<{
    projectId?: string;
    mode?: "panel" | "query";
  }>;
};

export default async function WorkspaceDashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const { projects } = await getWorkspaceProjects();
  const selectedProject = selectProject(projects, params?.projectId);
  if (!selectedProject) {
    return (
      <section className="surface p-6">
        <h2 className="text-2xl font-semibold">Project Dashboard</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">No projects available. Ask an admin to create a project.</p>
      </section>
    );
  }
  const session = await getSessionContext();
  if (session.user) {
    await resolveOrganizationId(session.orgId, session.user.email)
      .then(async (orgId) => {
        await evaluateProjectAlertsFromRecentMetrics({ organizationId: orgId, projectId: selectedProject.id, limit: 240 });
        await evaluateServerHeartbeatAlerts({ organizationId: orgId, projectId: selectedProject.id });
      })
      .catch(() => null);
  }

  const alerts = await listAlerts(selectedProject.id, 20)
    .then((rows) => rows.map((row) => ({
      id: row.id,
      severity: row.severity,
      message: row.message,
      status: row.status,
      triggeredAt: row.triggered_at
    })))
    .catch(() => []);
  const activeAlerts = alerts.filter((alert) => alert.status !== "resolved");
  const metrics = await getRecentMetrics({ projectId: selectedProject.id, limit: 60 }).catch(() => []);
  const avgCpu = metrics.length
    ? `${(metrics.reduce((sum, sample) => sum + Number(sample.cpu), 0) / metrics.length).toFixed(1)}%`
    : "--";
  const monthlyCost = metrics.length
    ? `$${metrics.reduce((sum, sample) => sum + estimateSampleCost({
      cpuPercent: Number(sample.cpu),
      diskPercent: Number(sample.disk),
      networkUnits: Number(sample.network)
    }), 0).toFixed(2)}`
    : "--";
  const health = computeHealthScore({ metrics, alerts });
  const mode = params?.mode === "query" ? "query" : "panel";
  const scopedHref = (href: string) => {
    const next = new URLSearchParams();
    next.set("projectId", selectedProject.id);
    if (mode === "query") next.set("mode", "query");
    return `${href}?${next.toString()}`;
  };
  const kpis = [
    ["Active Projects", String(projects.length), "Across your organization"],
    ["Open Alerts", String(activeAlerts.length), `For ${selectedProject.name}`],
    ["Avg CPU", avgCpu, "Last 24 hours"],
    ["Monthly Cost", monthlyCost, "Estimated rolling total"]
  ];
  const severityTone: Record<(typeof alerts)[number]["severity"], string> = {
    critical: "text-red-200 border-red-400/60 bg-red-600/15",
    high: "text-rose-300 border-rose-400/50 bg-rose-500/10",
    medium: "text-amber-300 border-amber-400/50 bg-amber-500/10",
    low: "text-emerald-300 border-emerald-400/50 bg-emerald-500/10"
  };

  return (
    <section className="space-y-5 animate-fade">
      <div className="surface overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--card-soft)] px-5 py-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Cloud Operations</p>
          <h2 className="mt-1 text-2xl font-semibold">Project Dashboard</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Live control view for <span className="font-medium text-[var(--text)]">{selectedProject.name}</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-5 py-3 text-sm md:px-6">
          <Link className="rounded-md border border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] px-3 py-1.5 text-[var(--primary)]" href={scopedHref("/workspace/dashboard")}>Overview</Link>
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/infrastructure")}>Infrastructure</Link>
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/analytics")}>Metrics</Link>
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/alerts")}>Alerts</Link>
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/cost")}>Cost</Link>
          <div className="ml-auto text-xs text-[var(--text-muted)]">Updated: just now</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <p className="badge">Environment: Production</p>
            <p className="badge">Scope: {selectedProject.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/workspace/dashboard?projectId=${encodeURIComponent(selectedProject.id)}&mode=panel`}
              className={`rounded-md border px-3 py-1.5 text-xs ${mode === "panel" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--text-muted)]"}`}
            >
              Panel view
            </Link>
            <Link
              href={`/workspace/dashboard?projectId=${encodeURIComponent(selectedProject.id)}&mode=query`}
              className={`rounded-md border px-3 py-1.5 text-xs ${mode === "query" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--text-muted)]"}`}
            >
              Query builder
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {kpis.map(([label, value, detail], index) => (
          <div key={label} className="kpi-tile animate-rise" style={{ animationDelay: `${index * 80}ms` }}>
            <p className="text-sm text-[var(--text-muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{detail}</p>
          </div>
        ))}
      </div>

      <div className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="text-lg font-semibold">Organization Health Score</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Composite score across cost efficiency, utilization, alerts, and performance.</p>
          </div>
          <span className="badge">Score: {health.score} / 100</span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div className="surface-soft p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Cost efficiency</p>
            <p className="mt-2 text-2xl font-semibold">{health.breakdown.costEfficiency}</p>
          </div>
          <div className="surface-soft p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Utilization</p>
            <p className="mt-2 text-2xl font-semibold">{health.breakdown.utilization}</p>
          </div>
          <div className="surface-soft p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Alerts</p>
            <p className="mt-2 text-2xl font-semibold">{health.breakdown.alerts}</p>
          </div>
          <div className="surface-soft p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Performance</p>
            <p className="mt-2 text-2xl font-semibold">{health.breakdown.performance}</p>
          </div>
        </div>
        {health.notes.length ? (
          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Insights</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
              {health.notes.slice(0, 3).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <ProjectMetricsPanels projectId={selectedProject.id} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
            <h3 className="text-lg font-semibold">Latest Alerts</h3>
            <Link className="text-xs text-[var(--primary)] hover:underline" href={`/workspace/alerts?projectId=${selectedProject.id}`}>
              Open alert center
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)]">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[110px_1fr_120px] gap-3 border-b border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">
                <span>Severity</span>
                <span>Message</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {(mode === "query" ? alerts.slice(0, 6) : alerts.slice(0, 4)).map((alert) => (
                  <div key={alert.id} className="grid grid-cols-[110px_1fr_120px] gap-3 px-3 py-2.5 text-sm">
                    <span className={`inline-flex w-fit rounded-md border px-2 py-1 text-xs capitalize ${severityTone[alert.severity]}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[var(--text-muted)]">{alert.message}</span>
                    <span className="text-[var(--text-muted)] capitalize">{alert.status.replace("_", " ")}</span>
                  </div>
                ))}
                {alerts.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-[var(--text-muted)]">No alerts yet. Alerts will appear when CPU, memory, disk, or network thresholds are crossed.</div>
                ) : null}
              </div>
            </div>
          </div>
        </article>

        <article className="surface p-5">
          <h3 className="text-lg font-semibold">Action Center</h3>
          <div className="mt-3 flex flex-col gap-2">
            <Link className="btn-primary px-4 py-2 text-sm font-medium text-center" href={`/workspace/infrastructure?projectId=${selectedProject.id}`}>
              Open Infrastructure View
            </Link>
            <Link className="btn-secondary px-4 py-2 text-sm font-medium text-center" href={`/workspace/projects?projectId=${selectedProject.id}`}>
              Manage Projects
            </Link>
            <Link className="btn-secondary px-4 py-2 text-sm font-medium text-center" href={`/workspace/alerts?projectId=${selectedProject.id}`}>
              Triage Alerts
            </Link>
          </div>
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Recommendations</p>
            <ul className="mt-2 space-y-2 text-sm text-[var(--text-muted)]">
              <li>Scale down idle worker pool after 20:00 UTC.</li>
              <li>Enable stricter alert rule for API latency.</li>
              <li>Review cost anomaly on compute cluster A.</li>
            </ul>
          </div>
          {mode === "query" ? (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Query Builder</p>
              <p className="mt-2 rounded-md border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2 font-mono text-xs text-[var(--text-muted)]">
                {`SELECT * FROM alerts WHERE project_id = "${selectedProject.id}" ORDER BY severity DESC LIMIT 20;`}
              </p>
            </div>
          ) : null}
        </article>
      </div>

      <div className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <h3 className="text-lg font-semibold">Operational Notes</h3>
          <span className="text-xs text-[var(--text-muted)]">Panel view</span>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-[var(--text-muted)] md:grid-cols-3">
          <p className="surface-soft p-3">Alert concentration is highest in compute services. Prioritize CPU saturation before memory anomalies.</p>
          <p className="surface-soft p-3">Billing trend suggests this project may exceed target by 7% unless idle resources are reduced.</p>
          <p className="surface-soft p-3">No critical incidents in the last 12 hours. Network volatility remains medium risk.</p>
        </div>
      </div>
    </section>
  );
}
