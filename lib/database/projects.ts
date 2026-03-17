import { randomUUID } from "crypto";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";
import type { DatabaseProject } from "@/lib/database/types";

function toProject(id: string, data: Record<string, unknown>): DatabaseProject {
  return {
    id,
    organization_id: String(data.organization_id ?? ""),
    name: String(data.name ?? ""),
    environment: String(data.environment ?? "prod"),
    region: String(data.region ?? "us-east-1"),
    created_at: String(data.created_at ?? new Date().toISOString()),
    updated_at: String(data.updated_at ?? new Date().toISOString())
  };
}

export async function listProjectsByOrganization(orgId: string): Promise<DatabaseProject[]> {
  const db = getDatabase();
  const snapshot = await db.collection(COLLECTIONS.projects).where("organization_id", "==", orgId).get();
  return snapshot.docs.map((doc) => toProject(doc.id, doc.data()));
}

export async function getProjectById(projectId: string): Promise<DatabaseProject | null> {
  const db = getDatabase();
  const doc = await db.collection(COLLECTIONS.projects).doc(projectId).get();
  if (!doc.exists) return null;
  return toProject(doc.id, doc.data() as Record<string, unknown>);
}

export async function getProjectForOrganization(orgId: string, projectId: string): Promise<DatabaseProject | null> {
  const project = await getProjectById(projectId);
  if (!project || project.organization_id !== orgId) return null;
  return project;
}

export async function createProject(input: {
  organizationId: string;
  name: string;
  environment: string;
  region: string;
}): Promise<DatabaseProject> {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = randomUUID();
  const payload = {
    id,
    organization_id: input.organizationId,
    name: input.name,
    environment: input.environment,
    region: input.region,
    created_at: now,
    updated_at: now
  };
  await db.collection(COLLECTIONS.projects).doc(id).set(payload);
  return toProject(id, payload);
}
