import jwt from "jsonwebtoken";
import type { AppRole } from "@/types/auth";

export type AuthTokenClaims = {
  sub: string;
  email: string;
  orgId: string;
  role: AppRole;
  type: "session";
};

const AUTH_SECRET = process.env.AUTH_JWT_SECRET ?? "dev-secret-change-me";
const EXPIRY = process.env.AUTH_JWT_EXPIRES_IN ?? "12h";

export function signSessionToken(claims: AuthTokenClaims): string {
  return (jwt.sign as unknown as (payload: object, secret: string, options: { expiresIn: string }) => string)(
    claims,
    AUTH_SECRET,
    { expiresIn: EXPIRY }
  );
}

export function verifySessionToken(token: string): AuthTokenClaims {
  return jwt.verify(token, AUTH_SECRET) as AuthTokenClaims;
}
