import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthenticatedRoleRequest, isAuthenticatedRequest } from "@/lib/auth/admin";

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
  const authenticated = isAuthenticatedRequest(request);
  const traceId = request.headers.get("x-trace-id") ?? crypto.randomUUID().replace(/-/g, "");

  if (pathname.startsWith("/workspace") && !authenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (requiresAdmin(pathname)) {
    const role = getAuthenticatedRoleRequest(request);
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/workspace/dashboard", request.url));
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-trace-id", traceId);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-trace-id", traceId);
  return response;
}

export const config = {
  matcher: [
    "/workspace/:path*"
  ]
};
