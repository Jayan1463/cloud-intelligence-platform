export type AlertType = "cpu" | "memory" | "network";

export type AlertItem = {
  id?: string;
  projectId: string;
  type: AlertType;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  triggeredAt: string;
  resolvedAt?: string;
  status: "open" | "resolved";
};

export type AlertThresholds = {
  cpu: number;
  memory: number;
  networkAnomaly: number;
};
