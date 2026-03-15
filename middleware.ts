import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/auth/admin";

function requiresAdmin(pathname: string): boolean {
  return pathname.startsWith("/workspace");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAdminAuthenticatedRequest(request);

  if (pathname === "/auth/login" && authenticated) {
    return NextResponse.redirect(new URL("/workspace/dashboard", request.url));
  }

  if (!requiresAdmin(pathname)) {
    return NextResponse.next();
  }

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/auth/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/workspace/:path*",
    "/auth/login"
  ]
};
