import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";

export function createTraceId(): string {
  return randomUUID().replace(/-/g, "");
}

export async function getOrCreateTraceId(): Promise<string> {
  const h = await headers();
  return h.get("x-trace-id") ?? h.get("traceparent")?.split("-")[1] ?? createTraceId();
}

export async function writeTrace(params: {
  traceId: string;
  organizationId: string;
  projectId?: string;
  service: string;
  path: string;
  method: string;
  statusCode: number;
  startedAt: number;
  endedAt?: number;
  metadata?: Record<string, unknown>;
}) {
  const db = getDatabase();
  const endedAt = params.endedAt ?? Date.now();
  const startedIso = new Date(params.startedAt).toISOString();
  const endedIso = new Date(endedAt).toISOString();
  const durationMs = Math.max(0, endedAt - params.startedAt);

  await db.collection(COLLECTIONS.traces).doc(params.traceId).set(
    {
      id: params.traceId,
      organization_id: params.organizationId,
      project_id: params.projectId ?? null,
      service: params.service,
      path: params.path,
      method: params.method,
      status_code: params.statusCode,
      started_at: startedIso,
      ended_at: endedIso,
      duration_ms: durationMs,
      metadata: params.metadata ?? {},
      updated_at: new Date().toISOString()
    },
    { merge: true }
  );
}

export async function writeSpan(params: {
  traceId: string;
  service: string;
  name: string;
  startedAt: number;
  endedAt?: number;
  attributes?: Record<string, unknown>;
}) {
  const db = getDatabase();
  const id = randomUUID();
  const endedAt = params.endedAt ?? Date.now();
  await db.collection(COLLECTIONS.spans).doc(id).set({
    id,
    trace_id: params.traceId,
    service: params.service,
    name: params.name,
    started_at: new Date(params.startedAt).toISOString(),
    ended_at: new Date(endedAt).toISOString(),
    duration_ms: Math.max(0, endedAt - params.startedAt),
    attributes: params.attributes ?? {},
    created_at: new Date().toISOString()
  });
}

export async function listTraces(params: { projectId?: string; limit?: number }) {
  const db = getDatabase();
  const limit = Math.max(1, Math.min(params.limit ?? 200, 500));
  let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(COLLECTIONS.traces);
  if (params.projectId) query = query.where("project_id", "==", params.projectId);
  const snapshot = await query.orderBy("updated_at", "desc").limit(limit).get();
  return snapshot.docs.map((doc) => doc.data());
}
