import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin, requireFirebaseAuth } from "../auth/auth-middleware";
import {
  ownerCreateSchema,
  ownerUpdateSchema,
  type OwnerDocument,
} from "./owners.schemas";
import {
  createOwner,
  deleteOwner,
  findOwnerById,
  listOwners,
  updateOwner,
} from "./owners.repository.server";

const idInput = z.object({ id: z.string().min(1) });

export const listAllOwners = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async (): Promise<OwnerDocument[]> => listOwners());

export const getOwnerById = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(idInput)
  .handler(async ({ data, context }): Promise<OwnerDocument | null> => {
    const owner = await findOwnerById(data.id);
    if (!owner) return null;
    // Authorization: admin OR the owner's linked user.
    if (context.role !== "ADMIN" && owner.userUid !== context.uid) {
      throw new Response("Forbidden", { status: 403 });
    }
    return owner;
  });

export const createOwnerRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(ownerCreateSchema)
  .handler(async ({ data }): Promise<OwnerDocument> => createOwner(data));

export const updateOwnerRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().min(1), patch: ownerUpdateSchema }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await updateOwner(data.id, data.patch);
    return { ok: true };
  });

export const deleteOwnerRecord = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(idInput)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await deleteOwner(data.id);
    return { ok: true };
  });
