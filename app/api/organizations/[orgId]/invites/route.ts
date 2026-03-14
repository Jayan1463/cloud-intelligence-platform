import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { ensureOrgAccess } from "@/lib/org/access";
import { createInviteToken, sendOrganizationInviteEmail } from "@/lib/org/invites";
import type { AppRole } from "@/types/auth";

export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
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

  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const role: AppRole = body.role === "admin" ? "admin" : "member";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const { token, tokenHash } = createInviteToken();
  const inviteId = `inv_${Date.now()}`;

  try {
    await sendOrganizationInviteEmail({
      email,
      orgId,
      role,
      invitedBy: session.user?.uid ?? "unknown",
      inviteToken: token
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Invite created but email send failed: ${(error as Error).message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    invite: {
      id: inviteId,
      orgId,
      email,
      role,
      status: "pending",
      tokenHash
    },
    delivered: true
  });
}
