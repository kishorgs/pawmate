# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-30

### Added

- Next.js 15 frontend and NestJS REST API monorepo under `apps/`
- Firebase Authentication and Firestore-backed domain modules
- Generic reminder engine with recurrence and end conditions
- CI pipeline with lint, test, coverage gate, security scanning, and container build
- Health endpoint, structured logging, and Swagger API docs
- SDLCM maturity artifacts: ADRs, AI usage guide, separated config, and release automation

### Security

- Bearer token verification, DTO validation, and Firestore rules for API-only writes
- Gitleaks secrets scanning and `npm audit` in CI

[1.0.0]: https://github.com/pawmate/pawmate/releases/tag/v1.0.0
