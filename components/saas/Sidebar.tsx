"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { AppRole } from "@/types/auth";

const SIDEBAR_MIN = 252;
const SIDEBAR_MAX = 420;
const SIDEBAR_DEFAULT = 296;
const SIDEBAR_COLLAPSED = 96;

type IconKey = "dashboard" | "projects" | "alerts" | "infrastructure" | "analytics" | "cost" | "security" | "members" | "settings";

const NAV_GROUPS = [
  {
    title: "Project Overview",
    items: [
      { href: "/workspace/dashboard", label: "Overview", icon: "dashboard" as IconKey },
      { href: "/workspace/projects", label: "Projects", icon: "projects" as IconKey },
      { href: "/workspace/alerts", label: "Alerts", icon: "alerts" as IconKey }
    ]
  },
  {
    title: "Infrastructure",
    items: [
      { href: "/workspace/infrastructure", label: "Infrastructure", icon: "infrastructure" as IconKey },
      { href: "/workspace/analytics", label: "Analytics", icon: "analytics" as IconKey },
      { href: "/workspace/cost", label: "Cost", icon: "cost" as IconKey }
    ]
  },
  {
    title: "Security & Settings",
    items: [
      { href: "/workspace/security-center", label: "Security", icon: "security" as IconKey },
      { href: "/workspace/settings/members", label: "Members", icon: "members" as IconKey, adminOnly: true },
      { href: "/workspace/settings/organization", label: "Settings", icon: "settings" as IconKey, adminOnly: true }
    ]
  }
];

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function SidebarIcon({ kind, className = "h-5 w-5" }: { kind: IconKey; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    viewBox: "0 0 24 24",
    "aria-hidden": true
  };

  switch (kind) {
    case "dashboard":
      return <svg {...common}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>;
    case "projects":
      return <svg {...common}><path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /><path d="M3 9h18" /></svg>;
    case "alerts":
      return <svg {...common}><path d="M15 17H5a2 2 0 0 1-2-2v-1c2-1 3-3 3-6a6 6 0 1 1 12 0c0 3 1 5 3 6v1a2 2 0 0 1-2 2h-4" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>;
    case "infrastructure":
      return <svg {...common}><rect x="3" y="5" width="18" height="6" rx="1.5" /><rect x="3" y="13" width="18" height="6" rx="1.5" /><path d="M7 8h.01M7 16h.01" /></svg>;
    case "analytics":
      return <svg {...common}><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15v-4" /><path d="M12 15V9" /><path d="M16 15V7" /></svg>;
    case "cost":
      return <svg {...common}><path d="M12 3v18" /><path d="M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3" /></svg>;
    case "security":
      return <svg {...common}><path d="M12 3l8 4v5c0 5-3.5 8.8-8 10-4.5-1.2-8-5-8-10V7l8-4z" /></svg>;
    case "members":
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="8" r="3" /><path d="M19 8v6" /><path d="M22 11h-6" /></svg>;
    case "settings":
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z" /></svg>;
  }
}

export default function SaaSSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(SIDEBAR_DEFAULT);

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

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("cip_sidebar_collapsed");
    const savedWidth = localStorage.getItem("cip_sidebar_width");
    if (savedCollapsed === "1") setCollapsed(true);
    if (savedWidth) setWidth(clamp(Number(savedWidth) || SIDEBAR_DEFAULT, SIDEBAR_MIN, SIDEBAR_MAX));
  }, []);

  useEffect(() => {
    localStorage.setItem("cip_sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem("cip_sidebar_width", String(width));
  }, [width]);

  function startResize(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (collapsed) return;
    const startX = e.clientX;
    const startW = width;

    function onMove(ev: MouseEvent) {
      setWidth(clamp(startW + (ev.clientX - startX), SIDEBAR_MIN, SIDEBAR_MAX));
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const renderedWidth = collapsed ? SIDEBAR_COLLAPSED : width;
  const filteredGroups = useMemo(
    () => NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((item) => (item.adminOnly ? role === "admin" : true)) })),
    [role]
  );

  return (
    <aside className="relative shrink-0" style={{ width: renderedWidth }}>
      <div className="h-full border-r border-[var(--border)] bg-[var(--card-soft)] px-3 py-3">
        <div className={`mb-4 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed ? (
            <p className="pl-1 text-lg font-semibold tracking-tight text-[var(--text)]">QuantumOps</p>
          ) : null}
          {!collapsed ? (
            <button onClick={() => setCollapsed(true)} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--text-muted)]" aria-label="Collapse sidebar">
              {"\u2039"}
            </button>
          ) : null}
        </div>

        {!collapsed ? (
          <>
            <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Workspace</p>
              <p className="mt-1 text-sm font-medium text-[var(--text)]">Project Console</p>
              <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{email || "Loading account..."}</p>
            </div>

            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{group.title}</p>
                  <nav className="space-y-1.5">
                    {group.items.map((item) => {
                      const active = pathname.startsWith(item.href);
                      const href = projectId ? `${item.href}?projectId=${encodeURIComponent(projectId)}` : item.href;
                      return (
                        <Link
                          key={item.href}
                          href={href}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                            active
                              ? "border border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]"
                              : "border border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-[var(--card)]"
                          }`}
                        >
                          <SidebarIcon kind={item.icon} className="h-5 w-5" />
                          <span className="text-[var(--text)]">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-1 flex flex-col items-center gap-2">
            <button
              onClick={() => setCollapsed(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)]"
              aria-label="Expand sidebar"
            >
              {"\u203A"}
            </button>

            <div className="my-1 h-px w-10 bg-[var(--border)]" />

            {filteredGroups.flatMap((group) => group.items).map((item) => {
              const active = pathname.startsWith(item.href);
              const href = projectId ? `${item.href}?projectId=${encodeURIComponent(projectId)}` : item.href;
              return (
                <Link
                  key={item.href}
                  href={href}
                  aria-label={item.label}
                  title={item.label}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition ${
                    active
                      ? "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text)]"
                  }`}
                >
                  <SidebarIcon kind={item.icon} className="h-6 w-6" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {!collapsed ? (
        <button type="button" aria-label="Resize sidebar" className="sidebar-resizer" onMouseDown={startResize} />
      ) : null}
    </aside>
  );
}
