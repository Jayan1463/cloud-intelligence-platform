import Link from "next/link";

export default function OrganizationSettingsPage() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Organization Settings</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Profile</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>Organization: Acme Cloud Ops</p>
            <p>Organization ID: org_acme_ops_001</p>
            <p>Primary Email: admin@acmeops.example</p>
            <p>Created: March 1, 2026</p>
            <p>Region: ap-northeast-1</p>
          </div>
          <Link
            className="mt-4 inline-block rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]"
            href="/workspace/settings/profile"
          >
            Edit Organization Profile
          </Link>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Plan & Limits</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>Current Plan: Pro</p>
            <p>Projects: 3 / 25</p>
            <p>Team Members: 5 / 20</p>
            <p>Monthly Events: 1.2M / 5M</p>
            <p>API Rate Limit: 1200 req/min</p>
          </div>
          <Link
            className="mt-4 inline-block rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]"
            href="/workspace/settings/plan"
          >
            Manage Plan
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Security & Access</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>SSO: Not configured</p>
            <p>MFA Requirement: Enabled for admins</p>
            <p>Session Timeout: 12 hours</p>
            <p>Audit Logs Retention: 90 days</p>
            <p>Last Security Review: March 12, 2026</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]"
              href="/workspace/settings/security"
            >
              Configure SSO
            </Link>
            <Link
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]"
              href="/workspace/settings/security"
            >
              View Audit Logs
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Integrations</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>Cloud Provider: AWS (connected)</p>
            <p>Alerting: Email + Slack</p>
            <p>Webhook Endpoints: 2 active</p>
            <p>Resend Delivery Mode: Dev Log</p>
            <p>Last Sync: Today, 11:48 AM</p>
          </div>
          <Link
            className="mt-4 inline-block rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]"
            href="/workspace/settings/integrations"
          >
            Manage Integrations
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-rose-300/40 bg-rose-500/5 p-4">
        <h3 className="text-base font-semibold text-rose-300">Danger Zone</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Irreversible actions for your organization. Use with caution.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="rounded-md border border-rose-300/40 px-3 py-2 text-sm text-rose-300" href="/workspace/settings/danger/transfer">
            Transfer Ownership
          </Link>
          <Link className="rounded-md border border-rose-300/40 px-3 py-2 text-sm text-rose-300" href="/workspace/settings/danger/archive">
            Archive Organization
          </Link>
          <Link className="rounded-md border border-rose-400/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" href="/workspace/settings/danger/delete">
            Delete Organization
          </Link>
        </div>
      </div>
    </section>
  );
}
