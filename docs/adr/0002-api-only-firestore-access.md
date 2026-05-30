# ADR 0002: API-only Firestore access

## Status

Accepted

## Context

The product started with a TanStack Start prototype that accessed Firestore from the client. That model complicates authorization and secret handling.

## Decision

The Next.js frontend talks only to the NestJS REST API. All Firestore reads and writes run server-side with Firebase Admin. Firestore security rules deny direct client mutations.

## Consequences

- Single place for role checks (`FirebaseAuthGuard`, `RolesGuard`)
- Slightly higher latency vs direct client SDK, but simpler threat model
- Legacy `src/` prototype remains for reference only; active work lives under `apps/`
