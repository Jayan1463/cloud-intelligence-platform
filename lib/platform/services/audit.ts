import { randomUUID } from "crypto";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";

export async function writeAuditLog(input: {
  orgId: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const db = getDatabase();
  const id = randomUUID();
  await db.collection(COLLECTIONS.auditLogs).doc(id).set({
    id,
    organization_id: input.orgId,
    actor_email: input.actorEmail ?? "system",
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
    created_at: new Date().toISOString()
  });
}

export async function listAuditLogs(orgId: string, limit = 200) {
  const db = getDatabase();
  const snapshot = await db
    .collection(COLLECTIONS.auditLogs)
    .where("organization_id", "==", orgId)
    .orderBy("created_at", "desc")
    .limit(Math.min(Math.max(limit, 1), 500))
    .get();

  return snapshot.docs.map((doc) => doc.data());
}
