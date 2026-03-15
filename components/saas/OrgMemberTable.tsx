"use client";

import { useEffect, useState } from "react";
import type { OrganizationMember } from "@/types/org";

export default function OrgMemberTable() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMembers() {
    const response = await fetch("/api/organizations/demo-org/members");
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMembers([]);
      setLoading(false);
      return;
    }
    setMembers(payload.members ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadMembers();
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
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.uid} className="border-t border-[var(--border)] text-[var(--text)]">
              <td className="p-3">{member.email}</td>
              <td className="p-3 capitalize">{member.role}</td>
              <td className="p-3 capitalize">{member.status}</td>
              <td className="p-3">{member.joinedAt ?? "-"}</td>
            </tr>
          ))}
          {!loading && members.length === 0 ? (
            <tr className="border-t border-[var(--border)] text-[var(--text-muted)]">
              <td className="p-3" colSpan={4}>No members found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
