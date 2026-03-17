"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProjectCreator() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("prod");
  const [region, setRegion] = useState("us-east-1");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, environment, region })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Failed to create project");
        return;
      }

      const projectId = String(payload?.project?.id ?? "");
      if (projectId) {
        router.push(`/workspace/projects?projectId=${encodeURIComponent(projectId)}`);
      }
      router.refresh();
      setName("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="surface p-4">
      <p className="text-sm font-semibold">Create Project (Admin)</p>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
          placeholder="Project name"
        />
        <select value={environment} onChange={(e) => setEnvironment(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm">
          <option value="prod">prod</option>
          <option value="staging">staging</option>
          <option value="dev">dev</option>
        </select>
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
          placeholder="Region"
        />
      </div>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
      <button disabled={saving} onClick={() => void onCreate()} className="btn-primary mt-3 px-4 py-2 text-sm">
        {saving ? "Creating..." : "Create Project"}
      </button>
    </div>
  );
}
