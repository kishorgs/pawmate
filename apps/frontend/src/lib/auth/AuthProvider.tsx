'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  confirmPasswordReset,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { getFirebaseAuth, isFirebaseConfigured } from '../firebase/client';
import { apiRequest } from '../api/client';
import type { AppRole, PawMateUser } from '../types';

interface AuthContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
  firebaseUser: FirebaseUser | null;
  user: PawMateUser | null;
  hasRole: (role: AppRole) => boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setIsReady(true);
        queryClient.clear();
        return;
      }
      try {
        const me = await apiRequest<PawMateUser>('/auth/me');
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsReady(true);
        queryClient.invalidateQueries();
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  const signInEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  }, []);

  const confirmPasswordResetHandler = useCallback(async (code: string, password: string) => {
    await confirmPasswordReset(getFirebaseAuth(), code, password);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: Boolean(firebaseUser && user),
      firebaseUser,
      user,
      hasRole: (role) => user?.role === role,
      signInEmail,
      signOut,
      sendPasswordReset,
      confirmPasswordReset: confirmPasswordResetHandler,
    }),
    [isReady, firebaseUser, user, signInEmail, signOut, sendPasswordReset, confirmPasswordResetHandler],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
