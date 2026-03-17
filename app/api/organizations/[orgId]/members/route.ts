import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { ensureOrgAccess } from "@/lib/org/access";
import { listUsersByOrganization, updateOrganizationUserRole } from "@/lib/database/users";

export async function GET(_: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await getSessionContext();
  const { orgId } = await params;

  try {
    ensureOrgAccess(session, orgId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  const users = await listUsersByOrganization(orgId);
  const members = users.map((user) => ({
    uid: user.id,
    email: user.email,
    role: user.role,
    status: user.status ?? "active",
    joinedAt: user.created_at ? String(user.created_at).slice(0, 10) : undefined
  }));

  return NextResponse.json({ members });
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
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = body.role === "admin" || body.role === "developer" || body.role === "viewer" ? body.role : "viewer";

  const updated = await updateOrganizationUserRole({ orgId, email, role });
  return NextResponse.json({ updated: true, member: updated });
}
