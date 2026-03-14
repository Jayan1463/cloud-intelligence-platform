import type { SessionContext } from "@/types/auth";

export function ensureOrgAccess(session: SessionContext, orgId: string): void {
  if (!session.user) {
    throw new Error("Unauthorized");
  }

  if (!session.orgId || session.orgId !== orgId) {
    throw new Error("Forbidden organization access");
  }
}

export function ensureProjectAccess(session: SessionContext, projectId: string): void {
  if (!session.user) {
    throw new Error("Unauthorized");
  }

  if (!session.projectId || session.projectId !== projectId) {
    throw new Error("Forbidden project access");
  }
}
