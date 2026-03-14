"use client";

import Link from "next/link";

export default function UserMenu() {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]">
        Account
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-[var(--border)] bg-[var(--card)] p-2 shadow-xl">
        <Link className="block rounded px-2 py-2 text-sm hover:bg-white/5" href="/workspace/settings/organization">
          Organization
        </Link>
        <Link className="block rounded px-2 py-2 text-sm hover:bg-white/5" href="/workspace/settings/members">
          Members
        </Link>
        <Link className="block rounded px-2 py-2 text-sm hover:bg-white/5" href="/login">
          Logout
        </Link>
      </div>
    </details>
  );
}
