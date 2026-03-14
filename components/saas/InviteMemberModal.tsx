"use client";

import { useState } from "react";

export default function InviteMemberModal() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  async function onInvite() {
    await fetch("/api/organizations/demo-org/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer demo-user", "x-org-id": "demo-org", "x-role": "admin" },
      body: JSON.stringify({ email, role })
    });
    setEmail("");
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-3 text-base font-semibold text-[var(--text)]">Invite Member</h3>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
          placeholder="member@company.com"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        >
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
        <button onClick={onInvite} className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-900">
          Send Invite
        </button>
      </div>
    </div>
  );
}
