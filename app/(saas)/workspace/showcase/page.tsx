const HIGHLIGHTS = [
  {
    title: "Unified Cloud Visibility",
    detail: "Consolidate project-level health, alerts, topology, and performance metrics in one control layer."
  },
  {
    title: "Role-Based Governance",
    detail: "Admin and member experiences are separated with route-level access control and scoped actions."
  },
  {
    title: "FinOps-Aware Operations",
    detail: "Cost intelligence is surfaced with operational data so teams can tune spend and reliability together."
  },
  {
    title: "Actionable Incident Triage",
    detail: "Alerts connect directly to project context for faster root-cause investigation and ownership handoff."
  }
];

export default function ShowcasePage() {
  return (
    <section className="space-y-4 animate-fade">
      <div className="surface grid-overlay relative overflow-hidden p-6">
        <div className="relative z-10">
          <p className="badge">Project Presentation</p>
          <h2 className="mt-3 text-3xl font-semibold">Cloud Intelligence Platform Showcase</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
            This workspace demonstrates how teams can operate cloud applications with Firebase-like simplicity and
            enterprise-grade observability.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {HIGHLIGHTS.map((item) => (
          <article key={item.title} className="surface-soft p-4">
            <h3 className="text-base font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
