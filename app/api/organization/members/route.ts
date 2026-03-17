import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { resolveOrganizationId } from "@/lib/database/organizations";
import { listUsersByOrganization } from "@/lib/database/users";

export async function GET() {
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orgId = await resolveOrganizationId(session.orgId, session.user.email);
    const users = await listUsersByOrganization(orgId);
    const members = users.map((user) => ({
      uid: user.id,
      email: user.email,
      role: user.role,
      status: user.status ?? "active",
      joinedAt: user.created_at ? String(user.created_at).slice(0, 10) : undefined
    }));
    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

