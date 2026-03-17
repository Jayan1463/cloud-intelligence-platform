import { Suspense } from "react";
import { cookies } from "next/headers";
import ProjectSwitcher from "@/components/saas/ProjectSwitcher";
import NotificationCenter from "@/components/saas/NotificationCenter";
import SaaSThemeToggle from "@/components/saas/ThemeToggle";
import UserMenu from "@/components/saas/UserMenu";
import { getSessionContext } from "@/lib/auth/session";
import { getOrganizationProfile, ORG_PROFILE_COOKIE, readOrganizationProfileStore } from "@/lib/org/profile-store";

export default async function SaaSHeader() {
  const session = await getSessionContext();
  const orgId = session.orgId ?? "demo-org";
  const cookieStore = await cookies();
  const profileStore = readOrganizationProfileStore(cookieStore.get(ORG_PROFILE_COOKIE)?.value);
  const organization = getOrganizationProfile(profileStore, orgId);

  return (
    <header className="px-5 pt-5 md:px-7 md:pt-7">
      <div className="surface flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Organization</p>
          <h1 className="text-xl font-semibold text-[var(--text)]">{organization.name}</h1>
          <p className="text-sm text-[var(--text-muted)]">{organization.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SaaSThemeToggle />
          <Suspense
            fallback={
              <div className="btn-secondary min-w-[170px] px-3 py-2 text-sm text-[var(--text-muted)]">
                Loading projects...
              </div>
            }
          >
            <ProjectSwitcher />
          </Suspense>
          <NotificationCenter />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
