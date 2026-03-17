import { randomUUID } from "crypto";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";

export async function createDeployment(input: {
  orgId: string;
  projectId: string;
  version: string;
  environment: string;
  deployedBy: string;
  notes?: string;
}) {
  const db = getDatabase();
  const id = randomUUID();
  const timestamp = new Date().toISOString();

  await db.collection(COLLECTIONS.deployments).doc(id).set({
    id,
    organization_id: input.orgId,
    project_id: input.projectId,
    version: input.version,
    environment: input.environment,
    deployed_by: input.deployedBy,
    notes: input.notes ?? "",
    deployed_at: timestamp,
    created_at: timestamp
  });

  return { id, deployed_at: timestamp };
}

export async function listDeployments(projectId: string, limit = 100) {
  const db = getDatabase();
  const snapshot = await db
    .collection(COLLECTIONS.deployments)
    .where("project_id", "==", projectId)
    .orderBy("deployed_at", "desc")
    .limit(Math.max(1, Math.min(limit, 200)))
    .get();

  return snapshot.docs.map((doc) => doc.data());
}
