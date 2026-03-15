import type { Organization } from "@/types/org";

export type OrganizationProfile = Organization & {
  description: string;
  primaryEmail: string;
  website: string;
  region: string;
  ownerEmail: string;
  environment: string;
  timezone: string;
  complianceTag: string;
};

type OrganizationProfileStore = Record<string, OrganizationProfile>;

export const ORG_PROFILE_COOKIE = "cip_org_profiles";

const DEFAULT_ORG_KEY = "demo-org";

const DEFAULT_PROFILE: OrganizationProfile = {
  id: "org_acme_ops_001",
  name: "Acme Cloud Ops",
  slug: "acme-cloud-ops",
  ownerUid: "u_1",
  plan: "pro",
  createdAt: "2026-03-01T00:00:00.000Z",
  updatedAt: "2026-03-01T00:00:00.000Z",
  description: "Unified observability, infrastructure control, and cost governance.",
  primaryEmail: "admin@acmeops.example",
  website: "acmeops.example",
  region: "ap-northeast-1",
  ownerEmail: "admin@acmeops.example",
  environment: "Production",
  timezone: "Asia/Kolkata",
  complianceTag: "SOC2-Ready"
};

function toTrimmedString(value: unknown): string {
  return String(value ?? "").trim();
}

function sanitizeText(value: unknown, fallback: string, maxLength: number): string {
  const candidate = toTrimmedString(value);
  if (!candidate) {
    return fallback;
  }
  return candidate.slice(0, maxLength);
}

function sanitizeEmail(value: unknown, fallback: string): string {
  const candidate = toTrimmedString(value).toLowerCase();
  if (!candidate || !candidate.includes("@")) {
    return fallback;
  }
  return candidate;
}

function sanitizeWebsite(value: unknown, fallback: string): string {
  const candidate = toTrimmedString(value).toLowerCase();
  if (!candidate) {
    return fallback;
  }
  const withoutProtocol = candidate.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return withoutProtocol || fallback;
}

function sanitizePlan(value: unknown, fallback: Organization["plan"]): Organization["plan"] {
  return value === "free" || value === "pro" || value === "enterprise" ? value : fallback;
}

function sanitizeSlug(value: unknown, fallback: string): string {
  const candidate = toTrimmedString(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return candidate || fallback;
}

function sanitizeDate(value: unknown, fallback: string): string {
  const candidate = toTrimmedString(value);
  if (!candidate) {
    return fallback;
  }
  const parsed = Date.parse(candidate);
  return Number.isNaN(parsed) ? fallback : new Date(parsed).toISOString();
}

function buildFallbackProfile(orgKey: string): OrganizationProfile {
  if (orgKey === DEFAULT_ORG_KEY) {
    return { ...DEFAULT_PROFILE };
  }

  return {
    ...DEFAULT_PROFILE,
    id: orgKey,
    name: "Cloud Organization",
    slug: sanitizeSlug(orgKey, "cloud-organization")
  };
}

function sanitizeProfile(value: unknown, fallback: OrganizationProfile): OrganizationProfile {
  if (!value || typeof value !== "object") {
    return { ...fallback };
  }

  const candidate = value as Partial<OrganizationProfile>;
  const name = sanitizeText(candidate.name, fallback.name, 80);

  return {
    id: sanitizeText(candidate.id, fallback.id, 120),
    name,
    slug: sanitizeSlug(candidate.slug ?? name, fallback.slug),
    ownerUid: sanitizeText(candidate.ownerUid, fallback.ownerUid, 120),
    plan: sanitizePlan(candidate.plan, fallback.plan),
    createdAt: sanitizeDate(candidate.createdAt, fallback.createdAt),
    updatedAt: sanitizeDate(candidate.updatedAt, fallback.updatedAt),
    description: sanitizeText(candidate.description, fallback.description, 220),
    primaryEmail: sanitizeEmail(candidate.primaryEmail, fallback.primaryEmail),
    website: sanitizeWebsite(candidate.website, fallback.website),
    region: sanitizeText(candidate.region, fallback.region, 60),
    ownerEmail: sanitizeEmail(candidate.ownerEmail, fallback.ownerEmail),
    environment: sanitizeText(candidate.environment, fallback.environment, 40),
    timezone: sanitizeText(candidate.timezone, fallback.timezone, 80),
    complianceTag: sanitizeText(candidate.complianceTag, fallback.complianceTag, 80)
  };
}

export function readOrganizationProfileStore(raw: string | undefined): OrganizationProfileStore {
  const seedStore: OrganizationProfileStore = {
    [DEFAULT_ORG_KEY]: buildFallbackProfile(DEFAULT_ORG_KEY)
  };

  if (!raw) {
    return seedStore;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    const mergedStore: OrganizationProfileStore = { ...seedStore };
    for (const [orgKey, value] of Object.entries(parsed)) {
      const fallback = mergedStore[orgKey] ?? buildFallbackProfile(orgKey);
      mergedStore[orgKey] = sanitizeProfile(value, fallback);
    }
    return mergedStore;
  } catch {
    return seedStore;
  }
}

export function serializeOrganizationProfileStore(store: OrganizationProfileStore): string {
  return encodeURIComponent(JSON.stringify(store));
}

export function getOrganizationProfile(store: OrganizationProfileStore, orgKey: string): OrganizationProfile {
  return { ...(store[orgKey] ?? buildFallbackProfile(orgKey)) };
}

type OrganizationProfilePatch = Partial<
  Pick<OrganizationProfile, "name" | "description" | "primaryEmail" | "website" | "region" | "environment" | "timezone" | "complianceTag">
>;

export function updateOrganizationProfile(
  store: OrganizationProfileStore,
  orgKey: string,
  patch: OrganizationProfilePatch
): { store: OrganizationProfileStore; organization: OrganizationProfile } {
  const fallback = getOrganizationProfile(store, orgKey);
  const nextName = sanitizeText(patch.name, fallback.name, 80);

  const organization: OrganizationProfile = {
    ...fallback,
    name: nextName,
    slug: sanitizeSlug(nextName, fallback.slug),
    description: sanitizeText(patch.description, fallback.description, 220),
    primaryEmail: sanitizeEmail(patch.primaryEmail, fallback.primaryEmail),
    website: sanitizeWebsite(patch.website, fallback.website),
    region: sanitizeText(patch.region, fallback.region, 60),
    environment: sanitizeText(patch.environment, fallback.environment, 40),
    timezone: sanitizeText(patch.timezone, fallback.timezone, 80),
    complianceTag: sanitizeText(patch.complianceTag, fallback.complianceTag, 80),
    updatedAt: new Date().toISOString()
  };

  return {
    store: {
      ...store,
      [orgKey]: organization
    },
    organization
  };
}

export function ensureOrganizationProfileCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}
