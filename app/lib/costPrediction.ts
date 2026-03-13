export type Metric = {
  cpu?: number;
  memory?: number;
  network?: number;
};

export function predictCost(metrics: Metric[]) {

  if (!metrics.length) return 0;

  const avgCPU =
    metrics.reduce((sum, m) => sum + (m.cpu ?? 0), 0) / metrics.length;

  const avgMemory =
    metrics.reduce((sum, m) => sum + (m.memory ?? 0), 0) / metrics.length;

  const avgNetwork =
    metrics.reduce((sum, m) => sum + (m.network ?? 0), 0) / metrics.length;

  const cpuCost = avgCPU * 0.4;
  const memoryCost = avgMemory * 0.3;
  const networkCost = avgNetwork * 0.1;

  const estimatedMonthlyCost =
    (cpuCost + memoryCost + networkCost) * 30;

  return Math.round(estimatedMonthlyCost);
}