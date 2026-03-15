import Link from "next/link";

export default function OrganizationIntegrationsPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Integrations</h2>
        <Link className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]" href="/workspace/settings/organization">
          Back to Organization Settings
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Connected Services</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>AWS: Connected</p>
            <p>Slack: Connected</p>
            <p>Email Provider: Resend (Dev Log)</p>
            <p>Webhook Endpoints: 2 active</p>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Sync Status</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>Last Sync: Today, 11:48 AM</p>
            <p>Sync Frequency: Every 5 minutes</p>
            <p>Failed Webhooks (24h): 0</p>
            <p>Queued Events: 14</p>
          </div>
        </div>
      </div>
    </section>
  );
}
