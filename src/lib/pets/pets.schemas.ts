import { z } from "zod";

export const PETS_COLLECTION = "pets";

export const PET_TYPES = ["DOG", "CAT", "BIRD", "RABBIT", "REPTILE", "OTHER"] as const;
export const PET_GENDERS = ["MALE", "FEMALE", "UNKNOWN"] as const;

export const petCreateSchema = z.object({
  name: z.string().trim().min(1).max(60),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Expected ISO date"),
  petType: z.enum(PET_TYPES),
  gender: z.enum(PET_GENDERS),
  weightKg: z.coerce.number().min(0).max(500).optional(),
  photoUrl: z.string().url().max(2000).optional().or(z.literal("")),
  ownerId: z.string().min(1),
});

export const petUpdateSchema = petCreateSchema.partial();

export const petDocumentSchema = petCreateSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PetCreateInput = z.infer<typeof petCreateSchema>;
export type PetUpdateInput = z.infer<typeof petUpdateSchema>;
export type PetDocument = z.infer<typeof petDocumentSchema>;
