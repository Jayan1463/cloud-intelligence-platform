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

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">SaaS Dashboard</h2>
      <p className="text-[var(--text-muted)]">Multi-tenant control plane for organization and project scoped monitoring.</p>
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Active Projects", String(WORKSPACE_PROJECTS.length)],
          ["Open Alerts", String(alerts.length)],
          ["Avg CPU", selectedProject.avgCpu],
          ["Monthly Cost", selectedProject.monthlyCost]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-sm text-[var(--text-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-[var(--text-muted)]">Viewing: {selectedProject.name}</p>
      <div className="flex gap-3">
        <Link className="inline-block rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950" href={`/workspace/infrastructure?projectId=${selectedProject.id}`}>
        Open Infrastructure View
        </Link>
        <Link className="inline-block rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)]" href={`/workspace/projects?projectId=${selectedProject.id}`}>
          View Projects
        </Link>
      </div>
    </section>
  );
}
