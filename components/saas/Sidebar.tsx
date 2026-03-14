"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/workspace/infrastructure", label: "Infrastructure" },
  { href: "/workspace/analytics", label: "Analytics" },
  { href: "/workspace/cost", label: "Cost Intelligence" },
  { href: "/workspace/alerts", label: "Alerts" },
  { href: "/workspace/settings/organization", label: "Organization Settings" }
];

export default function SaaSSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--card)] p-4">
      <p className="mb-4 text-xs uppercase tracking-wide text-[var(--text-muted)]">Cloud Intelligence</p>
      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm transition ${
                active ? "bg-cyan-500/15 text-cyan-300" : "text-[var(--text)] hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
