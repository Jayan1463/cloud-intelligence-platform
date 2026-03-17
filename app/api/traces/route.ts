import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { listTraces, writeSpan, writeTrace, getOrCreateTraceId } from "@/lib/platform/observability/tracing";

export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const traces = await listTraces({ projectId, limit: Number(url.searchParams.get("limit") ?? "200") });
  return NextResponse.json({ traces });
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const traceId = String(body.traceId ?? "").trim() || await getOrCreateTraceId();
  const startedAt = Number(body.startedAt ?? Date.now() - 10);
  const endedAt = Number(body.endedAt ?? Date.now());

  await writeTrace({
    traceId,
    organizationId: session.orgId,
    projectId: body.projectId ? String(body.projectId) : undefined,
    service: String(body.service ?? "web"),
    path: String(body.path ?? "/"),
    method: String(body.method ?? "GET"),
    statusCode: Number(body.statusCode ?? 200),
    startedAt,
    endedAt,
    metadata: body.metadata && typeof body.metadata === "object" ? body.metadata as Record<string, unknown> : {}
  });

  await writeSpan({
    traceId,
    service: String(body.service ?? "web"),
    name: String(body.spanName ?? "request"),
    startedAt,
    endedAt,
    attributes: body.attributes && typeof body.attributes === "object" ? body.attributes as Record<string, unknown> : {}
  });

  return NextResponse.json({ stored: true, traceId }, { status: 201 });
}
