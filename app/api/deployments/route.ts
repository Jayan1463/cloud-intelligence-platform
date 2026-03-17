import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canEditProject } from "@/lib/auth/rbac";
import { createDeployment, listDeployments } from "@/lib/platform/services/deployments";

export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = new URL(request.url).searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

  const deployments = await listDeployments(projectId, 100);
  return NextResponse.json({ deployments });
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canEditProject(session.role)) return NextResponse.json({ error: "Insufficient role" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const projectId = String(body.projectId ?? "").trim();
  const version = String(body.version ?? "").trim();
  const environment = String(body.environment ?? "prod").trim() || "prod";

  if (!projectId || !version) {
    return NextResponse.json({ error: "projectId and version are required" }, { status: 400 });
  }

  const deployment = await createDeployment({
    orgId: session.orgId,
    projectId,
    version,
    environment,
    deployedBy: session.user.email,
    notes: body.notes ? String(body.notes) : undefined
  });

  return NextResponse.json({ deployment }, { status: 201 });
}
