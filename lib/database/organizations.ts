import { getDatabase } from "@/lib/database/client";
import { COLLECTIONS } from "@/lib/platform/db/collections";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "default-org";
}

export async function resolveOrganizationId(orgHint: string | undefined, ownerEmail: string | undefined): Promise<string> {
  const db = getDatabase();
  const hint = String(orgHint ?? "demo-org").trim();
  const orgId = UUID_RE.test(hint) ? hint : slugify(hint);

  const orgRef = db.collection(COLLECTIONS.organizations).doc(orgId);
  const snapshot = await orgRef.get();
  const now = new Date().toISOString();

  if (!snapshot.exists) {
    await orgRef.set({
      id: orgId,
      name: hint === "demo-org" ? "QuantumOps" : hint,
      slug: slugify(hint),
      plan: "pro",
      created_at: now,
      updated_at: now
    });
  } else if (hint === "demo-org") {
    const current = snapshot.data() as { name?: string } | undefined;
    if (current?.name === "Cloud Organization" || current?.name === "Acme Cloud Ops") {
      await orgRef.set(
        {
          name: "QuantumOps",
          updated_at: now
        },
        { merge: true }
      );
    }
  }

  if (ownerEmail) {
    const userId = ownerEmail.toLowerCase();
    await db.collection(COLLECTIONS.users).doc(userId).set(
      {
        organization_id: orgId,
        email: ownerEmail.toLowerCase(),
        role: "admin",
        created_at: now,
        updated_at: now
      },
      { merge: true }
    );
  }

  return orgId;
}

export async function getOrganizationBySlug(slug: string) {
  const db = getDatabase();
  const snapshot = await db.collection(COLLECTIONS.organizations).where("slug", "==", slug).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0].data();
}
