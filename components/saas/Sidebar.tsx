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
  { href: "/workspace/showcase", label: "Solution Showcase" },
  { href: "/workspace/security-center", label: "Security Center" },
  { href: "/workspace/settings/organization", label: "Organization Settings" }
];

export default function SaaSSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member" | null>(null);

  useEffect(() => {
    async function loadRole() {
      const response = await fetch("/api/auth/profile");
      const payload = await response.json().catch(() => ({}));
      if (response.ok) {
        setRole(payload.role ?? null);
        setEmail(payload.user?.email ?? "");
      }
    }
    void loadRole();
  }, []);

  return (
    <aside className="w-72 shrink-0 p-4 md:p-5">
      <div className="surface grid-overlay relative h-full overflow-hidden p-4 md:p-5">
        <div className="relative z-10">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Cloud Intelligence</p>
            <h2 className="mt-2 text-xl font-semibold leading-tight">Ops Control Center</h2>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="badge">{role === "admin" ? "Admin Access" : "Member Access"}</span>
            {email ? <span className="badge">{email}</span> : null}
          </div>

          <nav className="space-y-2">
        {NAV_ITEMS.filter((item) => role === "admin" || item.href !== "/workspace/settings/organization").map((item) => {
          const active = pathname.startsWith(item.href);
          const href = projectId ? `${item.href}?projectId=${encodeURIComponent(projectId)}` : item.href;
          return (
            <Link
              key={item.href}
              href={href}
              className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "border border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] text-[var(--primary)]"
                  : "border border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-[var(--card-soft)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
