import { randomBytes, randomUUID } from "crypto";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";
import { getProjectById } from "@/lib/database/projects";
import type { DatabaseServer } from "@/lib/database/types";

export type CreateServerInput = {
  projectId: string;
  name: string;
  ipAddress: string;
};

function makeAgentKey(): string {
  return randomBytes(24).toString("hex");
}

function toServer(id: string, data: Record<string, unknown>): DatabaseServer {
  return {
    id,
    organization_id: String(data.organization_id ?? ""),
    project_id: String(data.project_id ?? ""),
    name: String(data.name ?? ""),
    ip_address: String(data.ip_address ?? ""),
    agent_key: String(data.agent_key ?? ""),
    status: (String(data.status ?? "healthy") as DatabaseServer["status"]),
    discovered_services: Array.isArray(data.discovered_services)
      ? data.discovered_services.map((s) => String(s))
      : [],
    last_metric_at: data.last_metric_at ? String(data.last_metric_at) : undefined,
    created_at: String(data.created_at ?? new Date().toISOString()),
    updated_at: String(data.updated_at ?? new Date().toISOString())
  };
}

export async function registerServer(input: CreateServerInput): Promise<DatabaseServer> {
  const db = getDatabase();
  const project = await getProjectById(input.projectId);
  if (!project) throw new Error("Project not found");

  const id = randomUUID();
  const now = new Date().toISOString();
  const payload = {
    id,
    organization_id: project.organization_id,
    project_id: input.projectId,
    name: input.name,
    ip_address: input.ipAddress,
    agent_key: makeAgentKey(),
    status: "healthy",
    discovered_services: ["web", "api", "db"],
    created_at: now,
    updated_at: now
  };
  await db.collection(COLLECTIONS.servers).doc(id).set(payload);
  return toServer(id, payload);
}

export async function listServers(projectId?: string): Promise<DatabaseServer[]> {
  const db = getDatabase();
  const query = projectId
    ? db.collection(COLLECTIONS.servers).where("project_id", "==", projectId)
    : db.collection(COLLECTIONS.servers);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => toServer(doc.id, doc.data()));
}

export async function getServerById(serverId: string): Promise<DatabaseServer | null> {
  const db = getDatabase();
  const doc = await db.collection(COLLECTIONS.servers).doc(serverId).get();
  if (!doc.exists) return null;
  return toServer(doc.id, doc.data() as Record<string, unknown>);
}

export async function getServerByAgentKey(agentKey: string): Promise<DatabaseServer | null> {
  const db = getDatabase();
  const snapshot = await db.collection(COLLECTIONS.servers).where("agent_key", "==", agentKey).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return toServer(doc.id, doc.data() as Record<string, unknown>);
}

export async function updateServerStatus(serverId: string, status: DatabaseServer["status"]): Promise<void> {
  const db = getDatabase();
  await db.collection(COLLECTIONS.servers).doc(serverId).set(
    { status, last_metric_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { merge: true }
  );
}
