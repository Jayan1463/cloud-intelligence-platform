import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";
import { createAlert } from "@/lib/database/alerts";
import { createIncidentFromAlert } from "@/lib/platform/services/incidents";

async function runProbe(url: string): Promise<{ ok: boolean; status: number; latencyMs: number }> {
  const start = Date.now();
  try {
    const response = await fetch(url, { method: "GET", cache: "no-store" });
    return { ok: response.ok, status: response.status, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, status: 0, latencyMs: Date.now() - start };
  }
}

export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  const db = getDatabase();
  const snapshot = await db.collection(COLLECTIONS.syntheticChecks).where("project_id", "==", projectId).orderBy("created_at", "desc").limit(100).get();
  return NextResponse.json({ checks: snapshot.docs.map((d) => d.data()) });
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId || !canManageOrganization(session.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const projectId = String(body.projectId ?? "").trim();
  const targetUrl = String(body.url ?? "").trim();
  if (!projectId || !targetUrl) return NextResponse.json({ error: "projectId and url are required" }, { status: 400 });
  const probe = await runProbe(targetUrl);
  const db = getDatabase();
  const id = randomUUID();
  await db.collection(COLLECTIONS.syntheticChecks).doc(id).set({
    id,
    organization_id: session.orgId,
    project_id: projectId,
    url: targetUrl,
    ok: probe.ok,
    status: probe.status,
    latency_ms: probe.latencyMs,
    created_at: new Date().toISOString()
  });
  if (!probe.ok) {
    const alert = await createAlert({
      organizationId: session.orgId,
      projectId,
      serverId: null,
      type: "server_down",
      severity: "high",
      message: `Synthetic probe failed for ${targetUrl} status=${probe.status}`,
      triggeredAt: new Date().toISOString()
    });
    await createIncidentFromAlert({
      orgId: session.orgId,
      projectId,
      alertId: alert.id,
      title: `Synthetic check failed: ${targetUrl}`,
      severity: "high",
      alertType: "synthetic_probe"
    });
  }
  return NextResponse.json({ stored: true, result: probe }, { status: 201 });
}
