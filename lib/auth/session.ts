import type { SessionContext } from "@/types/auth";
import { getAuthenticatedEmail, getAuthenticatedRole } from "@/lib/auth/admin";

export async function getSessionContext(): Promise<SessionContext> {
  const role = await getAuthenticatedRole();
  const email = await getAuthenticatedEmail();
  if (!role || !email) {
    return { user: null };
  }

  return {
    user: { uid: email.replace(/[^a-z0-9]/gi, "_"), email },
    orgId: "demo-org",
    role
  };
}
