import InviteMemberModal from "@/components/saas/InviteMemberModal";
import OrgMemberTable from "@/components/saas/OrgMemberTable";

export default function MembersSettingsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Members</h2>
      <InviteMemberModal />
      <OrgMemberTable />
    </section>
  );
}
