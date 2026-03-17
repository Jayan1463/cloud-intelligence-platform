import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { listAlerts, createAlert, updateAlertStatus } from "@/lib/database/alerts";
import { resolveOrganizationId } from "@/lib/database/organizations";
import { getProjectForOrganization } from "@/lib/database/projects";
import { canAcknowledgeAlerts } from "@/lib/auth/rbac";
import { evaluateServerHeartbeatAlerts } from "@/lib/alerts/engine";

export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "100");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const orgId = await resolveOrganizationId(session.orgId, session.user.email);
    const project = await getProjectForOrganization(orgId, projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await evaluateServerHeartbeatAlerts({ organizationId: orgId, projectId });
    const alerts = await listAlerts(projectId, limit);
    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const projectId = String(body.projectId ?? "").trim();

  if (!projectId || !body.type || !body.message) {
    return NextResponse.json({ error: "projectId, type and message are required" }, { status: 400 });
  }

  const alert = await createAlert({
    organizationId: session.orgId,
    projectId,
    serverId: body.serverId ? String(body.serverId) : null,
    type: body.type,
    severity: body.severity ?? "medium",
    message: String(body.message),
    triggeredAt: new Date().toISOString()
  });

  return NextResponse.json({ alert }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getSessionContext();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAcknowledgeAlerts(session.role)) return NextResponse.json({ error: "Insufficient role" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const alertId = String(body.alertId ?? "").trim();
  const status = String(body.status ?? "").trim();

  if (!alertId || (status !== "open" && status !== "acknowledged" && status !== "resolved")) {
    return NextResponse.json({ error: "alertId and valid status are required" }, { status: 400 });
  }

  await updateAlertStatus(alertId, status as "open" | "acknowledged" | "resolved");
  return NextResponse.json({ updated: true });
}
