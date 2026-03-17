import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";
import { getRecentMetrics } from "@/lib/database/metrics";

export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const db = getDatabase();
  let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(COLLECTIONS.sloDefinitions).where("organization_id", "==", session.orgId);
  if (projectId) query = query.where("project_id", "==", projectId);
  const snapshot = await query.get();
  const definitions = snapshot.docs.map((doc) => doc.data());

  const evaluations = await Promise.all(definitions.map(async (defRaw) => {
    const def = defRaw as Record<string, unknown>;
    const pid = String(def.project_id ?? "");
    const metric = String(def.metric ?? "uptime");
    const target = Number(def.target ?? 99.9);
    const rows = await getRecentMetrics({ projectId: pid, limit: 300 });
    const sli = metric === "latency"
      ? Math.max(0, 100 - (rows.reduce((s, r) => s + Number(r.cpu), 0) / Math.max(rows.length, 1)))
      : Math.max(0, 100 - rows.filter((r) => Number(r.cpu) > 95 || Number(r.memory) > 95).length / Math.max(rows.length, 1) * 100);
    const burnRate = target > 0 ? Math.max(0, (target - sli) / (100 - target || 1)) : 0;
    return { id: def.id, metric, target, sli: Number(sli.toFixed(2)), burnRate: Number(burnRate.toFixed(2)), violated: sli < target };
  }));

  return NextResponse.json({ slos: definitions, evaluations });
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const projectId = String(body.projectId ?? "").trim();
  const metric = String(body.metric ?? "uptime");
  const target = Number(body.target ?? 99.9);
  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  const db = getDatabase();
  const id = randomUUID();
  await db.collection(COLLECTIONS.sloDefinitions).doc(id).set({
    id,
    organization_id: session.orgId,
    project_id: projectId,
    metric,
    target,
    created_at: new Date().toISOString()
  });
  return NextResponse.json({ created: true, id }, { status: 201 });
}
