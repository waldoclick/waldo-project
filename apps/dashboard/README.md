[![Staging Deployment Status](https://img.shields.io/endpoint?url=https%3A%2F%2Fforge.laravel.com%2Fsite-badges%2F94079fc7-1aeb-4dc2-baa7-2def0ecd7653%3Fdate%3D1%26label%3D1%26commit%3D1&style=for-the-badge)](https://forge.laravel.com/servers/853896/sites/2507559)
[![Production Deployment Status](https://img.shields.io/endpoint?url=https%3A%2F%2Fforge.laravel.com%2Fsite-badges%2Fc110c271-58ca-4c80-9c6f-979b537c1502%3Fdate%3D1%26label%3D1%26commit%3D1&style=for-the-badge)](https://forge.laravel.com/servers/865606/sites/2550478)

# Dashboard

Admin dashboard for the Waldo classified ads platform (Nuxt 4).

## Prerequisites

- Node.js 18+
- Yarn 1.22.22
- Strapi running on port 1337 (`apps/strapi`)

## Environment Variables

See [../../docs/env-vars.md](../../docs/env-vars.md) for the full reference. Minimum required to boot:

| Variable               | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `API_URL`              | Strapi base URL (e.g. `http://localhost:1337`)    |
| `BASE_URL`             | Dashboard base URL (e.g. `http://localhost:3001`) |
| `RECAPTCHA_SITE_KEY`   | Google reCAPTCHA v3 site key                      |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v3 secret key                    |

## Scripts

| Command        | What it does                         |
| -------------- | ------------------------------------ |
| `yarn dev`     | Start development server (port 3001) |
| `yarn build`   | Build for production                 |
| `yarn preview` | Preview the production build locally |
| `yarn test`    | Run Vitest unit tests                |
| `yarn lint`    | Run ESLint and Stylelint             |

## Port

3001 — `http://localhost:3001`

## Source Layout

See [CLAUDE.md](../../CLAUDE.md) for the canonical Nuxt 4 directory structure. Key directories:

- `app/pages/` — file-based routes
- `app/components/` — auto-imported Vue components
- `app/composables/` — reusable composition logic
- `app/stores/` — Pinia stores
- `app/types/` — TypeScript type declarations
- `app/utils/` — pure formatting utilities
- `server/` — Nitro server routes and middleware
- `tests/` — all test files (mirrors `app/` structure)
