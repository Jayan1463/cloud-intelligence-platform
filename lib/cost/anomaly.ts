import { getDatabase } from "@/lib/database/client";
import { estimateSampleCost } from "@/lib/cost/model";

export type CostAnomalyRecord = {
  organization_id: string;
  project_id: string;
  service: string;
  expected_cost: number;
  actual_cost: number;
  severity: "low" | "medium" | "high";
  timestamp: string;
};

type MetricSample = {
  cpu?: number;
  disk?: number;
  network?: number;
  timestamp?: string;
};

function inferService(sample: MetricSample): string {
  const cpuCost = Math.max(Number(sample.cpu ?? 0), 0) / 100 * 0.045;
  const storageCost = Math.max(Number(sample.disk ?? 0), 0) / 100 * 100 * 0.00014;
  const networkCost = Math.max(Number(sample.network ?? 0), 0) / 1024 * 0.09;
  const max = Math.max(cpuCost, storageCost, networkCost);
  if (max === cpuCost) return "Compute";
  if (max === storageCost) return "Storage";
  return "Network";
}

function clampSeverity(ratio: number): CostAnomalyRecord["severity"] {
  if (ratio >= 4) return "high";
  if (ratio >= 2.75) return "medium";
  return "low";
}

export function detectCostAnomalies(params: {
  organizationId: string;
  projectId: string;
  metrics: MetricSample[];
  window?: number;
}): CostAnomalyRecord[] {
  const window = Math.max(10, Math.min(params.window ?? 48, 500));
  const samples = params.metrics.slice(-window);
  if (samples.length < 12) return [];

  const byService = new Map<string, number[]>();
  for (const sample of samples) {
    const service = inferService(sample);
    const cost = estimateSampleCost({
      cpuPercent: Number(sample.cpu ?? 0),
      diskPercent: Number(sample.disk ?? 0),
      networkUnits: Number(sample.network ?? 0)
    });
    const arr = byService.get(service) ?? [];
    arr.push(cost);
    byService.set(service, arr);
  }

  const timestamp = String(samples[samples.length - 1]?.timestamp ?? new Date().toISOString());
  const anomalies: CostAnomalyRecord[] = [];

  for (const [service, costs] of byService.entries()) {
    if (costs.length < 10) continue;
    const history = costs.slice(0, -1);
    const latest = costs[costs.length - 1] ?? 0;
    const avg = history.reduce((sum, value) => sum + value, 0) / Math.max(1, history.length);
    if (avg <= 0) continue;
    if (latest <= avg * 2) continue;

    const ratio = latest / avg;
    anomalies.push({
      organization_id: params.organizationId,
      project_id: params.projectId,
      service,
      expected_cost: Number(avg.toFixed(4)),
      actual_cost: Number(latest.toFixed(4)),
      severity: clampSeverity(ratio),
      timestamp
    });
  }

  return anomalies;
}

export async function upsertCostAnomalies(records: CostAnomalyRecord[]): Promise<number> {
  if (!records.length) return 0;
  const db = getDatabase();
  const batch = db.batch();
  for (const record of records) {
    const docId = `${record.organization_id}_${record.project_id}_${record.service}_${record.timestamp}`;
    const ref = db.collection("cost_anomalies").doc(docId);
    batch.set(ref, record, { merge: true });
  }
  await batch.commit();
  return records.length;
}

export async function listCostAnomalies(params: {
  organizationId: string;
  projectId: string;
  limit?: number;
}): Promise<CostAnomalyRecord[]> {
  const db = getDatabase();
  const limit = Math.max(1, Math.min(params.limit ?? 30, 200));
  const snapshot = await db
    .collection("cost_anomalies")
    .where("organization_id", "==", params.organizationId)
    .where("project_id", "==", params.projectId)
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.data() as CostAnomalyRecord);
}

