import { z } from "zod";

export const VISITS_COLLECTION = "visits";

export const visitCreateSchema = z.object({
  petId: z.string().min(1),
  veterinarianId: z.string().min(1),
  visitDate: z.string().min(8),
  description: z.string().trim().min(1).max(1000),
  diagnosis: z.string().trim().max(2000).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  prescriptionNotes: z.string().trim().max(2000).optional().default(""),
});

export const visitUpdateSchema = visitCreateSchema.partial();

export const visitDocumentSchema = visitCreateSchema.extend({
  id: z.string(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type VisitCreateInput = z.infer<typeof visitCreateSchema>;
export type VisitUpdateInput = z.infer<typeof visitUpdateSchema>;
export type VisitDocument = z.infer<typeof visitDocumentSchema>;
