const SECURITY_ITEMS = [
  { control: "MFA Enforcement", state: "Enabled", detail: "Admin-level operations require additional verification in production." },
  { control: "Session Cookies", state: "Active", detail: "HTTP-only cookie sessions are used for role-scoped access control." },
  { control: "Organization Access Checks", state: "Passing", detail: "API routes validate org and project scope before data access." },
  { control: "Webhook Signature Validation", state: "Enabled", detail: "Incoming automation hooks are authenticated before processing." }
];

export default function SecurityCenterPage() {
  return (
    <section className="space-y-4 animate-fade">
      <div className="surface p-5">
        <h2 className="text-2xl font-semibold">Security Center</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Snapshot of core security controls and governance checks for this SaaS platform.
        </p>
      </div>

      <div className="space-y-3">
        {SECURITY_ITEMS.map((item) => (
          <article key={item.control} className="surface-soft flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold">{item.control}</h3>
              <p className="text-sm text-[var(--text-muted)]">{item.detail}</p>
            </div>
            <span className="badge">{item.state}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
