import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { validateMetricPayload } from "@/lib/metrics/ingestion";
import { ensureProjectAccess } from "@/lib/org/access";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSessionContext();
  const { projectId } = await params;

  try {
    ensureProjectAccess(session, projectId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  return NextResponse.json({
    metrics: Array.from({ length: 10 }, (_, i) => ({
      id: `m_${i}`,
      projectId,
      ts: new Date(Date.now() - i * 60000).toISOString(),
      cpu: 30 + i,
      memory: 40 + i,
      networkIn: 12 + i,
      networkOut: 10 + i
    }))
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSessionContext();
  const { projectId } = await params;

  try {
    ensureProjectAccess(session, projectId);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  const body = await request.json();
  const payload = { ...body, projectId };

  if (!validateMetricPayload(payload)) {
    return NextResponse.json({ error: "Invalid metric payload" }, { status: 400 });
  }

  return NextResponse.json({ metric: { id: `m_${Date.now()}`, ...payload } }, { status: 201 });
}
