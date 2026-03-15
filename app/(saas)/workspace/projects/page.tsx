import Link from "next/link";
import { WORKSPACE_ALERTS, WORKSPACE_PROJECTS, getSelectedProject } from "@/lib/workspace/data";

type ProjectsPageProps = {
  searchParams?: Promise<{
    projectId?: string;
  }>;
};

export default async function WorkspaceProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const selectedProject = getSelectedProject(params?.projectId);

  return (
    <section className="space-y-4 animate-fade">
      <div className="surface p-5">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <p className="text-[var(--text-muted)]">Select a project to scope dashboards, alerts, and infrastructure views.</p>
      </div>
      <div className="space-y-3">
        {WORKSPACE_PROJECTS.map((project) => {
          const projectAlerts = WORKSPACE_ALERTS.filter((alert) => alert.projectId === project.id).length;
          const isActive = project.id === selectedProject.id;

          return (
            <div key={project.id} className={`p-4 ${isActive ? "surface border-[var(--primary)]" : "surface-soft"}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[var(--text)]">{project.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Avg CPU: {project.avgCpu} | Monthly Cost: {project.monthlyCost} | Open Alerts: {projectAlerts}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link className="btn-secondary px-3 py-2 text-sm" href={`/workspace/dashboard?projectId=${project.id}`}>
                    Open Dashboard
                  </Link>
                  <Link className="btn-secondary px-3 py-2 text-sm" href={`/workspace/alerts?projectId=${project.id}`}>
                    Open Alerts
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
