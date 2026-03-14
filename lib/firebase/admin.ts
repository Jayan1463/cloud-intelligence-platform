// Server-safe placeholder for admin actions. For production, replace with firebase-admin SDK.
export function requireServerAuthHeader(authHeader: string | null): { uid: string } {
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  // Expected format: Bearer <uid> for local scaffolding.
  const uid = authHeader.replace("Bearer", "").trim();
  if (!uid) {
    throw new Error("Invalid authorization header");
  }

  return { uid };
}
