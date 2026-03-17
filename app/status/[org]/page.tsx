import { notFound } from "next/navigation";

type Props = { params: Promise<{ org: string }> };

export default async function StatusPage({ params }: Props) {
  const { org } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/status/${encodeURIComponent(org)}`, {
    cache: "no-store"
  });

  if (!res.ok) return notFound();
  const payload = (await res.json()) as {
    organization: { name: string; slug: string };
    health: string;
    uptime: number;
    openIncidents: number;
    incidents: Array<{ id: string; message: string; severity: string; triggered_at: string }>;
  };

  return (
    <section className="mx-auto max-w-5xl space-y-4 p-6">
      <div className="surface p-6">
        <h1 className="text-2xl font-semibold">{payload.organization.name} Status</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Health: {payload.health} | Uptime: {payload.uptime}%</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Open incidents: {payload.openIncidents}</p>
      </div>
      <div className="space-y-3">
        {payload.incidents.map((incident) => (
          <div key={incident.id} className="surface-soft p-4">
            <p className="text-sm font-medium">{incident.message}</p>
            <p className="text-xs text-[var(--text-muted)]">{incident.severity} | {incident.triggered_at}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
