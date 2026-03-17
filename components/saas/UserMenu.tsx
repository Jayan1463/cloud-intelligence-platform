"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AppRole } from "@/types/auth";

export default function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

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
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-sm text-[var(--text)]"
      >
        Account {role ? `(${role})` : ""}
      </button>
      {open ? (
        <div className="surface absolute right-0 z-20 mt-2 w-60 p-2">
          {email ? <p className="px-2 pb-2 pt-1 text-xs text-[var(--text-muted)]">{email}</p> : null}
          {role === "admin" ? (
            <>
              <Link className="block rounded-lg px-2 py-2 text-sm hover:bg-[var(--card-soft)]" href="/workspace/settings/organization" onClick={() => setOpen(false)}>
                Organization
              </Link>
              <Link className="block rounded-lg px-2 py-2 text-sm hover:bg-[var(--card-soft)]" href="/workspace/settings/members" onClick={() => setOpen(false)}>
                Members
              </Link>
            </>
          ) : null}
          <button onClick={onLogout} className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-[var(--card-soft)]">
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
