export type WorkspaceProject = {
  id: string;
  name: string;
  avgCpu: string;
  monthlyCost: string;
};

export type WorkspaceAlert = {
  id: string;
  projectId: string;
  type: "cpu" | "memory" | "network";
  severity: "high" | "medium" | "low";
  message: string;
};

export const WORKSPACE_PROJECTS: WorkspaceProject[] = [
  { id: "project-alpha", name: "Project Alpha", avgCpu: "38%", monthlyCost: "$1,980" },
  { id: "project-beta", name: "Project Beta", avgCpu: "31%", monthlyCost: "$1,420" },
  { id: "project-gamma", name: "Project Gamma", avgCpu: "44%", monthlyCost: "$1,430" }
];

export const WORKSPACE_ALERTS: WorkspaceAlert[] = [
  { id: "a1", projectId: "project-alpha", type: "cpu", severity: "high", message: "CPU > 85% on core-api" },
  { id: "a2", projectId: "project-alpha", type: "memory", severity: "medium", message: "Memory spike on worker queue" },
  { id: "a3", projectId: "project-alpha", type: "network", severity: "medium", message: "Network anomaly detected" },
  { id: "a4", projectId: "project-beta", type: "cpu", severity: "medium", message: "CPU > 70% on billing-service" },
  { id: "a5", projectId: "project-beta", type: "network", severity: "low", message: "Intermittent latency in eu-west-1" },
  { id: "a6", projectId: "project-gamma", type: "memory", severity: "high", message: "Memory pressure on data-processor" },
  { id: "a7", projectId: "project-gamma", type: "cpu", severity: "medium", message: "CPU > 75% on ingest-worker" }
];

export function getSelectedProject(projectId?: string): WorkspaceProject {
  return WORKSPACE_PROJECTS.find((project) => project.id === projectId) ?? WORKSPACE_PROJECTS[0];
}

export function getAlertsForProject(projectId?: string): WorkspaceAlert[] {
  const selected = getSelectedProject(projectId);
  return WORKSPACE_ALERTS.filter((alert) => alert.projectId === selected.id);
}
