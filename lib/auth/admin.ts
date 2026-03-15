import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const ADMIN_EMAIL = "admin@test.com";
export const ADMIN_PASSWORD = "123456";
export const ADMIN_AUTH_COOKIE = "cip_admin_auth";

export function isValidAdminCredential(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_AUTH_COOKIE)?.value === "1";
}

export function isAdminAuthenticatedRequest(request: NextRequest): boolean {
  return request.cookies.get(ADMIN_AUTH_COOKIE)?.value === "1";
}
