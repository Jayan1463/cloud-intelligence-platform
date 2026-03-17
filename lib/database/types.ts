export type DatabaseOrganization = {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  created_at: string;
  updated_at: string;
};

export type DatabaseUser = {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: "admin" | "developer" | "viewer";
  organization_id: string;
  created_at: string;
  updated_at: string;
};

export type DatabaseProject = {
  id: string;
  organization_id: string;
  name: string;
  environment: string;
  region: string;
  created_at: string;
  updated_at: string;
};

export type DatabaseServer = {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  ip_address: string;
  agent_key: string;
  status: "healthy" | "warning" | "critical" | "down";
  discovered_services?: string[];
  last_metric_at?: string;
  created_at: string;
  updated_at: string;
};

export type DatabaseMetric = {
  id: string;
  organization_id: string;
  project_id: string;
  server_id: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  trace_id?: string;
  timestamp: string;
  created_at: string;
};

export type DatabaseTrace = {
  id: string;
  organization_id: string;
  project_id?: string;
  service: string;
  path: string;
  method: string;
  status_code: number;
  started_at: string;
  ended_at: string;
  duration_ms: number;
};

export type DatabaseAlert = {
  id: string;
  organization_id: string;
  project_id: string;
  server_id: string | null;
  type: "cpu" | "memory" | "disk" | "network" | "server_down";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  triggered_at: string;
  status: "open" | "acknowledged" | "resolved";
  created_at: string;
};
