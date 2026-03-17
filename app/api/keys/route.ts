import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { createOrganizationApiKey, listOrganizationApiKeys } from "@/lib/platform/auth/api-access";

export async function GET() {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageOrganization(session.role)) return NextResponse.json({ error: "Insufficient role" }, { status: 403 });
  const keys = await listOrganizationApiKeys(session.orgId);
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageOrganization(session.role)) return NextResponse.json({ error: "Insufficient role" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const created = await createOrganizationApiKey({
    organizationId: session.orgId,
    name: String(body.name ?? "default-key"),
    rateLimitPerMinute: Number(body.rateLimitPerMinute ?? 120)
  });
  return NextResponse.json({ key: created }, { status: 201 });
}
