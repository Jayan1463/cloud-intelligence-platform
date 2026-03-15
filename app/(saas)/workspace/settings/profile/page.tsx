import Link from "next/link";

export default function OrganizationProfilePage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Organization Profile</h2>
        <Link className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]" href="/workspace/settings/organization">
          Back to Organization Settings
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">General</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>Name: Acme Cloud Ops</p>
            <p>Organization ID: org_acme_ops_001</p>
            <p>Primary Email: admin@acmeops.example</p>
            <p>Website: acmeops.example</p>
            <p>Region: ap-northeast-1</p>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="text-base font-semibold">Operational Metadata</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>Created: March 1, 2026</p>
            <p>Owner: admin@acmeops.example</p>
            <p>Environment: Production</p>
            <p>Default Timezone: Asia/Kolkata</p>
            <p>Compliance Tag: SOC2-Ready</p>
          </div>
        </div>
      </div>
    </section>
  );
}
