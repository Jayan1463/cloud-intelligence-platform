import CostChart from "@/app/components/charts/CostChart";

const costData = Array.from({ length: 24 }, (_, i) => ({
  cpu: 35 + ((i * 7) % 40),
  memory: 45 + ((i * 5) % 35),
  network: 25 + ((i * 9) % 30)
}));

export default function WorkspaceCostPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Cost Intelligence</h2>
      <p className="text-[var(--text-muted)]">Project-level spend trends and forecast signals.</p>
      <CostChart data={costData} />
    </section>
  );
}
