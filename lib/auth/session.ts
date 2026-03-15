import { headers } from "next/headers";
import type { SessionContext } from "@/types/auth";
import { requireServerAuthHeader } from "@/lib/firebase/admin";
import { isAdminAuthenticated } from "@/lib/auth/admin";

export async function getSessionContext(): Promise<SessionContext> {
  const adminAuthed = await isAdminAuthenticated();
  if (adminAuthed) {
    return {
      user: { uid: "admin_user", email: "admin@test.com" },
      orgId: "demo-org",
      role: "admin"
    };
  }

  const h = await headers();
  const authHeader = h.get("authorization");

  if (!authHeader) {
    return { user: null };
  }

  try {
    const { uid } = requireServerAuthHeader(authHeader);
    const orgId = h.get("x-org-id") ?? undefined;
    const projectId = h.get("x-project-id") ?? undefined;
    const roleHeader = h.get("x-role");
    const role = roleHeader === "admin" || roleHeader === "member" ? roleHeader : undefined;

    return {
      user: { uid, email: `${uid}@example.com` },
      orgId,
      projectId,
      role
    };
  } catch {
    return { user: null };
  }
}
