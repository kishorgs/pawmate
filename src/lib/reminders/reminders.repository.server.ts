import {
  createDocument,
  deleteDocument,
  getDocument,
  queryCollection,
  updateDocument,
} from "../firebase/firestore-rest.server";
import {
  REMINDERS_COLLECTION,
  type ReminderCreateInput,
  type ReminderDocument,
  type ReminderUpdateInput,
} from "./reminders.schemas";

export async function createReminder(
  input: ReminderCreateInput & { ownerId: string },
): Promise<ReminderDocument> {
  const now = new Date().toISOString();
  const doc = await createDocument<Omit<ReminderDocument, "id">>(REMINDERS_COLLECTION, {
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  return { ...(doc.data as Omit<ReminderDocument, "id">), id: doc.id };
}

export async function findReminderById(id: string): Promise<ReminderDocument | null> {
  const doc = await getDocument<Omit<ReminderDocument, "id">>(REMINDERS_COLLECTION, id);
  if (!doc) return null;
  return { ...doc.data, id: doc.id };
}

export async function listRemindersByOwner(ownerId: string): Promise<ReminderDocument[]> {
  const rows = await queryCollection<Omit<ReminderDocument, "id">>(REMINDERS_COLLECTION, {
    where: [{ field: "ownerId", op: "EQUAL", value: ownerId }],
    limit: 500,
  });
  return rows.map((r) => ({ ...r.data, id: r.id }));
}

export async function listRemindersByPet(petId: string): Promise<ReminderDocument[]> {
  const rows = await queryCollection<Omit<ReminderDocument, "id">>(REMINDERS_COLLECTION, {
    where: [{ field: "petId", op: "EQUAL", value: petId }],
    limit: 500,
  });
  return rows.map((r) => ({ ...r.data, id: r.id }));
}

export async function listAllReminders(): Promise<ReminderDocument[]> {
  const rows = await queryCollection<Omit<ReminderDocument, "id">>(REMINDERS_COLLECTION, {
    limit: 1000,
  });
  return rows.map((r) => ({ ...r.data, id: r.id }));
}

export async function updateReminder(id: string, patch: ReminderUpdateInput): Promise<void> {
  await updateDocument(REMINDERS_COLLECTION, id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteReminder(id: string): Promise<void> {
  await deleteDocument(REMINDERS_COLLECTION, id);
}
