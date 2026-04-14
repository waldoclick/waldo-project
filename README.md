# Waldo

Monorepo for the Waldo classified ads platform. Three apps managed with Turbo + Yarn workspaces:
website (public Nuxt 4), dashboard (admin Nuxt 4), strapi (v5 API + CMS).

All business logic lives in Strapi. Website and dashboard are stateless HTTP clients.

## Apps

- [apps/website](./apps/website/README.md) — Public website (port 3000)
- [apps/dashboard](./apps/dashboard/README.md) — Admin dashboard (port 3001)
- [apps/strapi](./apps/strapi/README.md) — API and CMS (port 1337)

## Documentation

- [docs/ad-statuses.md](./docs/ad-statuses.md) — Ad status lifecycle and transitions
- [docs/permissions.md](./docs/permissions.md) — API endpoint permissions by role
- [docs/analytics-events.md](./docs/analytics-events.md) — Analytics event tracking reference
- [docs/payment-flow.md](./docs/payment-flow.md) — Payment gateway flow (Webpay + Oneclick)
- [docs/reservation-system.md](./docs/reservation-system.md) — Ad reservation and free slot lifecycle
- [docs/data-model.md](./docs/data-model.md) — Core entity relationships
- [docs/env-vars.md](./docs/env-vars.md) — Environment variable reference
- [docs/deployment.md](./docs/deployment.md) — Laravel Forge deployment runbook
- [docs/cache.md](./docs/cache.md) — Redis cache in Strapi (TTL, invalidation on writes)

## Quick Start

```bash
yarn install
yarn dev
```

See [CLAUDE.md](./CLAUDE.md) for coding conventions and agent rules.
