import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { AppRole } from "@/types/auth";

export const ADMIN_EMAIL = "admin@test.com";
export const ADMIN_PASSWORD = "123456";
export const AUTH_ROLE_COOKIE = "cip_auth_role";
export const AUTH_EMAIL_COOKIE = "cip_auth_email";

export function isValidAdminCredential(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(AUTH_ROLE_COOKIE)?.value === "admin";
}

export function isAdminAuthenticatedRequest(request: NextRequest): boolean {
  return request.cookies.get(AUTH_ROLE_COOKIE)?.value === "admin";
}

export async function getAuthenticatedRole(): Promise<AppRole | null> {
  const store = await cookies();
  const role = store.get(AUTH_ROLE_COOKIE)?.value;
  return role === "admin" || role === "member" ? role : null;
}

export async function getAuthenticatedEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_EMAIL_COOKIE)?.value ?? null;
}

export function getAuthenticatedRoleRequest(request: NextRequest): AppRole | null {
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;
  return role === "admin" || role === "member" ? role : null;
}

export function isAuthenticatedRequest(request: NextRequest): boolean {
  return getAuthenticatedRoleRequest(request) !== null;
}
