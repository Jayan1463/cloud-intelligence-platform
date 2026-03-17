import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { getRecentMetrics } from "@/lib/database/metrics";
import { searchLogs } from "@/lib/platform/services/logs";

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const kind = String(body.kind ?? "").toLowerCase();
  const projectId = body.projectId ? String(body.projectId) : undefined;
  const serverId = body.serverId ? String(body.serverId) : undefined;
  const from = body.from ? String(body.from) : undefined;
  const to = body.to ? String(body.to) : undefined;

  if (kind === "metrics") {
    const field = String(body.field ?? "cpu") as "cpu" | "memory" | "disk" | "network";
    const op = String(body.op ?? "raw");
    let rows = await getRecentMetrics({ projectId, serverId, limit: Number(body.limit ?? 500) });
    if (from) rows = rows.filter((row) => row.timestamp >= from);
    if (to) rows = rows.filter((row) => row.timestamp <= to);
    const values = rows.map((row) => Number(row[field]));
    if (op === "avg") return NextResponse.json({ result: avg(values), points: rows.length, field, op });
    if (op === "max") return NextResponse.json({ result: values.length ? Math.max(...values) : 0, points: rows.length, field, op });
    if (op === "min") return NextResponse.json({ result: values.length ? Math.min(...values) : 0, points: rows.length, field, op });
    return NextResponse.json({ rows, points: rows.length, field, op: "raw" });
  }

  if (kind === "logs") {
    const logs = await searchLogs({
      projectId,
      serverId,
      level: body.level ? String(body.level) : undefined,
      q: body.q ? String(body.q) : undefined,
      limit: Number(body.limit ?? 300)
    });
    const filtered = logs.filter((log) => {
      const ts = String(log.timestamp ?? "");
      if (from && ts < from) return false;
      if (to && ts > to) return false;
      return true;
    });
    return NextResponse.json({ rows: filtered, count: filtered.length });
  }

  return NextResponse.json({ error: "Unsupported query kind. Use 'metrics' or 'logs'." }, { status: 400 });
}
