import { getRecentMetrics } from "@/lib/database/metrics";

export async function getProjectCostIntelligence(projectId: string) {
  const samples = await getRecentMetrics({ projectId, limit: 720 });
  if (!samples.length) {
    return {
      totalEstimate: 0,
      computeCost: 0,
      storageCost: 0,
      networkCost: 0,
      trend: [] as Array<{ hour: string; cost: number }>
    };
  }

  let computeCost = 0;
  let storageCost = 0;
  let networkCost = 0;

  const trend: Array<{ hour: string; cost: number }> = [];

  for (const s of samples) {
    const compute = s.cpu * 0.0009 + s.memory * 0.0006;
    const storage = s.disk * 0.0003;
    const network = s.network * 0.0002;
    const cost = Number((compute + storage + network).toFixed(6));
    computeCost += compute;
    storageCost += storage;
    networkCost += network;
    trend.push({ hour: String(s.timestamp).slice(0, 13) + ":00", cost });
  }

  return {
    totalEstimate: Number((computeCost + storageCost + networkCost).toFixed(4)),
    computeCost: Number(computeCost.toFixed(4)),
    storageCost: Number(storageCost.toFixed(4)),
    networkCost: Number(networkCost.toFixed(4)),
    trend
  };
}
