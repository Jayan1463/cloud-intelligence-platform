import type { AppRole } from "@/types/auth";

export function canManageOrganization(role?: AppRole): boolean {
  return role === "admin";
}

export function canEditProject(role?: AppRole): boolean {
  return role === "admin";
}

export function canViewProject(role?: AppRole): boolean {
  return role === "admin" || role === "member";
}
