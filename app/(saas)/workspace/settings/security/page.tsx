import Link from "next/link";

export default function OrganizationSecurityPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Security & Access</h2>
        <Link className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]" href="/workspace/settings/organization">
          Back to Organization Settings
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Authentication</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>SSO Provider: Not configured</p>
            <p>MFA: Required for admins</p>
            <p>Session Timeout: 12 hours</p>
            <p>Password Policy: Strong</p>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Audit & Governance</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>Audit Log Retention: 90 days</p>
            <p>Last Security Review: March 12, 2026</p>
            <p>Blocked IPs: 4</p>
            <p>Recent Failed Logins (24h): 9</p>
          </div>
        </div>
      </div>
    </section>
  );
}
