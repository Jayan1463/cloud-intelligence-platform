export default function OrganizationSettingsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Organization Settings</h2>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-sm text-[var(--text-muted)]">Organization: Acme Cloud Ops</p>
        <p className="text-sm text-[var(--text-muted)]">Plan: Pro</p>
      </div>
    </section>
  );
}
