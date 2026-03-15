"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { OrganizationProfile } from "@/lib/org/profile-store";

const ORG_ID = "demo-org";

type OrganizationProfileForm = {
  name: string;
  description: string;
  primaryEmail: string;
  website: string;
  region: string;
  environment: string;
  timezone: string;
  complianceTag: string;
};

function formatDate(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return "Unknown";
  }
  return new Date(parsed).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function buildFormState(organization: OrganizationProfile): OrganizationProfileForm {
  return {
    name: organization.name,
    description: organization.description,
    primaryEmail: organization.primaryEmail,
    website: organization.website,
    region: organization.region,
    environment: organization.environment,
    timezone: organization.timezone,
    complianceTag: organization.complianceTag
  };
}

type Props = {
  organization: OrganizationProfile;
};

export default function OrganizationProfileEditor({ organization }: Props) {
  const router = useRouter();
  const [savedOrganization, setSavedOrganization] = useState(organization);
  const [form, setForm] = useState<OrganizationProfileForm>(() => buildFormState(organization));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  function updateField<K extends keyof OrganizationProfileForm>(field: K, value: OrganizationProfileForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function onReset() {
    setForm(buildFormState(savedOrganization));
    setStatus(null);
  }

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    const response = await fetch(`/api/organizations/${ORG_ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.organization) {
      setStatus({ tone: "error", message: payload.error ?? "Failed to save profile changes." });
      setSaving(false);
      return;
    }

    const updatedOrganization = payload.organization as OrganizationProfile;
    setSavedOrganization(updatedOrganization);
    setForm(buildFormState(updatedOrganization));
    setStatus({ tone: "success", message: "Organization profile updated successfully." });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={onSave} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h3 className="text-base font-semibold">Edit Details</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Changes are saved to your organization profile and reflected across workspace pages.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-[var(--text-muted)]">Organization Name</span>
            <input
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              disabled={saving}
              required
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[var(--text-muted)]">Primary Email</span>
            <input
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2"
              type="email"
              value={form.primaryEmail}
              onChange={(event) => updateField("primaryEmail", event.target.value)}
              disabled={saving}
              required
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[var(--text-muted)]">Website</span>
            <input
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2"
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              disabled={saving}
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[var(--text-muted)]">Region</span>
            <input
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2"
              value={form.region}
              onChange={(event) => updateField("region", event.target.value)}
              disabled={saving}
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[var(--text-muted)]">Environment</span>
            <input
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2"
              value={form.environment}
              onChange={(event) => updateField("environment", event.target.value)}
              disabled={saving}
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[var(--text-muted)]">Timezone</span>
            <input
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2"
              value={form.timezone}
              onChange={(event) => updateField("timezone", event.target.value)}
              disabled={saving}
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="mb-1 block text-[var(--text-muted)]">Compliance Tag</span>
            <input
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2"
              value={form.complianceTag}
              onChange={(event) => updateField("complianceTag", event.target.value)}
              disabled={saving}
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="mb-1 block text-[var(--text-muted)]">Description</span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-[var(--border)] bg-[var(--card-soft)] px-3 py-2"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              disabled={saving}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-60" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save Profile"}
          </button>
          <button className="btn-secondary px-4 py-2 text-sm disabled:opacity-60" disabled={saving} onClick={onReset} type="button">
            Reset
          </button>
        </div>

        {status ? (
          <p
            className={`mt-3 rounded-md border px-3 py-2 text-sm ${
              status.tone === "success"
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-rose-400/50 bg-rose-500/10 text-rose-200"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </form>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h3 className="text-base font-semibold">Operational Metadata</h3>
        <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
          <p>Organization ID: {savedOrganization.id}</p>
          <p>Owner: {savedOrganization.ownerEmail}</p>
          <p>Created: {formatDate(savedOrganization.createdAt)}</p>
          <p>Last Updated: {formatDate(savedOrganization.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
