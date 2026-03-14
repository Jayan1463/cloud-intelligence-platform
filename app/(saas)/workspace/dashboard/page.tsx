import Link from "next/link";

export default function WorkspaceDashboardPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">SaaS Dashboard</h2>
      <p className="text-[var(--text-muted)]">Multi-tenant control plane for organization and project scoped monitoring.</p>
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Active Projects", "12"],
          ["Open Alerts", "7"],
          ["Avg CPU", "38%"],
          ["Monthly Cost", "$4,830"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-sm text-[var(--text-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <Link className="inline-block rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950" href="/workspace/infrastructure">
        Open Infrastructure View
      </Link>
    </section>
  );
}
