import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { resolveOrganizationId } from "@/lib/database/organizations";
import { inviteUserToOrganization } from "@/lib/database/users";

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageOrganization(session.role)) {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = body.role === "admin" || body.role === "developer" || body.role === "viewer" ? body.role : "viewer";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  try {
    const orgId = await resolveOrganizationId(session.orgId, session.user.email);
    const user = await inviteUserToOrganization({
      orgId,
      email,
      role,
      invitedBy: session.user.uid
    });
    return NextResponse.json({
      invited: true,
      member: {
        uid: user.id,
        email: user.email,
        role: user.role,
        status: user.status ?? "invited",
        joinedAt: user.created_at ? String(user.created_at).slice(0, 10) : undefined
      }
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
