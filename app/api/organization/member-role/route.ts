import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { resolveOrganizationId } from "@/lib/database/organizations";
import { updateOrganizationUserRole } from "@/lib/database/users";

export async function PATCH(request: Request) {
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
    const updated = await updateOrganizationUserRole({ orgId, email, role });
    return NextResponse.json({
      updated: true,
      member: { uid: updated.id, email: updated.email, role: updated.role, status: updated.status ?? "active" }
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
