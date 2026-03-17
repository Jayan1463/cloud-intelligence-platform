import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/platform/auth/password";
import { upsertUser, getUserByEmail } from "@/lib/database/users";
import { resolveOrganizationId } from "@/lib/database/organizations";
import { signSessionToken } from "@/lib/platform/auth/jwt";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/auth/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const organization = String(body.organization ?? body.org ?? "").trim() || "demo-org";

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Email and password (min 8 chars) are required" }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing && existing.password_hash) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const orgId = await resolveOrganizationId(organization, email);
  const passwordHash = await hashPassword(password);
  const role = existing?.role ?? "admin";

  const user = await upsertUser({
    email,
    name: name || email.split("@")[0],
    orgId,
    role,
    passwordHash,
    status: "active"
  });

  const token = signSessionToken({ sub: user.id, email: user.email, orgId, role: user.role, type: "session" });

  const response = NextResponse.json({ ok: true, email: user.email, role: user.role, orgId });
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set({ name: AUTH_TOKEN_COOKIE, value: token, httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 12 });
  response.cookies.set({ name: AUTH_ROLE_COOKIE, value: user.role, httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 12 });
  response.cookies.set({ name: AUTH_EMAIL_COOKIE, value: user.email, httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 12 });

  return response;
}
