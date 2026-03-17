import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";

export async function applyRetentionPolicies(input?: {
  metricDays?: number;
  logDays?: number;
}): Promise<{ metricsPruned: number; logsPruned: number }> {
  const db = getDatabase();
  const metricDays = input?.metricDays ?? Number(process.env.METRIC_RETENTION_DAYS ?? 30);
  const logDays = input?.logDays ?? Number(process.env.LOG_RETENTION_DAYS ?? 14);

  const metricCutoff = new Date(Date.now() - metricDays * 24 * 60 * 60 * 1000).toISOString();
  const logCutoff = new Date(Date.now() - logDays * 24 * 60 * 60 * 1000).toISOString();

  const oldMetrics = await db.collection(COLLECTIONS.metrics).where("timestamp", "<", metricCutoff).limit(200).get();
  const oldLogs = await db.collection(COLLECTIONS.logs).where("timestamp", "<", logCutoff).limit(200).get();

  await Promise.all(oldMetrics.docs.map((d) => d.ref.delete()));
  await Promise.all(oldLogs.docs.map((d) => d.ref.delete()));

  return { metricsPruned: oldMetrics.size, logsPruned: oldLogs.size };
}

export async function downsampleOldMetrics(input?: { olderThanHours?: number; maxPointsPerProject?: number }) {
  const db = getDatabase();
  const olderThanHours = Math.max(1, input?.olderThanHours ?? 6);
  const maxPointsPerProject = Math.max(100, input?.maxPointsPerProject ?? 5000);
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();
  const snapshot = await db.collection(COLLECTIONS.metrics).where("timestamp", "<", cutoff).limit(maxPointsPerProject).get();
  const buckets = new Map<string, { cpu: number; memory: number; disk: number; network: number; count: number; timestamp: string }>();

  for (const doc of snapshot.docs) {
    const row = doc.data() as Record<string, unknown>;
    const projectId = String(row.project_id ?? "");
    const hour = String(row.timestamp ?? "").slice(0, 13);
    const key = `${projectId}:${hour}`;
    const current = buckets.get(key) ?? { cpu: 0, memory: 0, disk: 0, network: 0, count: 0, timestamp: `${hour}:00:00.000Z` };
    current.cpu += Number(row.cpu ?? 0);
    current.memory += Number(row.memory ?? 0);
    current.disk += Number(row.disk ?? 0);
    current.network += Number(row.network ?? 0);
    current.count += 1;
    buckets.set(key, current);
  }

  const batch = db.batch();
  for (const [key, b] of buckets.entries()) {
    const [projectId] = key.split(":");
    const ref = db.collection(COLLECTIONS.metricRollups).doc(key);
    batch.set(ref, {
      id: key,
      project_id: projectId,
      timestamp: b.timestamp,
      cpu: Number((b.cpu / b.count).toFixed(2)),
      memory: Number((b.memory / b.count).toFixed(2)),
      disk: Number((b.disk / b.count).toFixed(2)),
      network: Number((b.network / b.count).toFixed(2)),
      points: b.count,
      created_at: new Date().toISOString()
    }, { merge: true });
  }
  await batch.commit();

  return { rollups: buckets.size, sampled: snapshot.size };
}
