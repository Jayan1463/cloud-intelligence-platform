import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { canManageOrganization } from "@/lib/auth/rbac";
import { applyRetentionPolicies, downsampleOldMetrics } from "@/lib/platform/retention/jobs";

export async function POST() {
  const session = await getSessionContext();
  if (!session.user || !canManageOrganization(session.role)) {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }
  const [retention, downsample] = await Promise.all([
    applyRetentionPolicies(),
    downsampleOldMetrics()
  ]);
  return NextResponse.json({ retention, downsample, optimizedAt: new Date().toISOString() });
}
