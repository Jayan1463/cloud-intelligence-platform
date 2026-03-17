import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { getServerByAgentKey, getServerById } from "@/lib/database/servers";
import { ingestLog, searchLogs, countRecentErrorLogs } from "@/lib/platform/services/logs";
import { getOrCreateTraceId, writeSpan, writeTrace } from "@/lib/platform/observability/tracing";
import { createIncidentFromAlert } from "@/lib/platform/services/incidents";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const serverId = url.searchParams.get("serverId") ?? undefined;
  const level = url.searchParams.get("level") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;

  const logs = await searchLogs({ projectId, serverId, level, q, limit: 250 });
  if (session.orgId) {
    const traceId = await getOrCreateTraceId();
    await writeTrace({
      traceId,
      organizationId: session.orgId,
      projectId,
      service: "logs-api",
      path: "/api/logs",
      method: "GET",
      statusCode: 200,
      startedAt
    });
    await writeSpan({ traceId, service: "logs-api", name: "searchLogs", startedAt, attributes: { level: level ?? null, q: q ?? null } });
  }
  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const body = await request.json().catch(() => ({}));
  let projectId = String(body.projectId ?? "").trim();
  let serverId = String(body.serverId ?? "").trim();
  let orgId = String(body.organizationId ?? "").trim();

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const server = await getServerByAgentKey(authHeader.replace("Bearer ", "").trim());
    if (!server) {
      return NextResponse.json({ error: "Invalid agent key" }, { status: 401 });
    }
    projectId = server.project_id;
    serverId = server.id;
    orgId = server.organization_id;
  }

  if (!projectId || !serverId) {
    return NextResponse.json({ error: "projectId and serverId are required" }, { status: 400 });
  }

  if (!orgId) {
    const server = await getServerById(serverId);
    orgId = server?.organization_id ?? "";
  }

  const levelRaw = String(body.level ?? "info").toLowerCase();
  const level = levelRaw === "debug" || levelRaw === "warn" || levelRaw === "error" ? levelRaw : "info";
  const message = String(body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });

  const log = await ingestLog({
    orgId,
    projectId,
    serverId,
    level,
    message,
    traceId: body.traceId ? String(body.traceId) : await getOrCreateTraceId(),
    source: body.source ? String(body.source) : undefined,
    timestamp: body.timestamp ? String(body.timestamp) : undefined
  });

  if (orgId) {
    const traceId = body.traceId ? String(body.traceId) : await getOrCreateTraceId();
    await writeTrace({
      traceId,
      organizationId: orgId,
      projectId,
      service: "logs-api",
      path: "/api/logs",
      method: "POST",
      statusCode: 201,
      startedAt,
      metadata: { serverId, level }
    });
    await writeSpan({ traceId, service: "logs-api", name: "ingestLog", startedAt });
  }

  if (level === "error" && orgId) {
    const sinceIso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const errorCount = await countRecentErrorLogs({ projectId, serverId, sinceIso });
    if (errorCount >= 3) {
      await createIncidentFromAlert({
        orgId,
        projectId,
        alertId: `log-${serverId}-${Math.floor(Date.now() / 300000)}`,
        title: `Error log burst on server ${serverId}`,
        severity: "high",
        serverId,
        alertType: "logs_error_burst"
      });
    }
  }

  return NextResponse.json({ stored: true, log }, { status: 201 });
}
