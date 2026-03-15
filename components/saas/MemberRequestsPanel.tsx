"use client";

import { useEffect, useState } from "react";

type MemberRequest = {
  name: string;
  email: string;
  requestedAt: string;
  status: "pending";
};

export default function MemberRequestsPanel() {
  const [requests, setRequests] = useState<MemberRequest[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    const response = await fetch("/api/auth/member-requests");
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(payload.error ?? "Failed to load requests");
      setLoading(false);
      return;
    }
    setRequests(payload.requests ?? []);
    setLoading(false);
  }

  async function onApprove(email: string) {
    setStatus(`Approving ${email}...`);
    const response = await fetch("/api/auth/member-requests/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(payload.error ?? "Failed to approve request");
      return;
    }
    setStatus(`Approved ${email}`);
    setRequests((prev) => prev.filter((request) => request.email !== email));
    window.dispatchEvent(new Event("org-members-refresh"));
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-3 text-base font-semibold text-[var(--text)]">Pending Member Requests</h3>
      {loading ? <p className="text-sm text-[var(--text-muted)]">Loading requests...</p> : null}
      {!loading && requests.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No pending requests.</p> : null}
      <div className="space-y-2">
        {requests.map((request) => (
          <div key={request.email} className="flex items-center justify-between rounded-md border border-[var(--border)] p-3 text-sm">
            <div>
              <p className="font-medium text-[var(--text)]">{request.name}</p>
              <p className="text-[var(--text-muted)]">{request.email}</p>
            </div>
            <button onClick={() => onApprove(request.email)} className="rounded-md bg-cyan-500 px-3 py-2 text-slate-900">
              Approve
            </button>
          </div>
        ))}
      </div>
      {status ? <p className="mt-3 text-xs text-[var(--text-muted)]">{status}</p> : null}
    </div>
  );
}
