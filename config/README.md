# PawMate configuration

Runtime defaults live here and are loaded by the NestJS backend via `ConfigModule`. Secrets and environment-specific values remain in `.env` files (never committed).

| File | Purpose |
|------|---------|
| `default.json` | Non-secret defaults (ports, CORS, app metadata) |
| `app.config.ts` | Loader that merges `default.json` with `process.env` |
