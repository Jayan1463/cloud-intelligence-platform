import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { ensureOrgAccess } from "@/lib/org/access";
import { cookies } from "next/headers";
import { getApprovedMembers, MEMBER_STORE_COOKIE, readMemberStore } from "@/lib/auth/member-store";

export async function GET(_: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await getSessionContext();
  const { orgId } = await params;

  try {
    ensureOrgAccess(session, orgId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  const cookieStore = await cookies();
  const memberStore = readMemberStore(cookieStore.get(MEMBER_STORE_COOKIE)?.value);
  const baseMembers = [
    { uid: "u_1", email: "admin@test.com", role: "admin", status: "active" as const, joinedAt: "2026-03-01" },
    { uid: "u_2", email: "ops@acme.com", role: "member", status: "active" as const, joinedAt: "2026-03-08" },
    { uid: "u_3", email: "dev@acme.com", role: "member", status: "invited" as const }
  ];

  const approved = getApprovedMembers(memberStore).map((member, index) => ({
    uid: `approved_${index + 1}`,
    email: member.email,
    role: member.role,
    status: "active" as const,
    joinedAt: new Date().toISOString().slice(0, 10)
  }));

  const merged = [...baseMembers];
  for (const member of approved) {
    if (!merged.some((existing) => existing.email === member.email)) {
      merged.push(member);
    }
  }

  return NextResponse.json({ members: merged });
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

  const body = await request.json();
  return NextResponse.json({ updated: true, member: body });
}
