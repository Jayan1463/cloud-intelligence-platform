import type { MetricSample } from "@/types/metrics";

export function validateMetricPayload(payload: Partial<MetricSample>): payload is MetricSample {
  return Boolean(
    payload.projectId &&
      payload.ts &&
      typeof payload.cpu === "number" &&
      typeof payload.memory === "number" &&
      typeof payload.networkIn === "number" &&
      typeof payload.networkOut === "number"
  );
}
