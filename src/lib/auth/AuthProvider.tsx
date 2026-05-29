/**
 * Auth provider — wraps Firebase Auth and exposes a typed context
 * that's compatible with TanStack Router's beforeLoad guards.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  confirmPasswordReset,
  type User as FirebaseUser,
} from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";

import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import type { AppRole } from "@/lib/users/users.schemas";
import { fetchCurrentUser } from "@/lib/users/users.functions";

export interface PawMateUser {
  uid: string;
  email: string | null;
  role: AppRole;
  ownerId: string | null;
}

export interface AuthContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
  firebaseUser: FirebaseUser | null;
  user: PawMateUser | null;
  hasRole: (role: AppRole) => boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  completePasswordReset: (oobCode: string, newPassword: string) => Promise<void>;
}

const noop = async () => {};

const defaultContext: AuthContextValue = {
  isReady: false,
  isAuthenticated: false,
  firebaseUser: null,
  user: null,
  hasRole: () => false,
  signInEmail: noop,
  signUpEmail: noop,
  signInGoogle: noop,
  signOut: noop,
  sendPasswordReset: noop,
  completePasswordReset: noop,
};

const AuthContext = createContext<AuthContextValue>(defaultContext);

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<PawMateUser | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsReady(true);
      return;
    }
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setIsReady(true);
        queryClient.clear();
        return;
      }
      try {
        const me = await fetchCurrentUser();
        setUser(me);
      } catch (error) {
        console.error("Failed to load current user:", error);
        setUser(null);
      } finally {
        setIsReady(true);
        queryClient.invalidateQueries();
      }
    });
    return () => unsub();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: Boolean(firebaseUser && user),
      firebaseUser,
      user,
      hasRole: (role) => user?.role === role,
      signInEmail: async (email, password) => {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      },
      signUpEmail: async (email, password) => {
        await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      },
      signInGoogle: async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(getFirebaseAuth(), provider);
      },
      signOut: async () => {
        await signOut(getFirebaseAuth());
      },
      sendPasswordReset: async (email) => {
        await sendPasswordResetEmail(getFirebaseAuth(), email);
      },
      completePasswordReset: async (oobCode, newPassword) => {
        await confirmPasswordReset(getFirebaseAuth(), oobCode, newPassword);
      },
    }),
    [firebaseUser, user, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
