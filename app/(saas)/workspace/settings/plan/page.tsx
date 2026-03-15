import Link from "next/link";

export default function OrganizationPlanPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Plan & Limits</h2>
        <Link className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]" href="/workspace/settings/organization">
          Back to Organization Settings
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Current Subscription</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>Plan: Pro</p>
            <p>Billing Cycle: Monthly</p>
            <p>Renewal Date: April 1, 2026</p>
            <p>Status: Active</p>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Usage Limits</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>Projects: 3 / 25</p>
            <p>Members: 5 / 20</p>
            <p>Monthly Events: 1.2M / 5M</p>
            <p>Storage: 420 GB / 2 TB</p>
            <p>API Rate: 1200 req/min</p>
          </div>
        </div>
      </div>
    </section>
  );
}
