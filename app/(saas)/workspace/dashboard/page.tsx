import Link from "next/link";
import { WORKSPACE_PROJECTS, getAlertsForProject, getSelectedProject } from "@/lib/workspace/data";

type DashboardPageProps = {
  searchParams?: Promise<{
    projectId?: string;
  }>;
};

export default async function WorkspaceDashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const selectedProject = getSelectedProject(params?.projectId);
  const alerts = getAlertsForProject(params?.projectId);
  const kpis = [
    ["Active Projects", String(WORKSPACE_PROJECTS.length), "Across your organization"],
    ["Open Alerts", String(alerts.length), `For ${selectedProject.name}`],
    ["Avg CPU", selectedProject.avgCpu, "Last 24 hours"],
    ["Monthly Cost", selectedProject.monthlyCost, "Estimated current month"]
  ];

  return (
    <section className="space-y-5 animate-fade">
      <div className="surface grid-overlay relative overflow-hidden p-6">
        <div className="relative z-10">
          <p className="badge">Live Environment Summary</p>
          <h2 className="mt-3 text-3xl font-semibold">Operational Command Dashboard</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
            Multi-tenant control plane for infrastructure visibility, cost governance, and policy-driven alerting.
            Current scope: <span className="font-medium text-[var(--text)]">{selectedProject.name}</span>.
          </p>
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

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <article className="surface p-5">
          <h3 className="text-lg font-semibold">What to Review Next</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p className="surface-soft p-3">Alert concentration is highest in compute services. Prioritize CPU saturation alerts before memory anomalies.</p>
            <p className="surface-soft p-3">Billing trend suggests this project will exceed target by 7% unless idle resources are reduced.</p>
            <p className="surface-soft p-3">No critical incidents in the last 12 hours. Network volatility remains medium risk.</p>
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
        </article>
      </div>
    </section>
  );
}
