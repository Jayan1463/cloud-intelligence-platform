"use client";

import { useEffect, useState } from "react";
import type { OrganizationMember } from "@/types/org";
import type { AppRole } from "@/types/auth";

export default function OrgMemberTable() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const canManage = role === "admin";

  async function loadRole() {
    const response = await fetch("/api/auth/profile");
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setRole(payload.role ?? null);
    }
  }

  async function loadMembers() {
    const response = await fetch("/api/organization/members");
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMembers([]);
      setLoading(false);
      return;
    }
    setMembers(payload.members ?? []);
    setLoading(false);
  }

  async function updateRole(email: string, nextRole: AppRole) {
    const response = await fetch("/api/organization/member-role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: nextRole })
    });
    if (response.ok) {
      window.dispatchEvent(new Event("org-members-refresh"));
    }
  }

  async function removeMember(email: string) {
    const response = await fetch(`/api/organization/member?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    if (response.ok) {
      window.dispatchEvent(new Event("org-members-refresh"));
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRole();
      void loadMembers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleRefresh() {
      void loadMembers();
    }
    window.addEventListener("org-members-refresh", handleRefresh);
    return () => window.removeEventListener("org-members-refresh", handleRefresh);
  }, []);

  return (
    <div className="surface overflow-hidden">
      {loading ? <p className="p-3 text-sm text-[var(--text-muted)]">Loading members...</p> : null}
      <table className="w-full text-sm">
        <thead className="text-left text-[var(--text-muted)]">
          <tr>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3">Joined</th>
            {canManage ? <th className="p-3 text-right">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.uid} className="border-t border-[var(--border)] text-[var(--text)]">
              <td className="p-3">{member.email}</td>
              <td className="p-3">
                {canManage ? (
                  <select
                    value={member.role}
                    onChange={(e) => void updateRole(member.email, (e.target.value as AppRole))}
                    className="rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-2 py-1 text-xs capitalize"
                  >
                    <option value="viewer">viewer</option>
                    <option value="developer">developer</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  <span className="capitalize">{member.role}</span>
                )}
              </td>
              <td className="p-3 capitalize">{member.status}</td>
              <td className="p-3">{member.joinedAt ?? "-"}</td>
              {canManage ? (
                <td className="p-3 text-right">
                  <button
                    onClick={() => void removeMember(member.email)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--bg-soft)]"
                  >
                    Remove
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
          {!loading && members.length === 0 ? (
            <tr className="border-t border-[var(--border)] text-[var(--text-muted)]">
              <td className="p-3" colSpan={canManage ? 5 : 4}>No members found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
