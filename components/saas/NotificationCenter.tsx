"use client";

const ITEMS = [
  "CPU threshold exceeded on Project Alpha",
  "Memory spike detected in us-east-1",
  "Network anomaly resolved for worker queue"
];

export default function NotificationCenter() {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]">
        Notifications ({ITEMS.length})
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-80 rounded-md border border-[var(--border)] bg-[var(--card)] p-3 shadow-xl">
        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
          {ITEMS.map((item) => (
            <li key={item} className="rounded-md border border-[var(--border)] p-2">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
