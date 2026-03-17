import { createHash, randomBytes } from "crypto";
import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";

function sha(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function createOrganizationApiKey(params: {
  organizationId: string;
  name: string;
  rateLimitPerMinute?: number;
}) {
  const db = getDatabase();
  const keyId = randomBytes(8).toString("hex");
  const secret = randomBytes(24).toString("hex");
  const key = `cip_${keyId}_${secret}`;
  await db.collection(COLLECTIONS.apiKeys).doc(keyId).set({
    id: keyId,
    organization_id: params.organizationId,
    name: params.name,
    key_hash: sha(key),
    rate_limit_per_minute: Math.max(10, params.rateLimitPerMinute ?? 120),
    created_at: new Date().toISOString(),
    revoked: false
  });
  return { id: keyId, key };
}

export async function listOrganizationApiKeys(organizationId: string) {
  const db = getDatabase();
  const snapshot = await db.collection(COLLECTIONS.apiKeys).where("organization_id", "==", organizationId).get();
  return snapshot.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return { id: d.id, name: String(data.name ?? ""), revoked: Boolean(data.revoked), rateLimitPerMinute: Number(data.rate_limit_per_minute ?? 120) };
  });
}

export async function authorizeApiKey(request: Request): Promise<{ organizationId: string; keyId: string } | null> {
  const presented = request.headers.get("x-api-key");
  if (!presented) return null;
  const db = getDatabase();
  const parts = presented.split("_");
  if (parts.length < 3) return null;
  const keyId = parts[1];
  const doc = await db.collection(COLLECTIONS.apiKeys).doc(keyId).get();
  if (!doc.exists) return null;
  const data = doc.data() as Record<string, unknown>;
  if (Boolean(data.revoked)) return null;
  if (String(data.key_hash ?? "") !== sha(presented)) return null;

  const bucket = `${keyId}:${new Date().toISOString().slice(0, 16)}`;
  const rateRef = db.collection(COLLECTIONS.rateLimits).doc(bucket);
  const rateSnap = await rateRef.get();
  const used = Number(rateSnap.data()?.count ?? 0);
  const limit = Number(data.rate_limit_per_minute ?? 120);
  if (used >= limit) return null;
  await rateRef.set({ key_id: keyId, count: used + 1, minute: bucket, updated_at: new Date().toISOString() }, { merge: true });
  return { organizationId: String(data.organization_id ?? ""), keyId };
}
