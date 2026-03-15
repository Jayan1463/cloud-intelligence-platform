"use client";

const ITEMS = [
  "CPU threshold exceeded on Project Alpha",
  "Memory spike detected in us-east-1",
  "Network anomaly resolved for worker queue"
];

export default function NotificationCenter() {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-xl border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-sm text-[var(--text)]">
        Notifications ({ITEMS.length})
      </summary>
      <div className="surface absolute right-0 z-20 mt-2 w-80 p-3">
        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
          {ITEMS.map((item) => (
            <li key={item} className="surface-soft p-2.5">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
