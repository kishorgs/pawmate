import { z } from "zod";

export const OWNERS_COLLECTION = "owners";

export const ownerCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(30).regex(/^[+0-9 ()\-]+$/, "Invalid phone"),
  email: z.string().trim().email().max(200),
});

export const ownerUpdateSchema = ownerCreateSchema.partial();

export const ownerDocumentSchema = ownerCreateSchema.extend({
  id: z.string(),
  userUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type OwnerCreateInput = z.infer<typeof ownerCreateSchema>;
export type OwnerUpdateInput = z.infer<typeof ownerUpdateSchema>;
export type OwnerDocument = z.infer<typeof ownerDocumentSchema>;
