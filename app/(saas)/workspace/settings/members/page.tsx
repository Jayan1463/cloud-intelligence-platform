import InviteMemberModal from "@/components/saas/InviteMemberModal";
import OrgMemberTable from "@/components/saas/OrgMemberTable";
import MemberRequestsPanel from "@/components/saas/MemberRequestsPanel";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";

export default async function MembersSettingsPage() {
  const session = await getSessionContext();
  const canManage = canManageOrganization(session.role);

  return (
    <section className="space-y-4 animate-fade">
      <div className="surface p-5">
        <h2 className="text-2xl font-semibold">Members & Permissions</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Signed in as <span className="font-medium">{session.user?.email ?? "Unknown user"}</span> with role{" "}
          <span className="font-medium">{session.role ?? "none"}</span>.
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Admin accounts can approve access requests. If you cannot approve requests, login with <span className="font-medium">admin@test.com / 123456</span>.
        </p>
      </div>
      {canManage ? <InviteMemberModal /> : <p className="surface-soft p-3 text-sm text-[var(--text-muted)]">Members cannot send invites.</p>}
      {canManage ? <MemberRequestsPanel /> : null}
      <OrgMemberTable />
    </section>
  );
}
