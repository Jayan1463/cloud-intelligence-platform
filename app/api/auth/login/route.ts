import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, isValidAdminCredential } from "@/lib/auth/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!isValidAdminCredential(email, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, email });
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return response;
}
