import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin, requireFirebaseAuth } from "../auth/auth-middleware";
import { findOwnerByUserUid } from "../owners/owners.repository.server";
import { findPetById } from "../pets/pets.repository.server";
import {
  visitCreateSchema,
  visitUpdateSchema,
  type VisitDocument,
} from "./visits.schemas";
import {
  createVisit,
  deleteVisit,
  findVisitById,
  listAllVisits,
  listVisitsByPet,
  updateVisit,
} from "./visits.repository.server";

async function assertPetOwnership(petId: string, uid: string, role: string): Promise<string> {
  const pet = await findPetById(petId);
  if (!pet) throw new Response("Pet not found", { status: 404 });
  if (role === "ADMIN") return pet.ownerId;
  const owner = await findOwnerByUserUid(uid);
  if (!owner || owner.id !== pet.ownerId) throw new Response("Forbidden", { status: 403 });
  return pet.ownerId;
}

export const listVisitsForPet = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(z.object({ petId: z.string().min(1) }))
  .handler(async ({ data, context }): Promise<VisitDocument[]> => {
    await assertPetOwnership(data.petId, context.uid, context.role);
    return listVisitsByPet(data.petId);
  });

export const listAllVisitsAdmin = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async (): Promise<VisitDocument[]> => listAllVisits());

export const createVisitRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(visitCreateSchema)
  .handler(async ({ data }): Promise<VisitDocument> => {
    const pet = await findPetById(data.petId);
    if (!pet) throw new Response("Pet not found", { status: 404 });
    return createVisit({ ...data, ownerId: pet.ownerId });
  });

export const updateVisitRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1), patch: visitUpdateSchema }))
  .handler(async ({ data }) => {
    await updateVisit(data.id, data.patch);
    return { ok: true as const };
  });

export const deleteVisitRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await deleteVisit(data.id);
    return { ok: true as const };
  });

export const getVisitById = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const visit = await findVisitById(data.id);
    if (!visit) return null;
    if (context.role !== "ADMIN") {
      const owner = await findOwnerByUserUid(context.uid);
      if (!owner || owner.id !== visit.ownerId) throw new Response("Forbidden", { status: 403 });
    }
    return visit;
  });
