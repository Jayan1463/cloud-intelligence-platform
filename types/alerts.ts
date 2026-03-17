export type AlertType = "cpu" | "memory" | "disk" | "network" | "server_down";

export type AlertItem = {
  id?: string;
  projectId?: string;
  type: AlertType;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  triggeredAt?: string;
  resolvedAt?: string;
  status?: "open" | "acknowledged" | "resolved";
};

export type AlertThresholds = {
  cpuHigh: number;
  memoryHigh: number;
  diskHigh: number;
  networkSpikePct: number;
  dedupeWindowMinutes: number;
};
