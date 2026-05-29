/**
 * Server-function middleware that verifies a Firebase ID token from the
 * incoming Authorization header and exposes (uid, email, role) on context.
 *
 * Pair with `attachFirebaseAuth` (client-side) so every protected server fn
 * call carries the bearer automatically.
 */
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { verifyFirebaseIdToken } from "../firebase/admin.server";
import { getUserRole, ensureUserDocument } from "../users/users.repository.server";
import type { AppRole } from "../users/users.schemas";

export interface AuthContext {
  uid: string;
  email: string | null;
  role: AppRole;
}

export const requireFirebaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const header = getRequestHeader("authorization") || getRequestHeader("Authorization");
    if (!header || !header.startsWith("Bearer ")) {
      throw new Response("Unauthorized: missing bearer token", { status: 401 });
    }
    const idToken = header.slice("Bearer ".length).trim();
    let verified;
    try {
      verified = await verifyFirebaseIdToken(idToken);
    } catch (error) {
      console.error("Token verification failed:", error);
      throw new Response("Unauthorized: invalid token", { status: 401 });
    }
    // Auto-provision user doc on first server hit.
    await ensureUserDocument({
      uid: verified.uid,
      email: verified.email,
    });
    const role = await getUserRole(verified.uid);

    const context: AuthContext = {
      uid: verified.uid,
      email: verified.email,
      role,
    };
    return next({ context });
  },
);

export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireFirebaseAuth])
  .server(async ({ next, context }) => {
    if (context.role !== "ADMIN") {
      throw new Response("Forbidden: admin role required", { status: 403 });
    }
    return next();
  });
