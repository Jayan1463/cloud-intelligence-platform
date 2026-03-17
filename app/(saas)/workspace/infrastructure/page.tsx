import Link from "next/link";
import { getWorkspaceProjects, selectProject } from "@/lib/workspace/projects";
import InfrastructureGraph from "@/components/saas/InfrastructureGraph";

type InfrastructurePageProps = {
  searchParams?: Promise<{
    projectId?: string;
  }>;
};

export default async function WorkspaceInfrastructurePage({ searchParams }: InfrastructurePageProps) {
  const params = await searchParams;
  const { projects } = await getWorkspaceProjects();
  const selectedProject = selectProject(projects, params?.projectId);
  if (!selectedProject) {
    return <section className="surface p-6 text-sm text-[var(--text-muted)]">No projects available yet.</section>;
  }
  const scopedHref = (href: string) => `${href}?projectId=${encodeURIComponent(selectedProject.id)}`;

  return (
    <section className="space-y-5 animate-fade">
      <div className="surface overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--card-soft)] px-5 py-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Cloud Operations</p>
          <h2 className="mt-1 text-2xl font-semibold">Infrastructure</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Project-scoped topology and compute health for {selectedProject.name}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-5 py-3 text-sm md:px-6">
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/dashboard")}>Overview</Link>
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/projects")}>Projects</Link>
          <Link className="rounded-md border border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] px-3 py-1.5 text-[var(--primary)]" href={scopedHref("/workspace/infrastructure")}>Infrastructure</Link>
          <Link className="rounded-md border border-transparent px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]" href={scopedHref("/workspace/analytics")}>Metrics</Link>
          <div className="ml-auto badge">Current: {selectedProject.name}</div>
        </div>
      </div>
      <InfrastructureGraph projectId={selectedProject.id} />
    </section>
  );
}
