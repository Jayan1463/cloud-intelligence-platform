import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getPendingMemberRequests } from "@/lib/auth/member-store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  return NextResponse.json({ requests: getPendingMemberRequests() });
}
