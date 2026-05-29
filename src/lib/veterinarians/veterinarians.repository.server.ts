import {
  createDocument,
  deleteDocument,
  getDocument,
  queryCollection,
  updateDocument,
} from "../firebase/firestore-rest.server";
import {
  VETS_COLLECTION,
  type VetCreateInput,
  type VetDocument,
  type VetUpdateInput,
} from "./veterinarians.schemas";

export async function createVet(input: VetCreateInput): Promise<VetDocument> {
  const now = new Date().toISOString();
  const doc = await createDocument<Omit<VetDocument, "id">>(VETS_COLLECTION, {
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  return { ...(doc.data as Omit<VetDocument, "id">), id: doc.id };
}

export async function findVetById(id: string): Promise<VetDocument | null> {
  const doc = await getDocument<Omit<VetDocument, "id">>(VETS_COLLECTION, id);
  if (!doc) return null;
  return { ...doc.data, id: doc.id };
}

export async function listVets(): Promise<VetDocument[]> {
  const rows = await queryCollection<Omit<VetDocument, "id">>(VETS_COLLECTION, {
    orderBy: [{ field: "lastName", direction: "ASCENDING" }],
    limit: 500,
  });
  return rows.map((r) => ({ ...r.data, id: r.id }));
}

export async function updateVet(id: string, patch: VetUpdateInput): Promise<void> {
  await updateDocument(VETS_COLLECTION, id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteVet(id: string): Promise<void> {
  await deleteDocument(VETS_COLLECTION, id);
}
