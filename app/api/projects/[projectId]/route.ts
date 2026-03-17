import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { getProjectForOrganization } from "@/lib/database/projects";
import { resolveOrganizationId } from "@/lib/database/organizations";

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
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
