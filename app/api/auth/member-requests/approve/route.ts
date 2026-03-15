import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import {
  approveMemberRequest,
  ensureMemberStoreCookieOptions,
  MEMBER_STORE_COOKIE,
  readMemberStore,
  serializeMemberStore
} from "@/lib/auth/member-store";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const cookieStore = await cookies();
  const memberStore = readMemberStore(cookieStore.get(MEMBER_STORE_COOKIE)?.value);
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "");
  const result = approveMemberRequest(memberStore, email);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, email: result.approvedEmail });
  response.cookies.set({
    name: MEMBER_STORE_COOKIE,
    value: serializeMemberStore(result.store),
    ...ensureMemberStoreCookieOptions()
  });
  return response;
}
