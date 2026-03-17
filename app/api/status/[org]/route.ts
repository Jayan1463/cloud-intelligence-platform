import { NextResponse } from "next/server";
import { getOrganizationBySlug } from "@/lib/database/organizations";
import { listProjectsByOrganization } from "@/lib/database/projects";
import { listAlerts } from "@/lib/database/alerts";

export async function GET(_: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const organization = await getOrganizationBySlug(org);
  if (!organization) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const projects = await listProjectsByOrganization(String(organization.id));
  const allAlerts = await Promise.all(projects.map((p) => listAlerts(p.id, 20)));
  const alerts = allAlerts.flat();
  const openIncidents = alerts.filter((a) => a.status !== "resolved").length;

  return NextResponse.json({
    organization: { id: organization.id, name: organization.name, slug: organization.slug },
    health: openIncidents > 0 ? "degraded" : "operational",
    uptime: openIncidents > 0 ? 99.3 : 99.99,
    openIncidents,
    incidents: alerts.slice(0, 20)
  });
}
