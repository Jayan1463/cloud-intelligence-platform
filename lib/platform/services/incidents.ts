import { randomUUID } from "crypto";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";

export async function createIncidentFromAlert(input: {
  orgId: string;
  projectId: string;
  alertId: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
  serverId?: string | null;
  alertType?: string;
}): Promise<{ id: string }> {
  const db = getDatabase();
  const now = new Date().toISOString();
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const correlated = await db
    .collection(COLLECTIONS.incidents)
    .where("project_id", "==", input.projectId)
    .where("status", "in", ["open", "investigating"])
    .where("updated_at", ">=", since)
    .limit(10)
    .get();

  const existing = correlated.docs.find((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return (input.serverId && data.server_id === input.serverId) || data.root_cause === input.alertType;
  });

  if (existing) {
    const data = existing.data() as Record<string, unknown>;
    const timeline = Array.isArray(data.timeline) ? data.timeline : [];
    timeline.push({ at: now, message: `Correlated alert attached: ${input.title}` });
    await existing.ref.set(
      {
        alert_ids: Array.from(new Set([...(Array.isArray(data.alert_ids) ? data.alert_ids : []), input.alertId])),
        timeline,
        updated_at: now
      },
      { merge: true }
    );
    return { id: existing.id };
  }

  const id = randomUUID();

  await db.collection(COLLECTIONS.incidents).doc(id).set({
    id,
    organization_id: input.orgId,
    project_id: input.projectId,
    alert_id: input.alertId,
    alert_ids: [input.alertId],
    server_id: input.serverId ?? null,
    root_cause: input.alertType ?? null,
    title: input.title,
    severity: input.severity,
    assigned_to: input.assignedTo ?? null,
    status: "open",
    timeline: [{ at: now, message: "Incident auto-created from alert" }],
    created_at: now,
    updated_at: now
  });

  return { id };
}

export async function listIncidents(projectId: string, limit = 100) {
  const db = getDatabase();
  const snapshot = await db
    .collection(COLLECTIONS.incidents)
    .where("project_id", "==", projectId)
    .orderBy("updated_at", "desc")
    .limit(Math.max(1, Math.min(limit, 300)))
    .get();

  return snapshot.docs.map((doc) => doc.data());
}

export async function updateIncident(input: {
  incidentId: string;
  status?: "open" | "investigating" | "resolved";
  assignedTo?: string;
  note?: string;
}) {
  const db = getDatabase();
  const ref = db.collection(COLLECTIONS.incidents).doc(input.incidentId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Incident not found");
  const data = snap.data() as Record<string, unknown>;
  const timeline = Array.isArray(data.timeline) ? data.timeline : [];
  if (input.note) timeline.push({ at: new Date().toISOString(), message: input.note });

  await ref.set(
    {
      status: input.status ?? data.status,
      assigned_to: input.assignedTo ?? data.assigned_to ?? null,
      timeline,
      updated_at: new Date().toISOString()
    },
    { merge: true }
  );
}
