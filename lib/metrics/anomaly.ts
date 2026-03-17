import type { MetricSample } from "@/types/metrics";

export function detectNetworkAnomaly(sample: MetricSample, threshold = 80): boolean {
  const combined = Number(sample.networkIn ?? 0) + Number(sample.networkOut ?? 0);
  return combined > threshold;
}
