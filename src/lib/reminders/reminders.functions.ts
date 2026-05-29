import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin, requireFirebaseAuth } from "../auth/auth-middleware";
import { findOwnerByUserUid } from "../owners/owners.repository.server";
import { findPetById } from "../pets/pets.repository.server";
import {
  reminderCreateSchema,
  reminderUpdateSchema,
  type ReminderDocument,
} from "./reminders.schemas";
import {
  createReminder,
  deleteReminder,
  findReminderById,
  listAllReminders,
  listRemindersByOwner,
  listRemindersByPet,
  updateReminder,
} from "./reminders.repository.server";
import {
  calculateNextOccurrence,
  deriveReminderStatus,
  generateOccurrences,
  type ReminderStatus,
} from "./reminder-engine";

export interface EnrichedReminder extends ReminderDocument {
  nextOccurrence: string | null;
  status: ReminderStatus;
  upcomingOccurrences: string[];
}

function enrich(reminder: ReminderDocument): EnrichedReminder {
  const next = calculateNextOccurrence(reminder);
  const upcoming = generateOccurrences(reminder, { maxOccurrences: 10 })
    .filter((d) => d >= new Date())
    .map((d) => d.toISOString());
  return {
    ...reminder,
    nextOccurrence: next?.toISOString() ?? null,
    status: deriveReminderStatus(next),
    upcomingOccurrences: upcoming,
  };
}

export const listRemindersForCurrentUser = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }): Promise<EnrichedReminder[]> => {
    const reminders =
      context.role === "ADMIN"
        ? await listAllReminders()
        : await (async () => {
            const owner = await findOwnerByUserUid(context.uid);
            return owner ? listRemindersByOwner(owner.id) : [];
          })();
    return reminders
      .map(enrich)
      .sort((a, b) => {
        const an = a.nextOccurrence ?? "9999";
        const bn = b.nextOccurrence ?? "9999";
        return an.localeCompare(bn);
      });
  });

export const listRemindersForPet = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(z.object({ petId: z.string().min(1) }))
  .handler(async ({ data, context }): Promise<EnrichedReminder[]> => {
    const pet = await findPetById(data.petId);
    if (!pet) return [];
    if (context.role !== "ADMIN") {
      const owner = await findOwnerByUserUid(context.uid);
      if (!owner || owner.id !== pet.ownerId) throw new Response("Forbidden", { status: 403 });
    }
    const list = await listRemindersByPet(data.petId);
    return list.map(enrich);
  });

export const createReminderRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(reminderCreateSchema)
  .handler(async ({ data }): Promise<EnrichedReminder> => {
    const pet = await findPetById(data.petId);
    if (!pet) throw new Response("Pet not found", { status: 404 });
    const reminder = await createReminder({ ...data, ownerId: pet.ownerId });
    return enrich(reminder);
  });

export const updateReminderRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1), patch: reminderUpdateSchema }))
  .handler(async ({ data }) => {
    await updateReminder(data.id, data.patch);
    return { ok: true as const };
  });

export const deleteReminderRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await deleteReminder(data.id);
    return { ok: true as const };
  });

export const getReminderById = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const reminder = await findReminderById(data.id);
    if (!reminder) return null;
    if (context.role !== "ADMIN") {
      const owner = await findOwnerByUserUid(context.uid);
      if (!owner || owner.id !== reminder.ownerId)
        throw new Response("Forbidden", { status: 403 });
    }
    return enrich(reminder);
  });
