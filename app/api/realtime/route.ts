import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { getRecentMetrics } from "@/lib/database/metrics";
import { listAlerts } from "@/lib/database/alerts";
import { listServers } from "@/lib/database/servers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: string, data: unknown) => controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      send("ready", { ok: true, projectId });

      const timer = setInterval(async () => {
        try {
          const [metrics, alerts, servers] = await Promise.all([
            getRecentMetrics({ projectId, limit: 30 }),
            listAlerts(projectId, 20),
            listServers(projectId)
          ]);
          send("snapshot", {
            ts: new Date().toISOString(),
            metrics,
            alerts,
            servers
          });
        } catch {
          send("error", { message: "snapshot_failed" });
        }
      }, 5000);

      const keepAlive = setInterval(() => send("ping", { at: Date.now() }), 15000);

      const abort = () => {
        clearInterval(timer);
        clearInterval(keepAlive);
        controller.close();
      };
      request.signal.addEventListener("abort", abort);
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
