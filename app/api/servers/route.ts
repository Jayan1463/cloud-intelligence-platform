import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canEditProject } from "@/lib/auth/rbac";
import { listServers, registerServer } from "@/lib/database/servers";

export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;

  try {
    const servers = await listServers(projectId);
    return NextResponse.json({ servers });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canEditProject(session.role)) {
    return NextResponse.json({ error: "Admin or developer role required" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const projectId = String(body.projectId ?? "").trim();
  const name = String(body.name ?? "").trim();
  const ipAddress = String(body.ipAddress ?? "").trim();

  if (!projectId || !name || !ipAddress) {
    return NextResponse.json({ error: "projectId, name, ipAddress are required" }, { status: 400 });
  }

  try {
    const server = await registerServer({ projectId, name, ipAddress });
    return NextResponse.json({ server, agentInstall: { serverId: server.id, agentKey: server.agent_key } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
