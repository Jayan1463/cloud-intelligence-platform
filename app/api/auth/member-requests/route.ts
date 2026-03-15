import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getPendingMemberRequests, MEMBER_STORE_COOKIE, readMemberStore } from "@/lib/auth/member-store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const cookieStore = await cookies();
  const memberStore = readMemberStore(cookieStore.get(MEMBER_STORE_COOKIE)?.value);
  return NextResponse.json({ requests: getPendingMemberRequests(memberStore) });
}
