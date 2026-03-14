import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const now = new Date().toISOString();
  return NextResponse.json({
    project: {
      id: `proj_${Date.now()}`,
      orgId: session.orgId,
      name: body.name,
      env: body.env ?? "prod",
      region: body.region ?? "us-east-1",
      createdBy: session.user.uid,
      createdAt: now,
      archived: false
    }
  });
}
