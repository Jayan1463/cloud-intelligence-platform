"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WORKSPACE_PROJECTS } from "@/lib/workspace/data";

export default function ProjectSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();

  const selected = useMemo(() => params.get("projectId") ?? WORKSPACE_PROJECTS[0].id, [params]);

  function onChange(projectId: string) {
    const next = new URLSearchParams(params.toString());
    next.set("projectId", projectId);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--text)]"
      aria-label="Project selector"
    >
      {WORKSPACE_PROJECTS.map((p) => (
        <option key={p.id} value={p.id} className="bg-slate-900 text-white">
          {p.name}
        </option>
      ))}
    </select>
  );
}
