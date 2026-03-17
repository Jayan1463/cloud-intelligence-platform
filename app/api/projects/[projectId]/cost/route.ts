import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { ensureProjectAccess } from "@/lib/org/access";
import { getProjectCostIntelligence } from "@/lib/platform/analytics/cost";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSessionContext();
  const { projectId } = await params;

  try {
    ensureProjectAccess(session, projectId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  const cost = await getProjectCostIntelligence(projectId);
  return NextResponse.json({ projectId, ...cost });
}
