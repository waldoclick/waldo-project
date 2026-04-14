# Deployment

Each app deploys independently to Laravel Forge. There is no coordinated monorepo deploy — website, dashboard, and Strapi each have their own Forge site, their own deploy script, and their own PM2 process.

---

## Architecture

Three Forge sites, one per app:

| App | Port | PM2 process name | Ecosystem file |
| --- | --- | --- | --- |
| Website | 3000 | `waldo-website` | `apps/website/ecosystem.config.cjs` |
| Dashboard | 3001 | `waldo-dashboard` | `apps/dashboard/ecosystem.config.cjs` |
| Strapi | 1337 | `waldo-strapi` | `apps/strapi/ecosystem.config.js` |

Forge provisions the server, configures Nginx as a reverse proxy, and triggers deploys via webhook. PM2 manages the Node.js processes and handles restarts on failure.

---

## Sparse-Checkout Pattern

Each Forge site pulls only its own subdirectory from the monorepo using `git sparse-checkout`. This avoids downloading all three apps on every deploy.

Deploy script pattern (per app, e.g. website):

```bash
git fetch origin
git sparse-checkout set apps/website
git checkout main
cp -r apps/website/. ./
yarn install --frozen-lockfile
yarn build
pm2 reload ecosystem.config.cjs --update-env
```

The `cp -r apps/website/.` step moves the app's files to the release root so Forge's standard working directory conventions are preserved.

---

## Build Order

Strapi must be built before website and dashboard. This dependency is declared in `turbo.json`. In a full monorepo build (`yarn build` from root), Turbo respects this order automatically. In production deploys, Strapi is typically deployed first manually if schema changes are involved.

---

## Environment Differences

Both staging and production sites are configured in Forge. Deploy status badges are visible in each app's README.

| Environment | Purpose |
| --- | --- |
| Staging | Pre-production validation, QA testing |
| Production | Live traffic |

Environment variables are managed in Forge's site environment editor — never in committed files.

---

## Post-Deploy Checks

After each deploy:

1. Visit the health check URL for the app (website: `/`, dashboard: `/login`, Strapi: `/api/health`).
2. Check PM2 process status: `pm2 status`.
3. Verify no error spikes in Sentry for the app's project.

---

## Rollback

Forge supports release rollback from the site dashboard. Select the previous release and click "Activate". PM2 will be reloaded with the previous build's ecosystem file automatically.

---

## Open Concerns

- Oneclick Mall production contracting with Transbank is pending. Until contracted, the PRO subscription feature must remain disabled (`PRO_ENABLE=false`) in production. See [docs/payment-flow.md](./payment-flow.md) for details.
