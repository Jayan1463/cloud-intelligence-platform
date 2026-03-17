import { randomUUID } from "crypto";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";

export async function ingestLog(input: {
  orgId: string;
  projectId: string;
  serverId: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  source?: string;
  timestamp?: string;
  traceId?: string;
}): Promise<{ id: string }> {
  const db = getDatabase();
  const id = randomUUID();
  await db.collection(COLLECTIONS.logs).doc(id).set({
    id,
    organization_id: input.orgId,
    project_id: input.projectId,
    server_id: input.serverId,
    level: input.level,
    message: input.message,
    trace_id: input.traceId ?? null,
    source: input.source ?? "agent",
    timestamp: input.timestamp ?? new Date().toISOString(),
    created_at: new Date().toISOString()
  });

  return { id };
}

export async function searchLogs(params: {
  projectId?: string;
  serverId?: string;
  level?: string;
  q?: string;
  limit?: number;
}) {
  const db = getDatabase();
  let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(COLLECTIONS.logs);
  if (params.projectId) query = query.where("project_id", "==", params.projectId);
  if (params.serverId) query = query.where("server_id", "==", params.serverId);
  if (params.level) query = query.where("level", "==", params.level);

  const snapshot = await query.orderBy("timestamp", "desc").limit(Math.max(1, Math.min(params.limit ?? 200, 500))).get();
  const rows = snapshot.docs.map((doc) => doc.data() as Record<string, unknown>);

  if (!params.q) return rows;
  const q = params.q.toLowerCase();
  return rows.filter((row) => String(row.message ?? "").toLowerCase().includes(q));
}

export async function countRecentErrorLogs(params: { projectId: string; serverId: string; sinceIso: string }) {
  const db = getDatabase();
  const snapshot = await db
    .collection(COLLECTIONS.logs)
    .where("project_id", "==", params.projectId)
    .where("server_id", "==", params.serverId)
    .where("level", "==", "error")
    .where("timestamp", ">=", params.sinceIso)
    .limit(50)
    .get();
  return snapshot.size;
}
