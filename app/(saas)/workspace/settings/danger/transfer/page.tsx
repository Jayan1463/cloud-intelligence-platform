import Link from "next/link";

export default function TransferOwnershipPage() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-rose-300">Transfer Ownership</h2>
      <div className="rounded-lg border border-rose-300/40 bg-rose-500/5 p-4 text-sm text-[var(--text-muted)]">
        <p>Transfer organization ownership to another admin account.</p>
        <p className="mt-2">Current Owner: admin@test.com</p>
        <p>Target Owner: ops-lead@acmeops.example (pending confirmation)</p>
      </div>
      <div className="flex gap-2">
        <button className="rounded-md border border-rose-300/40 px-3 py-2 text-sm text-rose-300">Send Ownership Transfer Request</button>
        <Link className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]" href="/workspace/settings/organization">Cancel</Link>
      </div>
    </section>
  );
}
