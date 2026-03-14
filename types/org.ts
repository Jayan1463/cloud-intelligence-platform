import type { AppRole } from "./auth";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  ownerUid: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
};

export type OrganizationMember = {
  uid: string;
  email: string;
  role: AppRole;
  status: "active" | "invited";
  joinedAt?: string;
};

export type OrganizationInvite = {
  id: string;
  email: string;
  role: AppRole;
  invitedBy: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired";
};
