"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/workspace/dashboard", label: "Dashboard" },
  { href: "/workspace/projects", label: "Projects" },
  { href: "/workspace/infrastructure", label: "Infrastructure" },
  { href: "/workspace/analytics", label: "Analytics" },
  { href: "/workspace/cost", label: "Cost Intelligence" },
  { href: "/workspace/alerts", label: "Alerts" },
  { href: "/workspace/settings/organization", label: "Organization Settings" }
];

export default function SaaSSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [role, setRole] = useState<"admin" | "member" | null>(null);

  useEffect(() => {
    async function loadRole() {
      const response = await fetch("/api/auth/profile");
      const payload = await response.json().catch(() => ({}));
      if (response.ok) {
        setRole(payload.role ?? null);
      }
    }
    void loadRole();
  }, []);

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--card)] p-4">
      <p className="mb-4 text-xs uppercase tracking-wide text-[var(--text-muted)]">Cloud Intelligence</p>
      <nav className="space-y-2">
        {NAV_ITEMS.filter((item) => role === "admin" || item.href !== "/workspace/settings/organization").map((item) => {
          const active = pathname.startsWith(item.href);
          const href = projectId ? `${item.href}?projectId=${encodeURIComponent(projectId)}` : item.href;
          return (
            <Link
              key={item.href}
              href={href}
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
