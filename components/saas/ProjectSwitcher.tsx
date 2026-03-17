"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ProjectOption = {
  id: string;
  name: string;
};

export default function ProjectSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  useEffect(() => {
    let active = true;
    async function loadProjects() {
      const response = await fetch("/api/projects", { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { projects?: Array<{ id: string; name: string }> };
      if (active && response.ok && Array.isArray(payload.projects)) {
        setProjects(payload.projects.map((project) => ({ id: project.id, name: project.name })));
      }
    }
    void loadProjects();
    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(() => params.get("projectId") ?? projects[0]?.id ?? "", [params, projects]);

  function onChange(projectId: string) {
    const next = new URLSearchParams(params.toString());
    next.set("projectId", projectId);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-[180px] rounded-xl border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2 text-sm text-[var(--text)]"
      aria-label="Project selector"
      disabled={projects.length === 0}
    >
      {projects.length === 0 ? <option value="">No projects</option> : null}
      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}
