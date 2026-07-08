# Deployment

Two deployables, deployed independently and **manually**:

| App | Platform | Notes |
| --- | --- | --- |
| Website (`apps/website`) | **Vercel** | Public Nuxt site; also serves the admin dashboard as `/dashboard/*` routes (the former `apps/dashboard` was merged in). Built from the repo root via `vercel.json`. |
| Strapi (`apps/strapi`) | **Laravel Forge** | API + CMS. PM2 process `waldo-api` on port 1337. |

There is no coordinated monorepo deploy and no automated CD — each app is shipped on its own.

---

## Website — Vercel

- One Vercel project. `vercel.json` (repo root) sets:
  - `installCommand`: `corepack enable pnpm && pnpm install`
  - `buildCommand`: `pnpm --filter waldo-website run build`
- **Environment mapping:** the `develop` branch preview acts as **staging**; `main` is the **production** branch.
- **Deploys are manual** (Vercel dashboard / CLI). Merging does not auto-promote to production.
- **Rollback:** promote the previous deployment in the Vercel dashboard (or `vercel promote <url>`).

## Strapi — Forge

- Single Forge site `api.waldo.click` on the production server; PM2 process **`waldo-api`**, port `1337`.
- **Deploy layout is `releases/` + `current`** (atomic releases), not a plain git checkout. A deploy installs with **pnpm**, runs `strapi build`, activates the new release (swaps the `current` symlink), and reloads PM2. Strapi syncs its content-type schema on boot — there is no separate migration step in the deploy.
- **Database:** MySQL (`waldo_production`). **Redis** cache is enabled (`REDIS_ENABLED=true`).
- **Rollback:** activate the previous release in Forge (swaps `current` back) and reload PM2. For schema-changing releases, restore the pre-deploy `mysqldump` first (see the deploy checklist in Phase 3 work).
- A separate staging Strapi currently runs on its own Forge server (`api.waldoclick.dev`, MySQL `waldo_staging`, Webpay `integration`); consolidation onto the prod server is planned — see `docs/deployment-improvement-roadmap.md` §4.

---

## Package manager

The whole monorepo uses **pnpm** (`packageManager` pinned in root `package.json`). Vercel and the Forge deploy both install with pnpm. Do not use Yarn or npm.

---

## Post-deploy checks

After each deploy:

1. Health check: website `/`, dashboard `/dashboard` (authenticated), Strapi `/api/health`.
2. Strapi: `pm2 status` shows `waldo-api` online.
3. No error spikes in Sentry for the app.
4. Purge Cloudflare cache on the correct zone (staging vs prod zones are distinct — the purge uses `CLOUDFLARE_ZONE_ID` from the env).

---

## Environment variables

Managed in each platform's dashboard (Vercel project settings; Forge site environment editor) — never in committed files. See `docs/env-vars.md`.

---

## Open concerns

- Oneclick Mall production contracting with Transbank is pending. Until contracted, the PRO subscription feature must remain disabled (`PRO_ENABLE=false`) in production. See `docs/payment-flow.md`.
- No CI gate historically fronted `main`; a GitHub Actions `ci` check + branch protection is being added (see `docs/branch-protection.md`).
