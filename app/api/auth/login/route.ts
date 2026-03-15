import { NextResponse } from "next/server";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, isValidAdminCredential } from "@/lib/auth/admin";
import { isMemberRequestPending, validateApprovedMemberLogin } from "@/lib/auth/member-store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  let role: "admin" | "member" | null = null;
  if (isValidAdminCredential(email, password)) {
    role = "admin";
  } else if (validateApprovedMemberLogin(email, password)) {
    role = "member";
  } else if (isMemberRequestPending(email)) {
    return NextResponse.json({ error: "Approval pending. Wait for admin approval." }, { status: 403 });
  } else {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, email, role });
  response.cookies.set({
    name: AUTH_ROLE_COOKIE,
    value: role,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  response.cookies.set({
    name: AUTH_EMAIL_COOKIE,
    value: email,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return response;
}
