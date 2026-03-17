import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { listAuditLogs } from "@/lib/platform/services/audit";

export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session.user || !session.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageOrganization(session.role)) return NextResponse.json({ error: "Admin role required" }, { status: 403 });

  const limit = Number(new URL(request.url).searchParams.get("limit") ?? "200");
  const logs = await listAuditLogs(session.orgId, limit);
  return NextResponse.json({ logs });
}
