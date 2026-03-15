"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserMenu() {
  const router = useRouter();
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
      }
    }
    void loadRole();
  }, []);

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]">
        Account
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-[var(--border)] bg-[var(--card)] p-2 shadow-xl">
        {role === "admin" ? (
          <>
            <Link className="block rounded px-2 py-2 text-sm hover:bg-white/5" href="/workspace/settings/organization">
              Organization
            </Link>
            <Link className="block rounded px-2 py-2 text-sm hover:bg-white/5" href="/workspace/settings/members">
              Members
            </Link>
          </>
        ) : null}
        <button onClick={onLogout} className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-white/5">
          Logout
        </button>
      </div>
    </details>
  );
}
