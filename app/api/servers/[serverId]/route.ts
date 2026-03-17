import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { getServerById } from "@/lib/database/servers";

export async function GET(_: Request, { params }: { params: Promise<{ serverId: string }> }) {
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { serverId } = await params;
    const server = await getServerById(serverId);
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const lastMetricAt = server.last_metric_at ? Date.parse(server.last_metric_at) : NaN;
    const connected = Number.isFinite(lastMetricAt) ? Date.now() - lastMetricAt <= 60_000 : false;

    return NextResponse.json({
      server,
      telemetry: {
        connected,
        lastMetricAt: server.last_metric_at ?? null,
        staleAfterSeconds: 60
      },
      agent: {
        endpoint: "/api/metrics",
        auth: "Bearer <agent_key>",
        intervalSeconds: 15
      }
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
