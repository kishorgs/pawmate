export const APP_ROLES = ['ADMIN', 'OWNER'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  role: AppRole;
  ownerId: string | null;
}
