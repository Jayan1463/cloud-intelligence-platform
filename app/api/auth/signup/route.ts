import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createMemberAccessRequest,
  ensureMemberStoreCookieOptions,
  MEMBER_STORE_COOKIE,
  readMemberStore,
  serializeMemberStore
} from "@/lib/auth/member-store";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const memberStore = readMemberStore(cookieStore.get(MEMBER_STORE_COOKIE)?.value);
  const body = await request.json().catch(() => ({}));
  const result = createMemberAccessRequest(memberStore, {
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    password: String(body.password ?? "")
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, message: "Request submitted. Wait for admin approval." });
  response.cookies.set({
    name: MEMBER_STORE_COOKIE,
    value: serializeMemberStore(result.store),
    ...ensureMemberStoreCookieOptions()
  });
  return response;
}
