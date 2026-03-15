import Link from "next/link";

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

export default function PublicShowcasePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <section className="surface grid-overlay relative overflow-hidden p-8 md:p-12">
        <div className="relative z-10">
          <p className="badge">Public Showcase</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Cloud Intelligence Platform Showcase
          </h1>
          <p className="mt-4 max-w-3xl text-base text-[var(--text-muted)]">
            This page is a standalone product preview. The workspace itself still requires authentication.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="btn-primary px-5 py-3 text-sm font-semibold" href="/auth/login">
              Login To Workspace
            </Link>
            <Link className="btn-secondary px-5 py-3 text-sm font-semibold" href="/">
              Back Home
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-2">
        {HIGHLIGHTS.map((item) => (
          <article key={item.title} className="surface-soft p-4">
            <h2 className="text-base font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{item.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
