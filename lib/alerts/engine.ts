import type { AlertItem, AlertThresholds } from "@/types/alerts";
import type { MetricSample } from "@/types/metrics";
import { detectNetworkAnomaly } from "@/lib/metrics/anomaly";

export function evaluateAlerts(sample: MetricSample, thresholds: AlertThresholds): AlertItem[] {
  const now = new Date().toISOString();
  const alerts: AlertItem[] = [];

  if (sample.cpu > thresholds.cpu) {
    alerts.push({
      projectId: sample.projectId,
      type: "cpu",
      severity: "high",
      message: `CPU threshold exceeded: ${sample.cpu}% > ${thresholds.cpu}%`,
      triggeredAt: now,
      status: "open"
    });
  }

  if (sample.memory > thresholds.memory) {
    alerts.push({
      projectId: sample.projectId,
      type: "memory",
      severity: "high",
      message: `Memory spike detected: ${sample.memory}% > ${thresholds.memory}%`,
      triggeredAt: now,
      status: "open"
    });
  }

  if (detectNetworkAnomaly(sample, thresholds.networkAnomaly)) {
    alerts.push({
      projectId: sample.projectId,
      type: "network",
      severity: "medium",
      message: "Network anomaly detected",
      triggeredAt: now,
      status: "open"
    });
  }

  return alerts;
}
