export type MetricSample = {
  id?: string;
  projectId: string;
  serverId?: string;
  ts?: string;
  timestamp?: string;
  cpu: number;
  memory: number;
  disk?: number;
  network?: number;
  networkIn?: number;
  networkOut?: number;
  anomalyScore?: number;
  source?: string;
};
