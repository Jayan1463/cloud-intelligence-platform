import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <section className="surface grid-overlay relative overflow-hidden p-8 md:p-12">
        <div className="relative z-10">
          <p className="badge">Cloud Intelligence Platform</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Firebase-style SaaS experience for modern cloud operations.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--text-muted)]">
            Monitor infrastructure, control costs, and manage teams from a clean multi-tenant control plane designed for demos and production roadmaps.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="btn-primary px-5 py-3 text-sm font-semibold" href="/auth/login">
              Open Workspace
            </Link>
            <Link className="btn-secondary px-5 py-3 text-sm font-semibold" href="/workspace/showcase">
              View Showcase
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Observability", "Realtime dashboards, topology, and alert workflows for every project."],
          ["Governance", "Role-based member management and organization controls."],
          ["Cost Intelligence", "Spend-aware operations with trend visibility and optimization signals."]
        ].map(([title, detail]) => (
          <article key={title} className="surface-soft p-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
