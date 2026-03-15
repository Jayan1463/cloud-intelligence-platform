import { Suspense, type ReactNode } from "react";
import SaaSSidebar from "@/components/saas/Sidebar";
import SaaSHeader from "@/components/saas/Header";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Suspense
        fallback={<aside className="w-72 shrink-0 p-4" aria-hidden="true"><div className="surface h-full" /></aside>}
      >
        <SaaSSidebar />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <SaaSHeader />
        <main className="p-5 md:p-7">{children}</main>
      </div>
    </div>
  );
}
