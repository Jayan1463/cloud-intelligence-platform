import type { SessionContext } from "@/types/auth";
import { getAuthenticatedEmail, getAuthenticatedRole } from "@/lib/auth/admin";
import { getUserByEmail } from "@/lib/database/users";

export async function getSessionContext(): Promise<SessionContext> {
  const role = await getAuthenticatedRole();
  const email = await getAuthenticatedEmail();
  if (!role || !email) {
    return { user: null };
  }

  try {
    const user = await getUserByEmail(email);
    const orgId = user?.organization_id ?? "demo-org";

    return {
      user: { uid: user?.id ?? email.replace(/[^a-z0-9]/gi, "_"), email },
      orgId,
      role
    };
  } catch {
    return {
      user: { uid: email.replace(/[^a-z0-9]/gi, "_"), email },
      orgId: "demo-org",
      role
    };
  }
}
