# Waldo

Monorepo for the Waldo classified ads platform. Two apps managed with Turbo + pnpm workspaces:
website (public Nuxt 4, which also serves the admin dashboard as `/dashboard/*` routes) and
strapi (v5 API + CMS).

All business logic lives in Strapi. The website is a stateless HTTP client.

## Apps

- [apps/website](./apps/website/README.md) — Public website + admin dashboard (`/dashboard/*`) (port 3000)
- [apps/strapi](./apps/strapi/README.md) — API and CMS (port 1337)

## Documentation

- [docs/ad-statuses.md](./docs/ad-statuses.md) — Ad status lifecycle and transitions
- [docs/permissions.md](./docs/permissions.md) — API endpoint permissions by role
- [docs/analytics-events.md](./docs/analytics-events.md) — Analytics event tracking reference
- [docs/payment-flow.md](./docs/payment-flow.md) — Payment gateway flow (Webpay + Oneclick)
- [docs/reservation-system.md](./docs/reservation-system.md) — Ad reservation and free slot lifecycle
- [docs/BSD.md](./docs/BSD.md) — Backend schema (entity/field reference)
- [docs/env-vars.md](./docs/env-vars.md) — Environment variable reference
- [docs/deployment.md](./docs/deployment.md) — Deployment runbook (website on Vercel, Strapi on Forge)
- [docs/deploy-checklist.md](./docs/deploy-checklist.md) — Manual deploy checklist, DB backup, and rollback
- [docs/cache.md](./docs/cache.md) — Redis cache in Strapi (TTL, invalidation on writes)
- [docs/branch-protection.md](./docs/branch-protection.md) — Branch protection setup for `main`

## Quick Start

```bash
pnpm install
pnpm dev
```

See [CLAUDE.md](./CLAUDE.md) for coding conventions and agent rules.
