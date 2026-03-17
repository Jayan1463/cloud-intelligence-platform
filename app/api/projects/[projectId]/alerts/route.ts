import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { ensureProjectAccess } from "@/lib/org/access";
import { listAlerts } from "@/lib/database/alerts";
import { evaluateServerHeartbeatAlerts } from "@/lib/alerts/engine";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSessionContext();
  const { projectId } = await params;

  try {
    ensureProjectAccess(session, projectId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }
  if (!session.orgId) {
    return NextResponse.json({ error: "Organization context missing" }, { status: 400 });
  }

  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit") ?? "100"), 500));
  const view = url.searchParams.get("view");

  await evaluateServerHeartbeatAlerts({ organizationId: session.orgId, projectId });
  const alerts = await listAlerts(projectId, limit);
  const filtered = view === "past"
    ? alerts.filter((alert) => alert.status === "resolved")
    : view === "active"
      ? alerts.filter((alert) => alert.status !== "resolved")
      : alerts;

  return NextResponse.json({ alerts: filtered });
}
