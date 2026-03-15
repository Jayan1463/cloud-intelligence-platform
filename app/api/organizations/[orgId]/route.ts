import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { ensureOrgAccess } from "@/lib/org/access";
import { cookies } from "next/headers";
import {
  ensureOrganizationProfileCookieOptions,
  getOrganizationProfile,
  ORG_PROFILE_COOKIE,
  readOrganizationProfileStore,
  serializeOrganizationProfileStore,
  updateOrganizationProfile
} from "@/lib/org/profile-store";

export async function GET(_: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await getSessionContext();
  const { orgId } = await params;

  try {
    ensureOrgAccess(session, orgId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  const cookieStore = await cookies();
  const profileStore = readOrganizationProfileStore(cookieStore.get(ORG_PROFILE_COOKIE)?.value);
  const organization = getOrganizationProfile(profileStore, orgId);

  return NextResponse.json({
    organization
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await getSessionContext();
  const { orgId } = await params;

  try {
    ensureOrgAccess(session, orgId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  if (!canManageOrganization(session.role)) {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  if (Object.prototype.hasOwnProperty.call(body, "name") && !String(body.name ?? "").trim()) {
    return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
  }

  if (Object.prototype.hasOwnProperty.call(body, "primaryEmail")) {
    const primaryEmail = String(body.primaryEmail ?? "").trim().toLowerCase();
    if (!primaryEmail || !primaryEmail.includes("@")) {
      return NextResponse.json({ error: "A valid primary email is required" }, { status: 400 });
    }
  }

  const cookieStore = await cookies();
  const profileStore = readOrganizationProfileStore(cookieStore.get(ORG_PROFILE_COOKIE)?.value);
  const result = updateOrganizationProfile(profileStore, orgId, {
    name: body.name,
    description: body.description,
    primaryEmail: body.primaryEmail,
    website: body.website,
    region: body.region,
    environment: body.environment,
    timezone: body.timezone,
    complianceTag: body.complianceTag
  });

  const response = NextResponse.json({ updated: true, organization: result.organization });
  response.cookies.set({
    name: ORG_PROFILE_COOKIE,
    value: serializeOrganizationProfileStore(result.store),
    ...ensureOrganizationProfileCookieOptions()
  });
  return response;
}
