import Link from "next/link";

export default function DeleteOrganizationPage() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-rose-300">Delete Organization</h2>
      <div className="rounded-lg border border-rose-400/60 bg-rose-500/10 p-4 text-sm text-[var(--text-muted)]">
        <p>This permanently deletes the organization and all projects, members, and metrics.</p>
        <p className="mt-2">This action cannot be undone.</p>
      </div>
      <div className="flex gap-2">
        <button className="rounded-md border border-rose-400/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">Confirm Permanent Delete</button>
        <Link className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]" href="/workspace/settings/organization">Cancel</Link>
      </div>
    </section>
  );
}
