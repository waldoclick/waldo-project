# Waldo

Monorepo for the Waldo classified ads platform. Two apps managed with Turbo + pnpm workspaces:
website (public Nuxt 4, which also serves the admin dashboard as `/dashboard/*` routes) and
strapi (v5 API + CMS).

All business logic lives in Strapi. The website is a stateless HTTP client.

## Apps

- [apps/website](./apps/website/README.md) — Public website + admin dashboard (`/dashboard/*`) (port 3000)
- [apps/strapi](./apps/strapi/README.md) — API and CMS (port 1337)

## Documentation

All developer documentation lives in the **[GitHub Wiki](https://github.com/waldoclick/waldo-project/wiki)** — it is the single source of truth (there is no `docs/` folder in the repo). To edit, use the wiki's Edit button or clone `git@github.com:waldoclick/waldo-project.wiki.git`.

- **Deploy & Ops** — [deployment](https://github.com/waldoclick/waldo-project/wiki/deployment), [deploy checklist](https://github.com/waldoclick/waldo-project/wiki/deploy-checklist), [branch protection](https://github.com/waldoclick/waldo-project/wiki/branch-protection), [env vars](https://github.com/waldoclick/waldo-project/wiki/env-vars), [hardening roadmap](https://github.com/waldoclick/waldo-project/wiki/deployment-improvement-roadmap)
- **Domain** — [ad statuses](https://github.com/waldoclick/waldo-project/wiki/ad-statuses), [reservations](https://github.com/waldoclick/waldo-project/wiki/reservation-system), [payment flow](https://github.com/waldoclick/waldo-project/wiki/payment-flow), [permissions](https://github.com/waldoclick/waldo-project/wiki/permissions), [cache](https://github.com/waldoclick/waldo-project/wiki/cache), [analytics](https://github.com/waldoclick/waldo-project/wiki/analytics-events)
- **Spec (as-built)** — [product requirements](https://github.com/waldoclick/waldo-project/wiki/product-requirements), [technical requirements](https://github.com/waldoclick/waldo-project/wiki/technical-requirements), [implementation plan](https://github.com/waldoclick/waldo-project/wiki/implementation-plan), [application flows](https://github.com/waldoclick/waldo-project/wiki/application-flows), [UX design](https://github.com/waldoclick/waldo-project/wiki/ux-design), [backend schema](https://github.com/waldoclick/waldo-project/wiki/backend-schema)

## Quick Start

```bash
pnpm install
pnpm dev
```

See [CLAUDE.md](./CLAUDE.md) for coding conventions and agent rules.
