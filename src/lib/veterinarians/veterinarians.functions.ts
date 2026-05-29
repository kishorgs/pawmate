import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin, requireFirebaseAuth } from "../auth/auth-middleware";
import {
  vetCreateSchema,
  vetUpdateSchema,
  type VetDocument,
} from "./veterinarians.schemas";
import {
  createVet,
  deleteVet,
  findVetById,
  listVets,
  updateVet,
} from "./veterinarians.repository.server";

export const listAllVets = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async (): Promise<VetDocument[]> => listVets());

export const getVetById = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => findVetById(data.id));

export const createVetRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(vetCreateSchema)
  .handler(async ({ data }) => createVet(data));

export const updateVetRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1), patch: vetUpdateSchema }))
  .handler(async ({ data }) => {
    await updateVet(data.id, data.patch);
    return { ok: true as const };
  });

export const deleteVetRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await deleteVet(data.id);
    return { ok: true as const };
  });
