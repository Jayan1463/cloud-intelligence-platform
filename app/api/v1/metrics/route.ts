import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { getRecentMetrics } from "@/lib/database/metrics";
import { authorizeApiKey } from "@/lib/platform/auth/api-access";

export async function GET(request: Request) {
  const session = await getSessionContext();
  const apiAuth = await authorizeApiKey(request);
  if (!session.user && !apiAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const serverId = url.searchParams.get("serverId") ?? undefined;

  const metrics = await getRecentMetrics({ projectId, serverId, limit: 300 });
  return NextResponse.json({ metrics });
}
