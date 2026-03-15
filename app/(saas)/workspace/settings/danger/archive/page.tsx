import Link from "next/link";

export default function ArchiveOrganizationPage() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-rose-300">Archive Organization</h2>
      <div className="rounded-lg border border-rose-300/40 bg-rose-500/5 p-4 text-sm text-[var(--text-muted)]">
        <p>Archiving disables dashboards, API writes, and background alert jobs.</p>
        <p className="mt-2">You can restore archived organizations within 30 days.</p>
      </div>
      <div className="flex gap-2">
        <button className="rounded-md border border-rose-300/40 px-3 py-2 text-sm text-rose-300">Archive Organization</button>
        <Link className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]" href="/workspace/settings/organization">Cancel</Link>
      </div>
    </section>
  );
}
