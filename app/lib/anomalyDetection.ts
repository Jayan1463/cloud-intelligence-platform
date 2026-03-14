export function detectAnomaly(metrics: any[]) {

  if (!metrics || metrics.length < 10) {
    return false;
  }

  const cpuValues = metrics.map(m => m.cpu ?? 0);

  const average =
    cpuValues.reduce((sum, val) => sum + val, 0) /
    cpuValues.length;

  const variance =
    cpuValues.reduce(
      (sum, val) => sum + Math.pow(val - average, 2),
      0
    ) / cpuValues.length;

  const stdDeviation = Math.sqrt(variance);

  const latestValue = cpuValues[cpuValues.length - 1];

  const anomalyThreshold = average + (2 * stdDeviation);

  return latestValue > anomalyThreshold;
}