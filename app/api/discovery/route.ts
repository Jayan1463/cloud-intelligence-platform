import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canEditProject } from "@/lib/auth/rbac";
import { listServers } from "@/lib/database/servers";

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canEditProject(session.role)) return NextResponse.json({ error: "Insufficient role" }, { status: 403 });

  const projectId = String((await request.json().catch(() => ({}))).projectId ?? "").trim();
  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

  const servers = await listServers(projectId);
  const discovered = servers.map((server) => ({
    serverId: server.id,
    services: server.discovered_services ?? ["web", "api", "db"],
    status: server.status
  }));

  return NextResponse.json({ discovered, count: discovered.length });
}
