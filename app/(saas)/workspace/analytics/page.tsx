import CPUChart from "@/app/components/charts/CPUChart";
import MemoryChart from "@/app/components/charts/MemoryChart";
import NetworkChart from "@/app/components/charts/NetworkChart";

const metrics = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  cpu: 30 + ((i * 11) % 60),
  memory: 45 + ((i * 5) % 40),
  network: 20 + ((i * 9) % 70)
}));

export default function WorkspaceAnalyticsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Analytics</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <CPUChart data={metrics} />
        <MemoryChart data={metrics} />
      </div>
      <NetworkChart data={metrics} />
    </section>
  );
}
