import { randomUUID } from "crypto";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";
import type { DatabaseMetric } from "@/lib/database/types";

export type MetricIngestInput = {
  organizationId: string;
  projectId: string;
  serverId: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  traceId?: string;
  timestamp?: string;
};

function toMetric(id: string, data: Record<string, unknown>): DatabaseMetric {
  return {
    id,
    organization_id: String(data.organization_id ?? ""),
    project_id: String(data.project_id ?? ""),
    server_id: String(data.server_id ?? ""),
    cpu: Number(data.cpu ?? 0),
    memory: Number(data.memory ?? 0),
    disk: Number(data.disk ?? 0),
    network: Number(data.network ?? 0),
    trace_id: data.trace_id ? String(data.trace_id) : undefined,
    timestamp: String(data.timestamp ?? new Date().toISOString()),
    created_at: String(data.created_at ?? new Date().toISOString())
  };
}

export async function enqueueMetric(input: MetricIngestInput): Promise<{ queueId: string }> {
  const db = getDatabase();
  const queueId = randomUUID();
  await db.collection(COLLECTIONS.metricQueue).doc(queueId).set({
    id: queueId,
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString(),
    status: "queued",
    created_at: new Date().toISOString()
  });
  return { queueId };
}

export async function processMetricQueue(limit = 200): Promise<number> {
  const db = getDatabase();
  const snapshot = await db
    .collection(COLLECTIONS.metricQueue)
    .where("status", "==", "queued")
    .orderBy("created_at", "asc")
    .limit(Math.max(1, Math.min(limit, 500)))
    .get();

  let processed = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data() as Record<string, unknown>;
    const metricId = randomUUID();
    await db.collection(COLLECTIONS.metrics).doc(metricId).set({
      id: metricId,
      organization_id: String(data.organizationId ?? data.organization_id ?? ""),
      project_id: String(data.projectId ?? data.project_id ?? ""),
      server_id: String(data.serverId ?? data.server_id ?? ""),
      cpu: Number(data.cpu ?? 0),
      memory: Number(data.memory ?? 0),
      disk: Number(data.disk ?? 0),
      network: Number(data.network ?? 0),
      trace_id: data.traceId ?? data.trace_id ?? null,
      timestamp: String(data.timestamp ?? new Date().toISOString()),
      created_at: new Date().toISOString()
    });

    await doc.ref.set({ status: "processed", processed_at: new Date().toISOString() }, { merge: true });
    processed += 1;
  }

  return processed;
}

export async function insertMetric(input: MetricIngestInput): Promise<DatabaseMetric> {
  await enqueueMetric(input);
  await processMetricQueue(1);

  const recent = await getRecentMetrics({
    projectId: input.projectId,
    serverId: input.serverId,
    limit: 1
  });

  if (!recent[0]) throw new Error("Failed to persist metric");
  return recent[0];
}

export async function getRecentMetrics(params: {
  projectId?: string;
  serverId?: string;
  limit?: number;
}): Promise<DatabaseMetric[]> {
  const db = getDatabase();
  const limit = Math.max(1, Math.min(params.limit ?? 120, 1000));
  let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(COLLECTIONS.metrics);

  if (params.projectId) query = query.where("project_id", "==", params.projectId);
  if (params.serverId) query = query.where("server_id", "==", params.serverId);

  const snapshot = await query.orderBy("timestamp", "desc").limit(limit).get();
  return snapshot.docs.map((doc) => toMetric(doc.id, doc.data())).reverse();
}
