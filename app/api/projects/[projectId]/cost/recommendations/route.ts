import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { resolveOrganizationId } from "@/lib/database/organizations";
import { getProjectForOrganization } from "@/lib/database/projects";
import { getRecentMetrics } from "@/lib/database/metrics";
import { generateCostRecommendations } from "@/lib/cost/recommendations";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId } = await params;

  try {
    const orgId = await resolveOrganizationId(session.orgId, session.user.email);
    const project = await getProjectForOrganization(orgId, projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const metrics = await getRecentMetrics({ projectId, limit: 220 }).catch(() => []);
    const recommendations = generateCostRecommendations({ metrics, projectName: project.name });
    return NextResponse.json({ recommendations });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

