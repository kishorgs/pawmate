import { z } from "zod";

export const REMINDERS_COLLECTION = "reminders";

export const REMINDER_TYPES = ["VACCINATION", "MEDICATION"] as const;
export const FREQUENCY_UNITS = ["DAY", "WEEK", "MONTH", "YEAR"] as const;
export const END_CONDITIONS = ["NEVER", "END_DATE", "OCCURRENCE_COUNT"] as const;

export const reminderCreateSchema = z
  .object({
    petId: z.string().min(1),
    type: z.enum(REMINDER_TYPES),
    title: z.string().trim().min(1).max(120),
    notes: z.string().trim().max(2000).optional().default(""),
    // Medication-only fields
    medicineName: z.string().trim().max(120).optional(),
    dosage: z.string().trim().max(120).optional(),
    instructions: z.string().trim().max(500).optional(),
    // Schedule
    startDate: z.string().min(8),
    frequencyValue: z.number().int().min(1).max(365),
    frequencyUnit: z.enum(FREQUENCY_UNITS),
    endCondition: z.enum(END_CONDITIONS),
    endDate: z.string().optional(),
    occurrenceCount: z.number().int().min(1).max(365).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.endCondition === "END_DATE" && !val.endDate) {
      ctx.addIssue({ code: "custom", message: "endDate required", path: ["endDate"] });
    }
    if (val.endCondition === "OCCURRENCE_COUNT" && !val.occurrenceCount) {
      ctx.addIssue({
        code: "custom",
        message: "occurrenceCount required",
        path: ["occurrenceCount"],
      });
    }
    if (val.type === "MEDICATION" && !val.medicineName) {
      ctx.addIssue({
        code: "custom",
        message: "medicineName required for medication reminders",
        path: ["medicineName"],
      });
    }
  });

export const reminderUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
  medicineName: z.string().trim().max(120).optional(),
  dosage: z.string().trim().max(120).optional(),
  instructions: z.string().trim().max(500).optional(),
  startDate: z.string().optional(),
  frequencyValue: z.number().int().min(1).max(365).optional(),
  frequencyUnit: z.enum(FREQUENCY_UNITS).optional(),
  endCondition: z.enum(END_CONDITIONS).optional(),
  endDate: z.string().optional(),
  occurrenceCount: z.number().int().min(1).max(365).optional(),
});

export type ReminderCreateInput = z.infer<typeof reminderCreateSchema>;
export type ReminderUpdateInput = z.infer<typeof reminderUpdateSchema>;

export interface ReminderDocument {
  id: string;
  petId: string;
  ownerId: string;
  type: (typeof REMINDER_TYPES)[number];
  title: string;
  notes?: string;
  medicineName?: string;
  dosage?: string;
  instructions?: string;
  startDate: string;
  frequencyValue: number;
  frequencyUnit: (typeof FREQUENCY_UNITS)[number];
  endCondition: (typeof END_CONDITIONS)[number];
  endDate?: string;
  occurrenceCount?: number;
  createdAt: string;
  updatedAt: string;
}
