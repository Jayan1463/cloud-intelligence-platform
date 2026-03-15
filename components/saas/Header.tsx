import { Suspense } from "react";
import ProjectSwitcher from "@/components/saas/ProjectSwitcher";
import NotificationCenter from "@/components/saas/NotificationCenter";
import SaaSThemeToggle from "@/components/saas/ThemeToggle";
import UserMenu from "@/components/saas/UserMenu";

export default function SaaSHeader() {
  return (
    <header className="px-5 pt-5 md:px-7 md:pt-7">
      <div className="surface flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Organization</p>
          <h1 className="text-xl font-semibold text-[var(--text)]">Acme Cloud Ops</h1>
          <p className="text-sm text-[var(--text-muted)]">Unified observability, infrastructure control, and cost governance.</p>
        </div>
        <div className="flex items-center gap-3">
          <SaaSThemeToggle />
          <Suspense
            fallback={
              <div className="btn-secondary px-3 py-2 text-sm text-[var(--text-muted)]">
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
