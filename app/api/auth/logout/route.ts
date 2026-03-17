import { NextResponse } from "next/server";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/auth/admin";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  for (const name of [AUTH_TOKEN_COOKIE, AUTH_ROLE_COOKIE, AUTH_EMAIL_COOKIE]) {
    response.cookies.set({ name, value: "", path: "/", expires: new Date(0) });
  }
  return response;
}
