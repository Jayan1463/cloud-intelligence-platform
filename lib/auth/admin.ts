import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { AppRole } from "@/types/auth";
import { verifySessionToken } from "@/lib/platform/auth/jwt";

export const AUTH_ROLE_COOKIE = "cip_auth_role";
export const AUTH_EMAIL_COOKIE = "cip_auth_email";
export const AUTH_TOKEN_COOKIE = "cip_auth_token";

function normalizeRole(role: string | undefined | null): AppRole | null {
  if (role === "admin" || role === "developer" || role === "viewer") return role;
  if (role === "member") return "developer";
  return null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const role = await getAuthenticatedRole();
  return role === "admin";
}

export function isAdminAuthenticatedRequest(request: NextRequest): boolean {
  const role = getAuthenticatedRoleRequest(request);
  return role === "admin";
}

export async function getAuthenticatedRole(): Promise<AppRole | null> {
  const store = await cookies();
  const token = store.get(AUTH_TOKEN_COOKIE)?.value;
  if (token) {
    try {
      return normalizeRole(verifySessionToken(token).role);
    } catch {
      return null;
    }
  }

  return normalizeRole(store.get(AUTH_ROLE_COOKIE)?.value);
}

export async function getAuthenticatedEmail(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(AUTH_TOKEN_COOKIE)?.value;
  if (token) {
    try {
      return verifySessionToken(token).email;
    } catch {
      return null;
    }
  }
  return store.get(AUTH_EMAIL_COOKIE)?.value ?? null;
}

export function getAuthenticatedRoleRequest(request: NextRequest): AppRole | null {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  if (token) {
    try {
      return normalizeRole(verifySessionToken(token).role);
    } catch {
      // Middleware can run in environments where token verification may fail.
      // Fall back to the role cookie to avoid false unauthenticated redirects.
    }
  }

  return normalizeRole(request.cookies.get(AUTH_ROLE_COOKIE)?.value);
}

export function isAuthenticatedRequest(request: NextRequest): boolean {
  return getAuthenticatedRoleRequest(request) !== null;
}
