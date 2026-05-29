import { z } from "zod";

export const APPOINTMENTS_COLLECTION = "appointments";

export const APPOINTMENT_STATUS = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[number];

export const appointmentCreateSchema = z.object({
  petId: z.string().min(1),
  veterinarianId: z.string().min(1),
  scheduledAt: z.string().min(8), // ISO datetime
  durationMinutes: z.number().int().min(5).max(480).default(30),
  reason: z.string().trim().min(1).max(500),
  status: z.enum(APPOINTMENT_STATUS).default("SCHEDULED"),
});

export const appointmentUpdateSchema = appointmentCreateSchema.partial();

export const appointmentDocumentSchema = appointmentCreateSchema.extend({
  id: z.string(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;
export type AppointmentDocument = z.infer<typeof appointmentDocumentSchema>;
