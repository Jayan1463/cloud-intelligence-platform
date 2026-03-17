import { estimateSampleCost } from "@/lib/cost/model";

export type HealthScoreBreakdown = {
  costEfficiency: number;
  utilization: number;
  alerts: number;
  performance: number;
};

export type HealthScoreResult = {
  score: number;
  breakdown: HealthScoreBreakdown;
  notes: string[];
};

type Metric = {
  cpu?: number;
  memory?: number;
  disk?: number;
  network?: number;
};

type Alert = {
  severity?: "low" | "medium" | "high" | "critical";
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function computeHealthScore(params: { metrics: Metric[]; alerts: Alert[] }): HealthScoreResult {
  const metrics = params.metrics ?? [];
  const alerts = params.alerts ?? [];

  const cpuAvg = avg(metrics.map((m) => Number(m.cpu ?? 0)));
  const memAvg = avg(metrics.map((m) => Number(m.memory ?? 0)));
  const diskAvg = avg(metrics.map((m) => Number(m.disk ?? 0)));
  const netAvg = avg(metrics.map((m) => Number(m.network ?? 0)));

  const avgHourlyCost = metrics.length
    ? avg(
        metrics.map((m) =>
          estimateSampleCost({
            cpuPercent: Number(m.cpu ?? 0),
            diskPercent: Number(m.disk ?? 0),
            networkUnits: Number(m.network ?? 0)
          })
        )
      )
    : 0;

  // Cost efficiency: reward higher utilization for a given cost estimate.
  const utilizationSignal = (cpuAvg * 0.55 + memAvg * 0.25 + diskAvg * 0.2) / 100;
  const costPenalty = clamp(avgHourlyCost * 220, 0, 100); // normalized heuristic
  const costEfficiency = clamp(85 * utilizationSignal + (100 - costPenalty) * 0.25);

  // Utilization: balanced mid-range utilization scores higher than idle or pegged.
  function targetCurve(pct: number): number {
    const ideal = 55;
    const delta = Math.abs(pct - ideal);
    return clamp(100 - delta * 1.35);
  }
  const utilization = clamp(targetCurve(cpuAvg) * 0.5 + targetCurve(memAvg) * 0.35 + targetCurve(diskAvg) * 0.15);

  // Alerts: fewer and less severe alerts improves score.
  const severityWeights: Record<NonNullable<Alert["severity"]>, number> = { low: 2, medium: 6, high: 12, critical: 20 };
  const weightedAlerts = alerts.reduce((sum, a) => sum + (a.severity ? severityWeights[a.severity] : 2), 0);
  const alertsScore = clamp(100 - weightedAlerts * 2.2);

  // Performance: stable network and headroom scores higher.
  const performance = clamp(100 - clamp(netAvg / 10, 0, 100) * 0.5 - clamp(cpuAvg - 85, 0, 100) * 1.2);

  const breakdown = {
    costEfficiency: Number(costEfficiency.toFixed(1)),
    utilization: Number(utilization.toFixed(1)),
    alerts: Number(alertsScore.toFixed(1)),
    performance: Number(performance.toFixed(1))
  };

  const score = clamp(
    breakdown.costEfficiency * 0.32 +
      breakdown.utilization * 0.28 +
      breakdown.alerts * 0.24 +
      breakdown.performance * 0.16
  );

  const notes: string[] = [];
  if (cpuAvg < 20) notes.push("Low CPU utilization suggests potential rightsizing opportunities.");
  if (cpuAvg > 85) notes.push("High CPU utilization indicates reduced performance headroom.");
  if (alerts.length > 0) notes.push("Active alerts are impacting the organization health score.");
  if (avgHourlyCost > 0.6) notes.push("Cost baseline is trending higher than typical for current utilization.");

  return { score: Number(score.toFixed(0)), breakdown, notes };
}

