import { randomUUID } from "crypto";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";
import type { DatabaseAlert } from "@/lib/database/types";

export type CreateAlertInput = {
  organizationId: string;
  projectId: string;
  serverId: string | null;
  type: "cpu" | "memory" | "disk" | "network" | "server_down";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  triggeredAt: string;
};

function toAlert(id: string, data: Record<string, unknown>): DatabaseAlert {
  return {
    id,
    organization_id: String(data.organization_id ?? ""),
    project_id: String(data.project_id ?? ""),
    server_id: data.server_id ? String(data.server_id) : null,
    type: String(data.type ?? "cpu") as DatabaseAlert["type"],
    severity: String(data.severity ?? "low") as DatabaseAlert["severity"],
    message: String(data.message ?? ""),
    triggered_at: String(data.triggered_at ?? new Date().toISOString()),
    status: String(data.status ?? "open") as DatabaseAlert["status"],
    created_at: String(data.created_at ?? new Date().toISOString())
  };
}

export async function createAlert(input: CreateAlertInput): Promise<DatabaseAlert> {
  const db = getDatabase();
  const id = randomUUID();
  const payload = {
    id,
    organization_id: input.organizationId,
    project_id: input.projectId,
    server_id: input.serverId,
    type: input.type,
    severity: input.severity,
    message: input.message,
    triggered_at: input.triggeredAt,
    status: "open",
    created_at: new Date().toISOString()
  };
  await db.collection(COLLECTIONS.alerts).doc(id).set(payload);
  return toAlert(id, payload);
}

export async function hasRecentOpenAlert(params: {
  projectId: string;
  serverId: string;
  type: "cpu" | "memory" | "disk" | "network" | "server_down";
  sinceIso: string;
}): Promise<boolean> {
  const db = getDatabase();
  const snapshot = await db
    .collection(COLLECTIONS.alerts)
    .where("project_id", "==", params.projectId)
    .where("server_id", "==", params.serverId)
    .where("type", "==", params.type)
    .where("status", "==", "open")
    .where("triggered_at", ">=", params.sinceIso)
    .limit(1)
    .get();

  return !snapshot.empty;
}

export async function listAlerts(projectId?: string, limit = 100): Promise<DatabaseAlert[]> {
  const db = getDatabase();
  let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(COLLECTIONS.alerts);
  if (projectId) query = query.where("project_id", "==", projectId);

  const snapshot = await query.orderBy("triggered_at", "desc").limit(Math.max(1, Math.min(limit, 500))).get();
  return snapshot.docs.map((doc) => toAlert(doc.id, doc.data()));
}

export async function updateAlertStatus(alertId: string, status: "open" | "acknowledged" | "resolved"): Promise<void> {
  const db = getDatabase();
  await db.collection(COLLECTIONS.alerts).doc(alertId).set({ status }, { merge: true });
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
  return updateAlertStatus(alertId, "acknowledged");
}

export async function resolveOpenAlertsByTypes(params: {
  projectId: string;
  serverId: string;
  types: Array<"cpu" | "memory" | "disk" | "network" | "server_down">;
}): Promise<number> {
  if (!params.types.length) return 0;

  const db = getDatabase();
  let updated = 0;

  for (const type of params.types) {
    const snapshot = await db
      .collection(COLLECTIONS.alerts)
      .where("project_id", "==", params.projectId)
      .where("server_id", "==", params.serverId)
      .where("type", "==", type)
      .where("status", "==", "open")
      .get();

    if (snapshot.empty) continue;
    await Promise.all(
      snapshot.docs.map((doc) =>
        doc.ref.set(
          {
            status: "resolved",
            resolved_at: new Date().toISOString()
          },
          { merge: true }
        )
      )
    );
    updated += snapshot.size;
  }

  return updated;
}
