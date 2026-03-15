import { NextResponse } from "next/server";
import { createMemberAccessRequest } from "@/lib/auth/member-store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = createMemberAccessRequest({
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    password: String(body.password ?? "")
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: "Request submitted. Wait for admin approval." });
}
