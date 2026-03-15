import { NextResponse } from "next/server";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, isValidAdminCredential } from "@/lib/auth/admin";
import { cookies } from "next/headers";
import { isMemberRequestPending, MEMBER_STORE_COOKIE, readMemberStore, validateApprovedMemberLogin } from "@/lib/auth/member-store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const cookieStore = await cookies();
  const memberStore = readMemberStore(cookieStore.get(MEMBER_STORE_COOKIE)?.value);

  let role: "admin" | "member" | null = null;
  if (isValidAdminCredential(email, password)) {
    role = "admin";
  } else if (validateApprovedMemberLogin(memberStore, email, password)) {
    role = "member";
  } else if (isMemberRequestPending(memberStore, email)) {
    return NextResponse.json({ error: "Approval pending. Wait for admin approval." }, { status: 403 });
  } else {
    return NextResponse.json({ error: "Invalid credentials. Check your email/password or create an account first." }, { status: 401 });
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
