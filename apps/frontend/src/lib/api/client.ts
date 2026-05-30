import { getFirebaseAuth } from '../firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getCurrentUser(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return auth.currentUser;

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function getBearerToken(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError('Missing bearer token', 401);
  }
  return user.getIdToken(true);
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getBearerToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(message || response.statusText, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
