import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canEditProject } from "@/lib/auth/rbac";
import { resolveOrganizationId } from "@/lib/database/organizations";
import { createProject, listProjectsByOrganization } from "@/lib/database/projects";

export async function GET() {
  const session = await getSessionContext();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orgId = await resolveOrganizationId(session.orgId, session.user.email);
    const projects = await listProjectsByOrganization(orgId);
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canEditProject(session.role)) {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const environment = String(body.environment ?? body.env ?? "prod").trim() || "prod";
  const region = String(body.region ?? "us-east-1").trim() || "us-east-1";

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  try {
    const organizationId = await resolveOrganizationId(session.orgId, session.user.email);
    const project = await createProject({ organizationId, name, environment, region });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
