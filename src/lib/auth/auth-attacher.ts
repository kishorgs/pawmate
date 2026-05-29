/**
 * Client-side server-function middleware: attaches the current Firebase
 * ID token as `Authorization: Bearer <token>` on every server-fn call.
 */
import { createMiddleware } from "@tanstack/react-start";
import { getFirebaseAuth, isFirebaseConfigured } from "../firebase/client";

export const attachFirebaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    if (typeof window === "undefined" || !isFirebaseConfigured()) return next();
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) return next();
      const token = await user.getIdToken();
      return next({ headers: { Authorization: `Bearer ${token}` } });
    } catch {
      return next();
    }
  },
);
