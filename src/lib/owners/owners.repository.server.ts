import {
  createDocument,
  deleteDocument,
  getDocument,
  queryCollection,
  updateDocument,
} from "../firebase/firestore-rest.server";
import {
  OWNERS_COLLECTION,
  type OwnerCreateInput,
  type OwnerDocument,
  type OwnerUpdateInput,
} from "./owners.schemas";

export async function createOwner(
  input: OwnerCreateInput & { userUid?: string | null },
): Promise<OwnerDocument> {
  const now = new Date().toISOString();
  const doc = await createDocument<Omit<OwnerDocument, "id">>(OWNERS_COLLECTION, {
    ...input,
    userUid: input.userUid ?? null,
    createdAt: now,
    updatedAt: now,
  });
  return { ...(doc.data as Omit<OwnerDocument, "id">), id: doc.id };
}

export async function findOwnerById(id: string): Promise<OwnerDocument | null> {
  const doc = await getDocument<Omit<OwnerDocument, "id">>(OWNERS_COLLECTION, id);
  if (!doc) return null;
  return { ...doc.data, id: doc.id };
}

export async function findOwnerByUserUid(uid: string): Promise<OwnerDocument | null> {
  const rows = await queryCollection<Omit<OwnerDocument, "id">>(OWNERS_COLLECTION, {
    where: [{ field: "userUid", op: "EQUAL", value: uid }],
    limit: 1,
  });
  if (!rows.length) return null;
  return { ...rows[0].data, id: rows[0].id };
}

export async function listOwners(): Promise<OwnerDocument[]> {
  const rows = await queryCollection<Omit<OwnerDocument, "id">>(OWNERS_COLLECTION, {
    orderBy: [{ field: "lastName", direction: "ASCENDING" }],
    limit: 500,
  });
  return rows.map((r) => ({ ...r.data, id: r.id }));
}

export async function updateOwner(id: string, patch: OwnerUpdateInput): Promise<void> {
  await updateDocument(OWNERS_COLLECTION, id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteOwner(id: string): Promise<void> {
  await deleteDocument(OWNERS_COLLECTION, id);
}
