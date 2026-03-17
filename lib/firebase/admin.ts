import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";

function normalizePrivateKey(value: string | undefined): string | undefined {
  return value?.replace(/\\n/g, "\n");
}

function canInitWithServiceAccount(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
  );
}

function canInitWithAppDefault(): boolean {
  return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

function canInitWithEmulator(): boolean {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST);
}

export function isFirebaseAdminConfigured(): boolean {
  return canInitWithServiceAccount() || canInitWithAppDefault() || canInitWithEmulator();
}

let cachedDb: Firestore | null = null;

export function getFirebaseAdminDb(): Firestore {
  if (cachedDb) return cachedDb;

  if (!getApps().length) {
    if (canInitWithEmulator()) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? "demo-cloud-intelligence" });
    } else if (canInitWithServiceAccount()) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
        })
      });
    } else if (canInitWithAppDefault()) {
      initializeApp({ credential: applicationDefault() });
    } else {
      throw new Error(
        "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (or GOOGLE_APPLICATION_CREDENTIALS)."
      );
    }
  }

  cachedDb = getFirestore();
  return cachedDb;
}

export function requireServerAuthHeader(authHeader: string | null): { uid: string } {
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  const uid = authHeader.replace("Bearer", "").trim();
  if (!uid) {
    throw new Error("Invalid authorization header");
  }

  return { uid };
}
