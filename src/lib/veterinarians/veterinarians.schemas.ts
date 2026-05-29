import { z } from "zod";

export const VETS_COLLECTION = "veterinarians";

export const vetCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(5).max(30),
  specialties: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  availability: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .max(14)
    .default([]),
});

export const vetUpdateSchema = vetCreateSchema.partial();

export const vetDocumentSchema = vetCreateSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type VetCreateInput = z.infer<typeof vetCreateSchema>;
export type VetUpdateInput = z.infer<typeof vetUpdateSchema>;
export type VetDocument = z.infer<typeof vetDocumentSchema>;
