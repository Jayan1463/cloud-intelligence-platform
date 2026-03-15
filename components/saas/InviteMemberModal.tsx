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
      headers: { "Content-Type": "application/json" },
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
    <div className="surface p-4">
      <h3 className="mb-3 text-base font-semibold text-[var(--text)]">Invite Member</h3>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-sm"
          placeholder="member@company.com"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-sm"
        >
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
        <button onClick={onInvite} className="btn-primary px-4 py-2 text-sm font-medium">
          Send Invite
        </button>
      </div>
      {status ? <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card-soft)] p-2 text-xs text-[var(--text-muted)]">{status}</p> : null}
    </div>
  );
}
