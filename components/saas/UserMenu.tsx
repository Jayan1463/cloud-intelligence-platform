"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member" | null>(null);

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

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-xl border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-sm text-[var(--text)]">
        Account {role ? `(${role})` : ""}
      </summary>
      <div className="surface absolute right-0 z-20 mt-2 w-60 p-2">
        {email ? <p className="px-2 pb-2 pt-1 text-xs text-[var(--text-muted)]">{email}</p> : null}
        {role === "admin" ? (
          <>
            <Link className="block rounded-lg px-2 py-2 text-sm hover:bg-[var(--card-soft)]" href="/workspace/settings/organization">
              Organization
            </Link>
            <Link className="block rounded-lg px-2 py-2 text-sm hover:bg-[var(--card-soft)]" href="/workspace/settings/members">
              Members
            </Link>
          </>
        ) : null}
        <button onClick={onLogout} className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-[var(--card-soft)]">
          Logout
        </button>
      </div>
    </details>
  );
}
