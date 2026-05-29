/**
 * Users repository — maps Firebase Auth UIDs to app-level role docs.
 *
 * The first user to sign up becomes ADMIN automatically (bootstrap).
 * Every subsequent user defaults to OWNER.
 */
import {
  getDocument,
  queryCollection,
  setDocument,
  updateDocument,
} from "../firebase/firestore-rest.server";
import {
  USERS_COLLECTION,
  userDocumentSchema,
  type AppRole,
  type UserDocument,
} from "./users.schemas";

export async function getUserDocument(uid: string): Promise<UserDocument | null> {
  const doc = await getDocument<UserDocument>(USERS_COLLECTION, uid);
  if (!doc) return null;
  const parsed = userDocumentSchema.safeParse({ ...doc.data, uid });
  return parsed.success ? parsed.data : null;
}

export async function ensureUserDocument(input: {
  uid: string;
  email: string | null;
}): Promise<UserDocument> {
  const existing = await getUserDocument(input.uid);
  if (existing) return existing;

  // Bootstrap: first ever user becomes ADMIN.
  const anyUsers = await queryCollection<UserDocument>(USERS_COLLECTION, { limit: 1 });
  const initialRole: AppRole = anyUsers.length === 0 ? "ADMIN" : "OWNER";

  const now = new Date().toISOString();
  const newDoc: UserDocument = {
    uid: input.uid,
    email: input.email,
    role: initialRole,
    ownerId: null,
    createdAt: now,
    updatedAt: now,
  };
  await setDocument(USERS_COLLECTION, input.uid, newDoc);
  return newDoc;
}

export async function getUserRole(uid: string): Promise<AppRole> {
  const doc = await getUserDocument(uid);
  return doc?.role ?? "OWNER";
}

export async function linkOwnerToUser(uid: string, ownerId: string): Promise<void> {
  await updateDocument<UserDocument>(USERS_COLLECTION, uid, {
    ownerId,
    updatedAt: new Date().toISOString(),
  });
}

export async function promoteUserToAdmin(uid: string): Promise<void> {
  await updateDocument<UserDocument>(USERS_COLLECTION, uid, {
    role: "ADMIN",
    updatedAt: new Date().toISOString(),
  });
}
