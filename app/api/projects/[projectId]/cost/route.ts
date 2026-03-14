import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
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
    projectId,
    monthly: [
      { month: "Jan", amount: 1100 },
      { month: "Feb", amount: 1250 },
      { month: "Mar", amount: 1380 }
    ],
    forecast: 1520
  });
}
