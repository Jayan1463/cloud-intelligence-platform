import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { ensureProjectAccess } from "@/lib/org/access";
import { getRecentMetrics } from "@/lib/database/metrics";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSessionContext();
  const { projectId } = await params;

  try {
    ensureProjectAccess(session, projectId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  const metrics = await getRecentMetrics({ projectId, limit: 300 });
  return NextResponse.json({ metrics });
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const body = await request.json().catch(() => ({}));

  const res = await fetch(new URL("/api/metrics", request.url), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...body, projectId })
  });

  const payload = await res.json().catch(() => ({}));
  return NextResponse.json(payload, { status: res.status });
}
