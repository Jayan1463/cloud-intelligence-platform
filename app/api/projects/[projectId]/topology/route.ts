import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { ensureProjectAccess } from "@/lib/org/access";
import { listServers } from "@/lib/database/servers";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSessionContext();
  const { projectId } = await params;

  try {
    ensureProjectAccess(session, projectId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  const servers = await listServers(projectId);
  const nodes = servers.map((server) => ({
    id: server.id,
    label: server.name,
    health: server.status,
    services: server.discovered_services ?? []
  }));

  const edges = servers.slice(1).map((server, idx) => ({
    id: `e_${idx}`,
    from: servers[0].id,
    to: server.id
  }));

  return NextResponse.json({ nodes, edges });
}
