# AI usage in PawMate development

This document describes how AI-assisted tools are used on this project and the guardrails we follow.

## Tools

- **Cursor / IDE agents** — implementation, refactors, test scaffolding, and documentation drafts
- **Inline completion** — small edits within existing patterns

## Principles

1. **Human review** — All AI-generated code is reviewed before merge; CI (lint, tests, security scans) must pass.
2. **No secrets in prompts** — Never paste `.env` values, service account JSON, or API keys into AI chats.
3. **Match conventions** — Agents follow existing module layout (`apps/frontend`, `apps/backend`) and NestJS/Next.js patterns in the repo.
4. **Traceability** — Significant architectural choices are recorded in [`docs/adr/`](docs/adr/).

## What we use AI for

- Boilerplate aligned with existing DTOs, controllers, and React Query hooks
- Explaining legacy `src/` prototype code vs current `apps/` stack
- CI/CD and SDLCM maturity improvements (workflows, ADRs, changelogs)

## What we do not use AI for

- Committing credentials or changing security rules without review
- Bypassing tests or lowering coverage gates without team agreement
- Force-pushing to `main` or altering production Firebase projects without approval

## Reporting issues

If AI-suggested code introduces a defect, fix forward with a conventional commit referencing the issue (e.g. `fix(api): validate ownerId (#42)`).
