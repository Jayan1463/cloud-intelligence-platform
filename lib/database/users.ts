import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";
import type { DatabaseUser } from "@/lib/database/types";

function toUser(id: string, data: Record<string, unknown>): DatabaseUser & { status?: "active" | "invited" } {
  const role = String(data.role ?? "viewer");
  return {
    id,
    name: String(data.name ?? ""),
    email: String(data.email ?? id),
    password_hash: data.password_hash ? String(data.password_hash) : undefined,
    role: role === "admin" || role === "developer" || role === "viewer" ? role : "viewer",
    organization_id: String(data.organization_id ?? ""),
    created_at: String(data.created_at ?? new Date().toISOString()),
    updated_at: String(data.updated_at ?? new Date().toISOString()),
    status: data.status === "invited" ? "invited" : "active"
  };
}

export async function listUsersByOrganization(orgId: string): Promise<(DatabaseUser & { status?: "active" | "invited" })[]> {
  const db = getDatabase();
  const snapshot = await db.collection(COLLECTIONS.users).where("organization_id", "==", orgId).get();
  return snapshot.docs.map((doc) => toUser(doc.id, doc.data()));
}

export async function getUserByEmail(email: string): Promise<(DatabaseUser & { status?: "active" | "invited" }) | null> {
  const db = getDatabase();
  const id = email.trim().toLowerCase();
  if (!id) return null;
  const doc = await db.collection(COLLECTIONS.users).doc(id).get();
  if (!doc.exists) return null;
  return toUser(doc.id, doc.data() as Record<string, unknown>);
}

export async function upsertUser(input: {
  email: string;
  name: string;
  orgId: string;
  role: "admin" | "developer" | "viewer";
  passwordHash?: string;
  status?: "active" | "invited";
}): Promise<DatabaseUser & { status?: "active" | "invited" }> {
  const db = getDatabase();
  const now = new Date().toISOString();
  const email = input.email.trim().toLowerCase();
  const ref = db.collection(COLLECTIONS.users).doc(email);
  const existing = await ref.get();
  const existingData = existing.exists ? (existing.data() as Record<string, unknown>) : {};

  const payload: Record<string, unknown> = {
    name: input.name,
    email,
    role: input.role,
    organization_id: input.orgId,
    status: input.status ?? "active",
    created_at: existingData.created_at ?? now,
    updated_at: now
  };

  if (input.passwordHash) payload.password_hash = input.passwordHash;

  await ref.set(payload, { merge: true });
  return toUser(email, { ...existingData, ...payload });
}

export async function inviteUserToOrganization(params: {
  orgId: string;
  email: string;
  role: "admin" | "developer" | "viewer";
  invitedBy: string;
}): Promise<DatabaseUser & { status?: "active" | "invited" }> {
  const invited = await upsertUser({
    email: params.email,
    name: "",
    orgId: params.orgId,
    role: params.role,
    status: "invited"
  });

  const db = getDatabase();
  await db.collection(COLLECTIONS.auditLogs).add({
    organization_id: params.orgId,
    actor_email: params.invitedBy,
    action: "org.user.invited",
    entity_type: "user",
    entity_id: invited.email,
    created_at: new Date().toISOString()
  });

  return invited;
}

export async function updateOrganizationUserRole(params: {
  orgId: string;
  email: string;
  role: "admin" | "developer" | "viewer";
}): Promise<DatabaseUser & { status?: "active" | "invited" }> {
  const user = await getUserByEmail(params.email);
  if (!user) throw new Error("User not found");
  if (user.organization_id !== params.orgId) throw new Error("User not in organization");

  return upsertUser({
    email: user.email,
    name: user.name,
    orgId: user.organization_id,
    role: params.role,
    passwordHash: user.password_hash,
    status: user.status
  });
}

export async function removeUserFromOrganization(params: { orgId: string; email: string }): Promise<{ removed: boolean }> {
  const db = getDatabase();
  const id = params.email.trim().toLowerCase();
  const ref = db.collection(COLLECTIONS.users).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return { removed: false };
  const data = doc.data() as Record<string, unknown>;
  if (String(data.organization_id ?? "") !== params.orgId) {
    throw new Error("User not in organization");
  }
  await ref.delete();
  return { removed: true };
}
