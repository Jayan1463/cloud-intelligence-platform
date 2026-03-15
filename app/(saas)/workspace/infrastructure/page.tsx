import TopologyMap from "@/app/components/infrastructure/TopologyMap";

const metrics = Array.from({ length: 30 }, (_, i) => ({
  timestamp: new Date(Date.now() - i * 60000).toISOString(),
  cpu: 35 + ((i * 7) % 40)
}));

export default function WorkspaceInfrastructurePage() {
  return (
    <section className="space-y-4 animate-fade">
      <div className="surface p-5">
        <h2 className="text-2xl font-semibold">Infrastructure</h2>
        <p className="text-[var(--text-muted)]">Project-scoped topology and compute health.</p>
      </div>
      <TopologyMap metrics={metrics} />
    </section>
  );
}
