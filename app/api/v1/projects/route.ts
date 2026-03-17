import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { listProjectsByOrganization } from "@/lib/database/projects";
import { authorizeApiKey } from "@/lib/platform/auth/api-access";

export async function GET(request: Request) {
  const session = await getSessionContext();
  const apiAuth = await authorizeApiKey(request);
  const orgId = session.orgId ?? apiAuth?.organizationId;
  if ((!session.user && !apiAuth) || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await listProjectsByOrganization(orgId);
  return NextResponse.json({ projects });
}
