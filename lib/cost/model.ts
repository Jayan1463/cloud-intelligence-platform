export type CostModelRates = {
  cpuHour: number;
  storageGbHour: number;
  bandwidthGb: number;
};

export const DEFAULT_COST_RATES: CostModelRates = {
  cpuHour: 0.045,
  storageGbHour: 0.00014,
  bandwidthGb: 0.09
};

export type CostSampleInput = {
  cpuPercent: number;
  diskPercent: number;
  networkUnits: number;
};

export function estimateSampleCost(input: CostSampleInput, rates: CostModelRates = DEFAULT_COST_RATES): number {
  const cpuHours = Math.max(input.cpuPercent, 0) / 100;
  const storageGbHours = Math.max(input.diskPercent, 0) / 100 * 100;
  const bandwidthGb = Math.max(input.networkUnits, 0) / 1024;

  return Number((cpuHours * rates.cpuHour + storageGbHours * rates.storageGbHour + bandwidthGb * rates.bandwidthGb).toFixed(4));
}
