import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { ensureProjectAccess } from "@/lib/org/access";
import { evaluateAndDispatchAlerts } from "@/lib/alerts/engine";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSessionContext();
  const { projectId } = await params;

  try {
    ensureProjectAccess(session, projectId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const sample = body.sample ?? {};
  const serverId = String(sample.serverId ?? body.serverId ?? "").trim();

  if (!session.orgId || !serverId) {
    return NextResponse.json({ error: "org and serverId are required" }, { status: 400 });
  }

  const result = await evaluateAndDispatchAlerts({
    organizationId: session.orgId,
    projectId,
    serverId,
    cpu: Number(sample.cpu ?? body.cpu ?? 0),
    memory: Number(sample.memory ?? body.memory ?? 0),
    disk: Number(sample.disk ?? body.disk ?? 0),
    network: Number(sample.network ?? body.network ?? 0),
    timestamp: String(sample.timestamp ?? body.timestamp ?? new Date().toISOString())
  });

  return NextResponse.json({ alerts: result.alerts, triggered: result.triggered });
}
