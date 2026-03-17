import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canAcknowledgeAlerts } from "@/lib/auth/rbac";
import { listIncidents, updateIncident } from "@/lib/platform/services/incidents";

export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = new URL(request.url).searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

  const incidents = await listIncidents(projectId, 200);
  return NextResponse.json({ incidents });
}

export async function PATCH(request: Request) {
  const session = await getSessionContext();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAcknowledgeAlerts(session.role)) return NextResponse.json({ error: "Insufficient role" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const incidentId = String(body.incidentId ?? "").trim();
  if (!incidentId) return NextResponse.json({ error: "incidentId is required" }, { status: 400 });

  await updateIncident({
    incidentId,
    status: body.status,
    assignedTo: body.assignedTo,
    note: body.note
  });

  return NextResponse.json({ updated: true });
}
