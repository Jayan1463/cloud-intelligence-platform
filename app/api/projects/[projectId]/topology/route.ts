import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { ensureProjectAccess } from "@/lib/org/access";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSessionContext();
  const { projectId } = await params;

  try {
    ensureProjectAccess(session, projectId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  return NextResponse.json({
    nodes: [
      { id: "edge-gw", label: "Edge Gateway", health: "healthy" },
      { id: "core", label: "Core API", health: "healthy" },
      { id: "db", label: "DB Primary", health: "healthy" }
    ]
  });
}
