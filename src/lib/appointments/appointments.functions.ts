import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin, requireFirebaseAuth } from "../auth/auth-middleware";
import { findOwnerByUserUid } from "../owners/owners.repository.server";
import { findPetById } from "../pets/pets.repository.server";
import {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  type AppointmentDocument,
} from "./appointments.schemas";
import {
  createAppointment,
  deleteAppointment,
  findAppointmentById,
  listAppointments,
  listAppointmentsByOwner,
  updateAppointment,
} from "./appointments.repository.server";

export const listAppointmentsForCurrentUser = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }): Promise<AppointmentDocument[]> => {
    if (context.role === "ADMIN") return listAppointments();
    const owner = await findOwnerByUserUid(context.uid);
    if (!owner) return [];
    return listAppointmentsByOwner(owner.id);
  });

export const createAppointmentRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(appointmentCreateSchema)
  .handler(async ({ data }): Promise<AppointmentDocument> => {
    const pet = await findPetById(data.petId);
    if (!pet) throw new Response("Pet not found", { status: 404 });
    return createAppointment({ ...data, ownerId: pet.ownerId });
  });

export const updateAppointmentRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1), patch: appointmentUpdateSchema }))
  .handler(async ({ data }) => {
    await updateAppointment(data.id, data.patch);
    return { ok: true as const };
  });

export const deleteAppointmentRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await deleteAppointment(data.id);
    return { ok: true as const };
  });

export const getAppointmentById = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const appt = await findAppointmentById(data.id);
    if (!appt) return null;
    if (context.role !== "ADMIN") {
      const owner = await findOwnerByUserUid(context.uid);
      if (!owner || owner.id !== appt.ownerId) {
        throw new Response("Forbidden", { status: 403 });
      }
    }
    return appt;
  });
