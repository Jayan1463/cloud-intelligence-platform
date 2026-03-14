import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const now = new Date().toISOString();

  return NextResponse.json({
    organization: {
      id: `org_${Date.now()}`,
      name: body.name,
      slug: body.slug,
      ownerUid: session.user.uid,
      plan: body.plan ?? "free",
      createdAt: now,
      updatedAt: now
    }
  });
}
