import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { searchLogs } from "@/lib/platform/services/logs";
import { authorizeApiKey } from "@/lib/platform/auth/api-access";

export async function GET(request: Request) {
  const session = await getSessionContext();
  const apiAuth = await authorizeApiKey(request);
  if (!session.user && !apiAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const logs = await searchLogs({
    projectId: url.searchParams.get("projectId") ?? undefined,
    serverId: url.searchParams.get("serverId") ?? undefined,
    level: url.searchParams.get("level") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    limit: Number(url.searchParams.get("limit") ?? "200")
  });

  return NextResponse.json({ logs });
}
