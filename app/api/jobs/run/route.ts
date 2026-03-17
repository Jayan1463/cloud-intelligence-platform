import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { applyRetentionPolicies } from "@/lib/platform/retention/jobs";
import { getWorkspaceProjects } from "@/lib/workspace/projects";
import { resolveOrganizationId } from "@/lib/database/organizations";
import { evaluateProjectAlertsFromRecentMetrics, evaluateServerHeartbeatAlerts } from "@/lib/alerts/engine";
import { getRecentMetrics } from "@/lib/database/metrics";
import { detectCostAnomalies, upsertCostAnomalies } from "@/lib/cost/anomaly";

export async function POST() {
  const session = await getSessionContext();
  if (!session.user || !canManageOrganization(session.role)) {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }
  const orgId = await resolveOrganizationId(session.orgId, session.user.email);
  const { projects } = await getWorkspaceProjects();
  const results: Array<Record<string, unknown>> = [];

  for (const project of projects) {
    const [metricEval, hbEval, metrics] = await Promise.all([
      evaluateProjectAlertsFromRecentMetrics({ organizationId: orgId, projectId: project.id, limit: 300 }),
      evaluateServerHeartbeatAlerts({ organizationId: orgId, projectId: project.id }),
      getRecentMetrics({ projectId: project.id, limit: 300 })
    ]);
    const anomalies = detectCostAnomalies({ organizationId: orgId, projectId: project.id, metrics });
    const storedAnomalies = await upsertCostAnomalies(anomalies);
    results.push({ projectId: project.id, metricEval, hbEval, storedAnomalies });
  }

  const retention = await applyRetentionPolicies();
  return NextResponse.json({ ranAt: new Date().toISOString(), retention, results });
}
