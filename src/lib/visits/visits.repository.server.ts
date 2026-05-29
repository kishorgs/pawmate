import {
  createDocument,
  deleteDocument,
  getDocument,
  queryCollection,
  updateDocument,
} from "../firebase/firestore-rest.server";
import {
  VISITS_COLLECTION,
  type VisitCreateInput,
  type VisitDocument,
  type VisitUpdateInput,
} from "./visits.schemas";

export async function createVisit(
  input: VisitCreateInput & { ownerId: string },
): Promise<VisitDocument> {
  const now = new Date().toISOString();
  const doc = await createDocument<Omit<VisitDocument, "id">>(VISITS_COLLECTION, {
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  return { ...(doc.data as Omit<VisitDocument, "id">), id: doc.id };
}

export async function findVisitById(id: string): Promise<VisitDocument | null> {
  const doc = await getDocument<Omit<VisitDocument, "id">>(VISITS_COLLECTION, id);
  if (!doc) return null;
  return { ...doc.data, id: doc.id };
}

export async function listVisitsByPet(petId: string): Promise<VisitDocument[]> {
  const rows = await queryCollection<Omit<VisitDocument, "id">>(VISITS_COLLECTION, {
    where: [{ field: "petId", op: "EQUAL", value: petId }],
    limit: 500,
  });
  return rows
    .map((r) => ({ ...r.data, id: r.id }))
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
}

export async function listAllVisits(): Promise<VisitDocument[]> {
  const rows = await queryCollection<Omit<VisitDocument, "id">>(VISITS_COLLECTION, {
    limit: 1000,
  });
  return rows
    .map((r) => ({ ...r.data, id: r.id }))
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
}

export async function updateVisit(id: string, patch: VisitUpdateInput): Promise<void> {
  await updateDocument(VISITS_COLLECTION, id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteVisit(id: string): Promise<void> {
  await deleteDocument(VISITS_COLLECTION, id);
}
