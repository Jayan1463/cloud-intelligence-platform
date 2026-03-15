import Link from "next/link";
import { cookies } from "next/headers";
import OrganizationProfileEditor from "@/components/saas/OrganizationProfileEditor";
import { getSessionContext } from "@/lib/auth/session";
import { getOrganizationProfile, ORG_PROFILE_COOKIE, readOrganizationProfileStore } from "@/lib/org/profile-store";

export default async function OrganizationProfilePage() {
  const session = await getSessionContext();
  const orgId = session.orgId ?? "demo-org";
  const cookieStore = await cookies();
  const profileStore = readOrganizationProfileStore(cookieStore.get(ORG_PROFILE_COOKIE)?.value);
  const organization = getOrganizationProfile(profileStore, orgId);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Organization Profile</h2>
        <Link className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]" href="/workspace/settings/organization">
          Back to Organization Settings
        </Link>
      </div>

      <OrganizationProfileEditor organization={organization} />
    </section>
  );
}
