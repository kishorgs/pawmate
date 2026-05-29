import { createServerFn } from "@tanstack/react-start";

import { requireFirebaseAuth } from "../auth/auth-middleware";
import { getUserDocument } from "./users.repository.server";

/**
 * Returns the current authenticated user's app-level document (role, ownerId).
 * Server-side identity check via verified Firebase ID token.
 */
export const fetchCurrentUser = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const doc = await getUserDocument(context.uid);
    return {
      uid: context.uid,
      email: context.email,
      role: context.role,
      ownerId: doc?.ownerId ?? null,
    };
  });
