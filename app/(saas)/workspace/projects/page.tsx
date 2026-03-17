import Link from "next/link";
import AdminProjectCreator from "@/components/saas/AdminProjectCreator";
import { getSessionContext } from "@/lib/auth/session";
import { getWorkspaceProjects, selectProject } from "@/lib/workspace/projects";
import { getRecentMetrics } from "@/lib/database/metrics";
import { listAlerts } from "@/lib/database/alerts";

type ProjectsPageProps = {
  searchParams?: Promise<{
    projectId?: string;
  }>;
};

export default async function WorkspaceProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const session = await getSessionContext();
  const { projects } = await getWorkspaceProjects();
  const selectedProject = selectProject(projects, params?.projectId);
  const scopedHref = (href: string, projectId?: string) =>
    projectId ? `${href}?projectId=${encodeURIComponent(projectId)}` : href;
  const projectRows = await Promise.all(
    projects.map(async (project) => {
      const [projectAlerts, metricRows] = await Promise.all([
        listAlerts(project.id, 20).then((rows) => rows.length).catch(() => 0),
        getRecentMetrics({ projectId: project.id, limit: 30 }).catch(() => [])
      ]);
      const avgCpu = metricRows.length
        ? `${(metricRows.reduce((sum, sample) => sum + Number(sample.cpu), 0) / metricRows.length).toFixed(1)}%`
        : "--";
      return { project, projectAlerts, avgCpu };
    })
  );

  return (
    <section className="space-y-5 animate-fade">
      <div className="surface overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--card-soft)] px-5 py-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Cloud Operations</p>
          <h2 className="mt-1 text-2xl font-semibold">Projects</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Select a project to scope dashboard, alerts, and infrastructure views.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-5 py-3 text-sm md:px-6">
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/dashboard")}>Overview</Link>
          <Link className="rounded-md border border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] px-3 py-1.5 text-[var(--primary)]" href={scopedHref("/workspace/projects")}>Projects</Link>
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/infrastructure")}>Infrastructure</Link>
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/alerts")}>Alerts</Link>
          <div className="ml-auto badge">Current: {selectedProject?.name ?? "No project selected"}</div>
        </div>
      </div>

      {session.role === "admin" ? <AdminProjectCreator /> : null}

      <div className="space-y-3">
        {projectRows.map(({ project, projectAlerts, avgCpu }) => {
          const isActive = project.id === selectedProject?.id;

          return (
            <div key={project.id} className={`p-4 ${isActive ? "surface border-[var(--primary)]" : "surface-soft"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[var(--text)]">{project.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Avg CPU: {avgCpu} | Env: {project.environment} | Region: {project.region} | Open Alerts: {projectAlerts}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link className="btn-secondary px-3 py-2 text-sm" href={scopedHref("/workspace/dashboard", project.id)}>
                    Open Dashboard
                  </Link>
                  <Link className="btn-secondary px-3 py-2 text-sm" href={scopedHref("/workspace/alerts", project.id)}>
                    Open Alerts
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {projects.length === 0 ? (
          <div className="surface p-4 text-sm text-[var(--text-muted)]">
            No projects exist yet. {session.role === "admin" ? "Create your first project above." : "Ask an admin to create a project."}
          </div>
        ) : null}
      </div>
    </section>
  );
}
