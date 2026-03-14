export type AppRole = "admin" | "member";

export type AuthUser = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  defaultOrgId?: string;
};

export type SessionContext = {
  user: AuthUser | null;
  orgId?: string;
  projectId?: string;
  role?: AppRole;
};
