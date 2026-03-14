import type { OrganizationMember } from "@/types/org";

const MEMBERS: OrganizationMember[] = [
  { uid: "u_1", email: "admin@acme.com", role: "admin", status: "active", joinedAt: "2026-03-01" },
  { uid: "u_2", email: "ops@acme.com", role: "member", status: "active", joinedAt: "2026-03-08" },
  { uid: "u_3", email: "dev@acme.com", role: "member", status: "invited" }
];

export default function OrgMemberTable() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
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
          {MEMBERS.map((member) => (
            <tr key={member.uid} className="border-t border-[var(--border)] text-[var(--text)]">
              <td className="p-3">{member.email}</td>
              <td className="p-3 capitalize">{member.role}</td>
              <td className="p-3 capitalize">{member.status}</td>
              <td className="p-3">{member.joinedAt ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
