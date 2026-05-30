# PawMate

Production-oriented veterinary clinic management platform with a **Next.js 15** frontend and **NestJS** REST API backend.

## Architecture

```
apps/frontend   → Next.js 15 (App Router), MUI, React Query, Firebase Auth client
apps/backend    → NestJS, Firebase Admin, Firestore, Swagger at /api/docs
```

The frontend communicates **only** with the REST API. All Firestore access is server-side via the NestJS backend.

## Collections (Firestore)

| Collection       | Purpose                                      |
|-----------------|----------------------------------------------|
| `users`         | Firebase UID → role (`ADMIN` / `OWNER`)      |
| `owners`        | Pet owner profiles                           |
| `pets`          | Pet records linked to `ownerId`              |
| `veterinarians` | Vet staff, specialties, availability         |
| `appointments`  | Scheduled visits                             |
| `visits`        | Clinical visit history                       |
| `reminders`     | Vaccination & medication reminder schedules  |

## Getting started

### Prerequisites

- Node.js 20+
- Firebase project with Authentication (Email/Password) and Firestore

### Backend

```bash
cd apps/backend
cp .env.example .env
# Set FIREBASE_SERVICE_ACCOUNT_JSON and FIREBASE_PROJECT_ID
npm run start:dev
```

API: `http://localhost:4000/api`  
Swagger: `http://localhost:4000/api/docs`

### Frontend

```bash
cd apps/frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_FIREBASE_* and NEXT_PUBLIC_API_BASE_URL
npm run dev
```

App: `http://localhost:3000`

### Firestore rules

```bash
firebase deploy --only firestore:rules
```

### First user

The first Firebase user to authenticate becomes **ADMIN** automatically. Subsequent users default to **OWNER**.

## Signature features

- **Generic Reminder Engine** — recurring schedules with DAY/WEEK/MONTH/YEAR frequency and NEVER / END_DATE / OCCURRENCE_COUNT end conditions
- **Google Calendar** — “Add to Google Calendar” deep links (no OAuth) for appointments and reminders
- **Role-based access** — owners see only their pets, visits, and reminders

## Security

- Bearer token verification on every protected route
- `class-validator` DTO validation on the API
- Zod validation on forms in the frontend
- Firestore rules deny direct client writes (API-only mutations)
- Structured logging with authorization header redaction

## Tests

```bash
cd apps/backend && npm test
```

## Legacy note

The repository root still contains an earlier **TanStack Start** prototype under `src/`. New development uses `apps/frontend` and `apps/backend` only.
