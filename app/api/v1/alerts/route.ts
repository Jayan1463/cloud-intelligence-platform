import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { listAlerts, createAlert } from "@/lib/database/alerts";
import { authorizeApiKey } from "@/lib/platform/auth/api-access";

export async function GET(request: Request) {
  const session = await getSessionContext();
  const apiAuth = await authorizeApiKey(request);
  if (!session.user && !apiAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const alerts = await listAlerts(projectId, 200);
  return NextResponse.json({ alerts });
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  const apiAuth = await authorizeApiKey(request);
  const orgId = session.orgId ?? apiAuth?.organizationId;
  if ((!session.user && !apiAuth) || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const projectId = String(body.projectId ?? "").trim();
  const serverId = body.serverId ? String(body.serverId) : null;

  if (!projectId || !body.type || !body.message) {
    return NextResponse.json({ error: "projectId, type and message are required" }, { status: 400 });
  }

  const alert = await createAlert({
    organizationId: orgId,
    projectId,
    serverId,
    type: body.type,
    severity: body.severity ?? "medium",
    message: String(body.message),
    triggeredAt: new Date().toISOString()
  });

  return NextResponse.json({ alert }, { status: 201 });
}
