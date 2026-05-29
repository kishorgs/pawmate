/**
 * Firebase server-side helpers — RUNS ON CLOUDFLARE WORKERS.
 *
 * We avoid `firebase-admin` (Node-only) and instead:
 *  - Verify ID tokens via Firebase's JWKS using `jose` (Web Crypto).
 *  - Mint OAuth2 access tokens for the service account via signed JWT
 *    (jose) → Google token endpoint.
 *  - Call Firestore through the REST API.
 *
 * This module is server-only. Never import from client code.
 */
import {
  createRemoteJWKSet,
  jwtVerify,
  importPKCS8,
  SignJWT,
  type JWTPayload,
} from "jose";

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  token_uri: string;
}

let _serviceAccount: ServiceAccount | null = null;
let _cachedAccessToken: { token: string; expiresAt: number } | null = null;

const GOOGLE_JWKS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/[email protected]";
// `jose` JWKS expects a JWK set; Firebase publishes JWKS at:
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/[email protected]"),
);

export function getServiceAccount(): ServiceAccount {
  if (_serviceAccount) return _serviceAccount;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not set. Add the full service account JSON as a secret.",
    );
  }
  try {
    _serviceAccount = JSON.parse(raw) as ServiceAccount;
  } catch (error) {
    throw new Error(
      `Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${(error as Error).message}`,
    );
  }
  return _serviceAccount;
}

export function getFirebaseProjectId(): string {
  return process.env.FIREBASE_PROJECT_ID || getServiceAccount().project_id;
}

export interface VerifiedToken {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  claims: JWTPayload;
}

/**
 * Verify a Firebase ID token (RS256) against Google's published JWKS.
 * Throws on invalid/expired tokens.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedToken> {
  const projectId = getFirebaseProjectId();
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  if (!payload.sub) throw new Error("Invalid token: missing sub");
  return {
    uid: payload.sub,
    email: (payload.email as string | undefined) ?? null,
    emailVerified: Boolean(payload.email_verified),
    claims: payload,
  };
}

/**
 * Sign a service-account JWT and exchange for an OAuth2 access token.
 * Cached in-memory until ~60s before expiry.
 */
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (_cachedAccessToken && _cachedAccessToken.expiresAt > now + 60) {
    return _cachedAccessToken.token;
  }
  const sa = getServiceAccount();
  const key = await importPKCS8(sa.private_key, "RS256");
  const assertion = await new SignJWT({
    scope: "https://www.googleapis.com/auth/datastore",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT", kid: sa.private_key_id })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience(sa.token_uri || "https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { access_token: string; expires_in: number };
  _cachedAccessToken = {
    token: body.access_token,
    expiresAt: now + body.expires_in,
  };
  return body.access_token;
}

export async function firestoreFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const url = `https://firestore.googleapis.com/v1/projects/${getFirebaseProjectId()}/databases/(default)/documents${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// Silence unused JWKS-fallback constant.
void GOOGLE_JWKS_URL;
