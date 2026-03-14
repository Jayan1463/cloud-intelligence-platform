import type { MetricSample } from "@/types/metrics";

export function detectNetworkAnomaly(sample: MetricSample, threshold = 80): boolean {
  const combined = sample.networkIn + sample.networkOut;
  return combined > threshold;
}
