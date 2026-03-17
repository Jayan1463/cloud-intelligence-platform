"use client";

import { useState } from "react";

export default function InviteMemberModal() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    const response = await fetch("/api/organization/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Failed to send invite");
      return;
    }

    setStatus("success");
    setMessage("Invite sent successfully");
    setEmail("");
    window.dispatchEvent(new Event("org-members-refresh"));
  }

  return (
    <form onSubmit={onInvite} className="surface-soft p-4 space-y-3">
      <h3 className="text-sm font-semibold">Invite team member</h3>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
        placeholder="teammate@company.com"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-sm"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-sm"
      >
        <option value="viewer">viewer</option>
        <option value="developer">developer</option>
        <option value="admin">admin</option>
      </select>
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-sm"
      >
        {status === "saving" ? "Sending..." : "Send invite"}
      </button>
      {message ? <p className="text-xs text-[var(--text-muted)]">{message}</p> : null}
    </form>
  );
}
