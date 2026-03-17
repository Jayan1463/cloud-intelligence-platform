import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/platform/auth/password";
import { getUserByEmail } from "@/lib/database/users";
import { signSessionToken } from "@/lib/platform/auth/jwt";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/auth/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user || !user.password_hash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signSessionToken({
    sub: user.id,
    email: user.email,
    orgId: user.organization_id,
    role: user.role,
    type: "session"
  });

  const secure = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ ok: true, email: user.email, role: user.role, orgId: user.organization_id });

  response.cookies.set({ name: AUTH_TOKEN_COOKIE, value: token, httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 12 });
  response.cookies.set({ name: AUTH_ROLE_COOKIE, value: user.role, httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 12 });
  response.cookies.set({ name: AUTH_EMAIL_COOKIE, value: user.email, httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 12 });

  return response;
}
