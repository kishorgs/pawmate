import {
  createDocument,
  deleteDocument,
  getDocument,
  queryCollection,
  updateDocument,
} from "../firebase/firestore-rest.server";
import {
  PETS_COLLECTION,
  type PetCreateInput,
  type PetDocument,
  type PetUpdateInput,
} from "./pets.schemas";

export async function createPet(input: PetCreateInput): Promise<PetDocument> {
  const now = new Date().toISOString();
  const doc = await createDocument<Omit<PetDocument, "id">>(PETS_COLLECTION, {
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  return { ...(doc.data as Omit<PetDocument, "id">), id: doc.id };
}

export async function findPetById(id: string): Promise<PetDocument | null> {
  const doc = await getDocument<Omit<PetDocument, "id">>(PETS_COLLECTION, id);
  if (!doc) return null;
  return { ...doc.data, id: doc.id };
}

export async function listPetsByOwner(ownerId: string): Promise<PetDocument[]> {
  const rows = await queryCollection<Omit<PetDocument, "id">>(PETS_COLLECTION, {
    where: [{ field: "ownerId", op: "EQUAL", value: ownerId }],
    orderBy: [{ field: "name", direction: "ASCENDING" }],
    limit: 500,
  });
  return rows.map((r) => ({ ...r.data, id: r.id }));
}

export async function listAllPets(): Promise<PetDocument[]> {
  const rows = await queryCollection<Omit<PetDocument, "id">>(PETS_COLLECTION, {
    orderBy: [{ field: "name", direction: "ASCENDING" }],
    limit: 1000,
  });
  return rows.map((r) => ({ ...r.data, id: r.id }));
}

export async function updatePet(id: string, patch: PetUpdateInput): Promise<void> {
  await updateDocument(PETS_COLLECTION, id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function deletePet(id: string): Promise<void> {
  await deleteDocument(PETS_COLLECTION, id);
}
