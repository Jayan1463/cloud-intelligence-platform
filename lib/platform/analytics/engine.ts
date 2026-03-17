import { getRecentMetrics } from "@/lib/database/metrics";

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function getPerformanceInsights(projectId: string) {
  const metrics = await getRecentMetrics({ projectId, limit: 500 });
  const cpu = metrics.map((m) => m.cpu);
  const memory = metrics.map((m) => m.memory);
  const disk = metrics.map((m) => m.disk);

  const cpuAvg = avg(cpu);
  const memAvg = avg(memory);
  const diskAvg = avg(disk);

  const anomaly = cpuAvg > 85 || memAvg > 90 || diskAvg > 90;
  const trend = cpu.length > 4 ? cpu.slice(-1)[0] - cpu.slice(0, 1)[0] : 0;

  return {
    trend,
    anomaly,
    summary: {
      cpuAvg,
      memAvg,
      diskAvg
    },
    recommendations: [
      cpuAvg > 75 ? "Scale compute or tune workload for sustained CPU pressure." : "Compute usage is stable.",
      memAvg > 80 ? "Review memory leaks and right-size containers." : "Memory profile is healthy.",
      diskAvg > 80 ? "Increase disk capacity or apply log rotation." : "Disk utilization is healthy."
    ]
  };
}
