# ADR 0001: Record architecture decisions

## Status

Accepted

## Context

PawMate is a multi-app monorepo (Next.js + NestJS). We need a lightweight way to document significant technical choices.

## Decision

We use Architecture Decision Records (ADRs) in `docs/adr/` with numbered filenames and short Markdown templates (status, context, decision, consequences).

## Consequences

- New contributors can read why the stack and boundaries were chosen
- SDLCM and audit reviews can trace design rationale without digging through PR threads
