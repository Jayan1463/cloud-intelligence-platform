import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { ensureOrgAccess } from "@/lib/org/access";

export async function GET(_: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await getSessionContext();
  const { orgId } = await params;

  try {
    ensureOrgAccess(session, orgId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  return NextResponse.json({
    organization: {
      id: orgId,
      name: "Acme Cloud Ops",
      slug: "acme-cloud-ops",
      ownerUid: "u_1",
      plan: "pro"
    }
  });
}
