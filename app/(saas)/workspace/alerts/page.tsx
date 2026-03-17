import Link from "next/link";
import { listAlerts } from "@/lib/database/alerts";
import { getWorkspaceProjects, selectProject } from "@/lib/workspace/projects";
import AlertsListPanel from "@/components/saas/AlertsListPanel";
import { getSessionContext } from "@/lib/auth/session";

type AlertsPageProps = {
  searchParams?: Promise<{
    projectId?: string;
    view?: "active" | "past";
  }>;
};

export default async function WorkspaceAlertsPage({ searchParams }: AlertsPageProps) {
  const params = await searchParams;
  const session = await getSessionContext();
  const { projects } = await getWorkspaceProjects();
  const selectedProject = selectProject(projects, params?.projectId);
  if (!selectedProject) {
    return <section className="surface p-6 text-sm text-[var(--text-muted)]">No projects available yet.</section>;
  }

  const allAlerts = await listAlerts(selectedProject.id, 200)
    .then((rows) => rows.map((row) => ({
      id: row.id,
      type: row.type,
      message: row.message,
      severity: row.severity,
      status: row.status,
      triggered_at: row.triggered_at
    })))
    .catch(() => []);

  const view = params?.view === "past" ? "past" : "active";
  const alerts = view === "active"
    ? allAlerts.filter((a) => a.status !== "resolved")
    : allAlerts.filter((a) => a.status === "resolved");

  const scopedHref = (href: string, nextView?: "active" | "past") => {
    const qs = new URLSearchParams();
    qs.set("projectId", selectedProject.id);
    qs.set("view", nextView ?? view);
    return `${href}?${qs.toString()}`;
  };

  return (
    <section className="space-y-5 animate-fade">
      <div className="surface overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--card-soft)] px-5 py-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Cloud Operations</p>
          <h2 className="mt-1 text-2xl font-semibold">Alerts</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Showing {alerts.length} alerts ({view}) for {selectedProject.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-5 py-3 text-sm md:px-6">
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/dashboard")}>Overview</Link>
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/projects")}>Projects</Link>
          <Link className="rounded-md border border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] px-3 py-1.5 text-[var(--primary)]" href={scopedHref("/workspace/alerts")}>Alerts</Link>
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/security-center")}>Security</Link>
          <div className="ml-auto flex items-center gap-2">
            <Link className={`rounded-md border px-3 py-1.5 text-xs ${view === "active" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--text-muted)]"}`} href={scopedHref("/workspace/alerts", "active")}>Active</Link>
            <Link className={`rounded-md border px-3 py-1.5 text-xs ${view === "past" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--text-muted)]"}`} href={scopedHref("/workspace/alerts", "past")}>Past</Link>
            <div className="badge">Current: {selectedProject.name}</div>
          </div>
        </div>
      </div>

      <AlertsListPanel initialAlerts={allAlerts} view={view} canNotify={session.role === "admin"} />
    </section>
  );
}
