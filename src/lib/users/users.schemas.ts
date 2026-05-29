import { z } from "zod";

export const APP_ROLES = ["ADMIN", "OWNER"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const userDocumentSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email().nullable(),
  role: z.enum(APP_ROLES),
  ownerId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserDocument = z.infer<typeof userDocumentSchema>;

export const USERS_COLLECTION = "users";
