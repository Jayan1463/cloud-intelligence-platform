import InviteMemberModal from "@/components/saas/InviteMemberModal";
import OrgMemberTable from "@/components/saas/OrgMemberTable";
import MemberRequestsPanel from "@/components/saas/MemberRequestsPanel";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";

export default async function MembersSettingsPage() {
  const session = await getSessionContext();
  const canManage = canManageOrganization(session.role);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Members</h2>
      {canManage ? <InviteMemberModal /> : <p className="text-sm text-[var(--text-muted)]">Members cannot send invites.</p>}
      {canManage ? <MemberRequestsPanel /> : null}
      <OrgMemberTable />
    </section>
  );
}
