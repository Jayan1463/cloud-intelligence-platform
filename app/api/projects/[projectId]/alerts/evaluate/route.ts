import { NextResponse } from "next/server";
import { evaluateAlerts } from "@/lib/alerts/engine";
import { getSessionContext } from "@/lib/auth/session";
import { ensureProjectAccess } from "@/lib/org/access";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSessionContext();
  const { projectId } = await params;

  try {
    ensureProjectAccess(session, projectId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  const body = await request.json();
  const thresholds = body.thresholds ?? { cpu: 80, memory: 85, networkAnomaly: 160 };
  const sample = { ...body.sample, projectId };
  const alerts = evaluateAlerts(sample, thresholds);

  return NextResponse.json({ alerts });
}
