# Waldo

Monorepo for the Waldo classified ads platform. Two apps managed with Turbo + pnpm workspaces:
website (public Nuxt 4, which also serves the admin dashboard as `/dashboard/*` routes) and
strapi (v5 API + CMS).

All business logic lives in Strapi. The website is a stateless HTTP client.

## Apps

- [apps/website](./apps/website/README.md) — Public website + admin dashboard (`/dashboard/*`) (port 3000)
- [apps/strapi](./apps/strapi/README.md) — API and CMS (port 1337)

## Documentation

### Spec

- [docs/spec/product-requirements.md](./docs/spec/product-requirements.md) — Product requirements (as-built)
- [docs/spec/technical-requirements.md](./docs/spec/technical-requirements.md) — Technical requirements and architecture
- [docs/spec/backend-schema.md](./docs/spec/backend-schema.md) — Backend schema (entity/field reference)
- [docs/spec/ux-design.md](./docs/spec/ux-design.md) — UX/design system reference
- [docs/spec/implementation-plan.md](./docs/spec/implementation-plan.md) — Retrospective delivery/implementation history
- [docs/spec/application-flows.md](./docs/spec/application-flows.md) — Application flows (Mermaid diagrams)

### Domain

- [docs/domain/ad-statuses.md](./docs/domain/ad-statuses.md) — Ad status lifecycle and transitions
- [docs/domain/permissions.md](./docs/domain/permissions.md) — API endpoint permissions by role
- [docs/domain/analytics-events.md](./docs/domain/analytics-events.md) — Analytics event tracking reference
- [docs/domain/payment-flow.md](./docs/domain/payment-flow.md) — Payment gateway flow (Webpay + Oneclick)
- [docs/domain/reservation-system.md](./docs/domain/reservation-system.md) — Ad reservation and free slot lifecycle
- [docs/domain/cache.md](./docs/domain/cache.md) — Redis cache in Strapi (TTL, invalidation on writes)

### Deploy

- [docs/deploy/env-vars.md](./docs/deploy/env-vars.md) — Environment variable reference
- [docs/deploy/deployment.md](./docs/deploy/deployment.md) — Deployment runbook (website on Vercel, Strapi on Forge)
- [docs/deploy/deploy-checklist.md](./docs/deploy/deploy-checklist.md) — Manual deploy checklist, DB backup, and rollback
- [docs/deploy/deployment-improvement-roadmap.md](./docs/deploy/deployment-improvement-roadmap.md) — Active deployment improvement plan
- [docs/deploy/branch-protection.md](./docs/deploy/branch-protection.md) — Branch protection setup for `main`

## Quick Start

```bash
pnpm install
pnpm dev
```

See [CLAUDE.md](./CLAUDE.md) for coding conventions and agent rules.
