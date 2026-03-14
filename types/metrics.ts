export type MetricSample = {
  id?: string;
  projectId: string;
  ts: string;
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
  anomalyScore?: number;
  source?: string;
};
