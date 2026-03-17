import { estimateSampleCost } from "@/lib/cost/model";

export type CostRecommendation = {
  resource: string;
  issue: string;
  recommendation: string;
  estimated_savings: number;
};

type Metric = {
  server_id?: string;
  cpu?: number;
  disk?: number;
  network?: number;
};

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function generateCostRecommendations(params: {
  metrics: Metric[];
  projectName?: string;
}): CostRecommendation[] {
  const byServer = new Map<string, Metric[]>();
  for (const m of params.metrics) {
    const serverId = String(m.server_id ?? "unknown");
    const arr = byServer.get(serverId) ?? [];
    arr.push(m);
    byServer.set(serverId, arr);
  }

  const recommendations: CostRecommendation[] = [];
  for (const [serverId, samples] of byServer.entries()) {
    const cpuAvg = avg(samples.map((s) => Number(s.cpu ?? 0)));
    const diskAvg = avg(samples.map((s) => Number(s.disk ?? 0)));
    const estimatedHourly = avg(
      samples.map((s) =>
        estimateSampleCost({
          cpuPercent: Number(s.cpu ?? 0),
          diskPercent: Number(s.disk ?? 0),
          networkUnits: Number(s.network ?? 0)
        })
      )
    );

    if (cpuAvg > 0 && cpuAvg < 20) {
      recommendations.push({
        resource: `Server ${serverId}`,
        issue: `Low CPU utilization (avg ${cpuAvg.toFixed(1)}%)`,
        recommendation: "Consider downsizing the compute tier or consolidating workloads.",
        estimated_savings: Number((estimatedHourly * 24 * 30 * 0.25).toFixed(2))
      });
    }

    if (diskAvg >= 0 && diskAvg < 10 && samples.length >= 60) {
      recommendations.push({
        resource: `Storage attached to ${serverId}`,
        issue: `Low storage utilization (avg ${diskAvg.toFixed(1)}%)`,
        recommendation: "Move infrequently accessed data to archival storage and reduce provisioned capacity.",
        estimated_savings: Number((estimatedHourly * 24 * 30 * 0.15).toFixed(2))
      });
    }

    if (estimatedHourly * 24 * 30 > 250 && cpuAvg < 35) {
      recommendations.push({
        resource: `Workload ${params.projectName ?? "project"} / ${serverId}`,
        issue: "High estimated monthly cost with moderate utilization",
        recommendation: "Review scaling policies and right-size the workload. Consider reserved/committed-use pricing where applicable.",
        estimated_savings: Number((estimatedHourly * 24 * 30 * 0.18).toFixed(2))
      });
    }
  }

  return recommendations
    .filter((r) => Number.isFinite(r.estimated_savings) && r.estimated_savings > 0)
    .sort((a, b) => b.estimated_savings - a.estimated_savings)
    .slice(0, 10);
}

