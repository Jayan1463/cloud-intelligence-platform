"use client";

import { useState } from "react";

export default function InviteMemberModal() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [status, setStatus] = useState<string>("");

  async function onInvite() {
    setStatus("Sending invite...");
    const response = await fetch("/api/organizations/demo-org/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer demo-user", "x-org-id": "demo-org", "x-role": "admin" },
      body: JSON.stringify({ email, role })
    });

    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error ?? "Failed to send invite");
      return;
    }

    const deliveryInfo = payload.messageId ? ` (message: ${payload.messageId})` : "";
    setStatus(`Invite sent to ${email}${deliveryInfo}`);
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
      {status ? <p className="mt-3 text-xs text-[var(--text-muted)]">{status}</p> : null}
    </div>
  );
}
