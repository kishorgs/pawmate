import {
  createDocument,
  deleteDocument,
  getDocument,
  queryCollection,
  updateDocument,
} from "../firebase/firestore-rest.server";
import {
  APPOINTMENTS_COLLECTION,
  type AppointmentCreateInput,
  type AppointmentDocument,
  type AppointmentUpdateInput,
} from "./appointments.schemas";

export async function createAppointment(
  input: AppointmentCreateInput & { ownerId: string },
): Promise<AppointmentDocument> {
  const now = new Date().toISOString();
  const doc = await createDocument<Omit<AppointmentDocument, "id">>(
    APPOINTMENTS_COLLECTION,
    { ...input, createdAt: now, updatedAt: now },
  );
  return { ...(doc.data as Omit<AppointmentDocument, "id">), id: doc.id };
}

export async function findAppointmentById(id: string): Promise<AppointmentDocument | null> {
  const doc = await getDocument<Omit<AppointmentDocument, "id">>(APPOINTMENTS_COLLECTION, id);
  if (!doc) return null;
  return { ...doc.data, id: doc.id };
}

export async function listAppointments(): Promise<AppointmentDocument[]> {
  const rows = await queryCollection<Omit<AppointmentDocument, "id">>(
    APPOINTMENTS_COLLECTION,
    {
      orderBy: [{ field: "scheduledAt", direction: "ASCENDING" }],
      limit: 500,
    },
  );
  return rows.map((r) => ({ ...r.data, id: r.id }));
}

export async function listAppointmentsByOwner(ownerId: string): Promise<AppointmentDocument[]> {
  const rows = await queryCollection<Omit<AppointmentDocument, "id">>(
    APPOINTMENTS_COLLECTION,
    {
      where: [{ field: "ownerId", op: "EQUAL", value: ownerId }],
      limit: 500,
    },
  );
  // Sort client-side to avoid composite index requirement.
  return rows
    .map((r) => ({ ...r.data, id: r.id }))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export async function listAppointmentsByPet(petId: string): Promise<AppointmentDocument[]> {
  const rows = await queryCollection<Omit<AppointmentDocument, "id">>(
    APPOINTMENTS_COLLECTION,
    {
      where: [{ field: "petId", op: "EQUAL", value: petId }],
      limit: 500,
    },
  );
  return rows
    .map((r) => ({ ...r.data, id: r.id }))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export async function updateAppointment(id: string, patch: AppointmentUpdateInput): Promise<void> {
  await updateDocument(APPOINTMENTS_COLLECTION, id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteAppointment(id: string): Promise<void> {
  await deleteDocument(APPOINTMENTS_COLLECTION, id);
}
