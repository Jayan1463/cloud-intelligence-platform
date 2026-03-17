import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { resolveOrganizationId } from "@/lib/database/organizations";
import { removeUserFromOrganization } from "@/lib/database/users";

export async function DELETE(request: Request) {
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageOrganization(session.role)) {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const email = String(url.searchParams.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  if (email === session.user.email.toLowerCase()) {
    return NextResponse.json({ error: "You cannot remove your own account" }, { status: 400 });
  }

  try {
    const orgId = await resolveOrganizationId(session.orgId, session.user.email);
    const result = await removeUserFromOrganization({ orgId, email });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

