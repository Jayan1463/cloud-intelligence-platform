import { getFirebaseAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export function isDatabaseConfigured(): boolean {
  return isFirebaseAdminConfigured();
}

export function getDatabase() {
  return getFirebaseAdminDb();
}
