import ProjectSwitcher from "@/components/saas/ProjectSwitcher";
import NotificationCenter from "@/components/saas/NotificationCenter";
import UserMenu from "@/components/saas/UserMenu";

export default function SaaSHeader() {
  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Organization</p>
        <h1 className="text-lg font-semibold text-[var(--text)]">Acme Cloud Ops</h1>
      </div>
      <div className="flex items-center gap-3">
        <ProjectSwitcher />
        <NotificationCenter />
        <UserMenu />
      </div>
    </header>
  );
}
