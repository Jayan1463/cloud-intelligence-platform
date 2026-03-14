import type { ReactNode } from "react";
import SaaSSidebar from "@/components/saas/Sidebar";
import SaaSHeader from "@/components/saas/Header";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SaaSSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <SaaSHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
