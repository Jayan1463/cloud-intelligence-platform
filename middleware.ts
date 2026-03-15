import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/auth/admin";

function requiresAdmin(pathname: string): boolean {
  return pathname.startsWith("/workspace/settings/organization")
    || pathname.startsWith("/workspace/settings/members")
    || pathname.startsWith("/workspace/settings/profile")
    || pathname.startsWith("/workspace/settings/plan")
    || pathname.startsWith("/workspace/settings/security")
    || pathname.startsWith("/workspace/settings/integrations")
    || pathname.startsWith("/workspace/settings/danger");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!requiresAdmin(pathname)) {
    return NextResponse.next();
  }

  if (isAdminAuthenticatedRequest(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/auth/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/workspace/settings/organization/:path*",
    "/workspace/settings/members/:path*",
    "/workspace/settings/profile/:path*",
    "/workspace/settings/plan/:path*",
    "/workspace/settings/security/:path*",
    "/workspace/settings/integrations/:path*",
    "/workspace/settings/danger/:path*"
  ]
};
