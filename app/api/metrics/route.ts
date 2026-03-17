import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { insertMetric, getRecentMetrics } from "@/lib/database/metrics";
import { evaluateAndDispatchAlerts } from "@/lib/alerts/engine";
import { resolveOpenAlertsByTypes } from "@/lib/database/alerts";
import { getServerByAgentKey, getServerById, updateServerStatus } from "@/lib/database/servers";
import { writeAuditLog } from "@/lib/platform/services/audit";
import { getOrCreateTraceId, writeSpan, writeTrace } from "@/lib/platform/observability/tracing";

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const serverId = url.searchParams.get("serverId") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "120");

  try {
    const metrics = await getRecentMetrics({ projectId, serverId, limit });
    if (session.orgId) {
      const traceId = await getOrCreateTraceId();
      await writeTrace({
        traceId,
        organizationId: session.orgId,
        projectId,
        service: "metrics-api",
        path: "/api/metrics",
        method: "GET",
        statusCode: 200,
        startedAt
      });
    }
    return NextResponse.json({ metrics });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const body = await request.json().catch(() => ({}));

  let projectId = String(body.projectId ?? "").trim();
  let serverId = String(body.serverId ?? "").trim();
  const cpu = toNumber(body.cpu);
  const memory = toNumber(body.memory);
  const disk = toNumber(body.disk);
  const network = toNumber(body.network ?? 0);
  const timestamp = String(body.timestamp ?? "").trim() || new Date().toISOString();

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Agent authorization required" }, { status: 401 });
  }
  const agentKey = authHeader.replace("Bearer ", "").trim();
  const server = await getServerByAgentKey(agentKey);
  if (!server) {
    return NextResponse.json({ error: "Invalid agent key" }, { status: 401 });
  }
  projectId = server.project_id;
  serverId = server.id;

  if (!projectId || !serverId || [cpu, memory, disk, network].some((v) => Number.isNaN(v))) {
    return NextResponse.json(
      { error: "projectId, serverId, cpu, memory, disk, network are required with numeric metric values" },
      { status: 400 }
    );
  }

  try {
    const server = await getServerById(serverId);
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }
    if (server.project_id !== projectId) {
      return NextResponse.json({ error: "Server does not belong to the provided projectId" }, { status: 400 });
    }

    const traceId = body.traceId ? String(body.traceId) : await getOrCreateTraceId();
    const metric = await insertMetric({
      organizationId: server.organization_id,
      projectId,
      serverId,
      cpu,
      memory,
      disk,
      network,
      traceId,
      timestamp
    });

    await resolveOpenAlertsByTypes({
      projectId,
      serverId,
      types: ["server_down"]
    });

    const alertResult = await evaluateAndDispatchAlerts({
      organizationId: server.organization_id,
      projectId,
      serverId,
      cpu,
      memory,
      disk,
      network,
      timestamp
    });

    const nextStatus = cpu >= 95 || memory >= 95 || disk >= 97
      ? "critical"
      : cpu >= 85 || memory >= 90 || disk >= 92
        ? "warning"
        : "healthy";
    await updateServerStatus(serverId, nextStatus);
    await writeAuditLog({
      orgId: server.organization_id,
      action: "metrics.ingested",
      entityType: "server",
      entityId: serverId,
      metadata: { cpu, memory, disk, network }
    });
    await writeTrace({
      traceId,
      organizationId: server.organization_id,
      projectId,
      service: "metrics-api",
      path: "/api/metrics",
      method: "POST",
      statusCode: 201,
      startedAt,
      metadata: { serverId, alertsTriggered: alertResult.triggered }
    });
    await writeSpan({ traceId, service: "metrics-api", name: "evaluateAndDispatchAlerts", startedAt });

    return NextResponse.json({ stored: true, metric, alertsTriggered: alertResult.triggered }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
