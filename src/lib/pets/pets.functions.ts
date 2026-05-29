import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin, requireFirebaseAuth } from "../auth/auth-middleware";
import { findOwnerByUserUid } from "../owners/owners.repository.server";
import {
  petCreateSchema,
  petUpdateSchema,
  type PetDocument,
} from "./pets.schemas";
import {
  createPet,
  deletePet,
  findPetById,
  listAllPets,
  listPetsByOwner,
  updatePet,
} from "./pets.repository.server";

async function assertPetAccess(
  petOwnerId: string,
  uid: string,
  role: string,
): Promise<void> {
  if (role === "ADMIN") return;
  const linked = await findOwnerByUserUid(uid);
  if (!linked || linked.id !== petOwnerId) {
    throw new Response("Forbidden", { status: 403 });
  }
}

export const listPetsForCurrentUser = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }): Promise<PetDocument[]> => {
    if (context.role === "ADMIN") return listAllPets();
    const linked = await findOwnerByUserUid(context.uid);
    if (!linked) return [];
    return listPetsByOwner(linked.id);
  });

export const listPetsForOwner = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(z.object({ ownerId: z.string().min(1) }))
  .handler(async ({ data, context }): Promise<PetDocument[]> => {
    if (context.role !== "ADMIN") {
      const linked = await findOwnerByUserUid(context.uid);
      if (!linked || linked.id !== data.ownerId) {
        throw new Response("Forbidden", { status: 403 });
      }
    }
    return listPetsByOwner(data.ownerId);
  });

export const getPetById = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }): Promise<PetDocument | null> => {
    const pet = await findPetById(data.id);
    if (!pet) return null;
    await assertPetAccess(pet.ownerId, context.uid, context.role);
    return pet;
  });

export const createPetRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(petCreateSchema)
  .handler(async ({ data }): Promise<PetDocument> => createPet(data));

export const updatePetRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1), patch: petUpdateSchema }))
  .handler(async ({ data }) => {
    await updatePet(data.id, data.patch);
    return { ok: true as const };
  });

export const deletePetRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await deletePet(data.id);
    return { ok: true as const };
  });
