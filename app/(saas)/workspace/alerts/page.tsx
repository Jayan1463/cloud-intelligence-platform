import { getAlertsForProject, getSelectedProject } from "@/lib/workspace/data";

type AlertsPageProps = {
  searchParams?: Promise<{
    projectId?: string;
  }>;
};

export default async function WorkspaceAlertsPage({ searchParams }: AlertsPageProps) {
  const params = await searchParams;
  const selectedProject = getSelectedProject(params?.projectId);
  const alerts = getAlertsForProject(params?.projectId);

  return (
    <section className="space-y-4 animate-fade">
      <div className="surface p-5">
        <h2 className="text-2xl font-semibold">Alerts</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Showing {alerts.length} open alerts for {selectedProject.name}
        </p>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="surface-soft p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{alert.type}</p>
            <p className="mt-1 text-sm font-medium text-[var(--text)]">{alert.message}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Severity: {alert.severity}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
