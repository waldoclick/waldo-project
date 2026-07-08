# Deployment Improvement Roadmap

> Purpose: reduce production-release errors across **staging** and **production** for the current stack
> (Strapi on Laravel Forge · website on Vercel · GitHub · Cloudflare).
>
> Method note: every item in **Verified findings** is backed by a file in this repo (path cited).
> Anything that depends on Forge/Vercel dashboard configuration — which is **not** in the repo — is
> listed in **Open questions to confirm**, not asserted. Nothing here is inferred across that line.

---

## 1. Verified findings (from the repo)

### 1.1 App topology is now 2 deployables, but the docs still say 3

- `apps/` contains only `strapi` and `website`. There is **no** `apps/dashboard`.
- Git history shows the dashboard was merged into the website app as `/dashboard/*` routes and the
  workspace deleted:
  - `673a32cf chore(125-07): remove apps/dashboard workspace + delete directory`
  - `36f6bb62 feat(125-05): git mv 68 dashboard pages to pages/dashboard/`
  - `ffa763f8 feat(125-03): move all 95 flat dashboard components ... to website`
- The dashboard now lives inside the website: `apps/website/app/pages/dashboard/`, plus
  `*Dashboard.vue` components and `apps/website/nuxt.config.ts` route rules under `/dashboard/`.
- But the following still describe **three separate apps**, each with its own Forge site / port:
  - `README.md` ("website (port 3000), dashboard (port 3001), strapi (port 1337)")
  - `CLAUDE.md` / `AGENTS.md` ("`apps/dashboard` — Admin dashboard (Nuxt 4)")
  - `docs/deploy/deployment.md` (three Forge sites table, `waldo-dashboard` PM2 process, `ecosystem.config.cjs`)

**Impact:** the deployment runbook does not match reality. An operator following it would look for a
dashboard site/process that no longer exists.

### 1.2 Package manager mismatch between docs/scripts and reality

- Actual tooling: **pnpm** — `package.json` (`"packageManager": "pnpm@11.1.1"`), `.npmrc`,
  `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and `vercel.json` (`corepack enable pnpm && pnpm install`).
- Stale references to **Yarn**:
  - `README.md` ("Turbo + Yarn workspaces", `yarn install`, `yarn dev`).
  - `docs/deploy/deployment.md` deploy script (`yarn install --frozen-lockfile`, `yarn build`).
  - `apps/strapi/ecosystem.config.js` → `script: "yarn", args: "start"` (PM2 launches Strapi via yarn).

**Impact:** if the Forge deploy script or the Strapi PM2 ecosystem file is used verbatim, it invokes
`yarn` on a pnpm project — a real failure/inconsistency risk on the Strapi box.

### 1.3 No GitHub CI — nothing gates a merge to `main`

- `.github/` contains only `instructions/codacy.instructions.md`. There are **no** GitHub Actions
  workflows.
- The only build-check artifact is `apps/website/bitbucket-pipelines.yml` — a **Bitbucket** pipeline,
  while the repo is on GitHub (`git@github.com:waldoclick/waldo-project.git`). It also triggers on the
  `master` branch, but this repo's default branch is `main`. It is dead and misleading.
- Local safety is only `.husky/pre-commit` (format + lint-staged per app). It runs no typecheck, no
  tests, no build, and is bypassable with `git commit --no-verify`.

**Impact:** the biggest gap. A broken typecheck/test/build can reach `main` — and therefore a
production deploy — with no automated barrier.

### 1.4 Stale/misleading deploy artifacts still in the repo

- `apps/website/ecosystem.config.cjs` — PM2 config (`waldo-website`, port 3000) from when the website
  ran on Forge. The website is now on Vercel (`vercel.json` builds `waldo-website`). This file is dead.
- `.env.dashboard` at the repo root still targets `https://dashboard.waldo.click` for a workspace that
  no longer exists in the monorepo (gitignored, local-only).
- `docs/deploy/deployment.md` PM2 process names (`waldo-strapi`) don't match the actual ecosystem file
  (`apps/strapi/ecosystem.config.js` names the app `waldo-api`).

### 1.5 Vercel build wiring (what the repo does show)

- `vercel.json` (root): `installCommand: corepack enable pnpm && pnpm install`,
  `buildCommand: pnpm --filter waldo-website run build`. Single Vercel project builds the website
  (including the dashboard routes) from the monorepo root.
- `.vercel/` has `README.txt` and `repo.json` only — **no `project.json`**, so branch→environment
  mapping is not visible from the repo. Confirmed with the owner (see §1.8).

### 1.8 Deployment wiring (verified on the prod server, read-only, 2026-07-08)

Confirmed by SSH inspection of the production Forge box (`waldo-production`, up 27 days) plus owner input.
Nothing was changed on the server.

- **Prod deploys are fully manual** for both apps: website via Vercel and Strapi via Forge. No merge
  auto-ships to production.
- **Vercel = one project**: preview builds (e.g. `develop`) act as **staging**; `main` is the
  **production** branch. So a validated staging environment already exists via preview deployments.
- **`main` has no branch protection** — direct pushes are currently allowed.
- **Only one Forge site exists: `api.waldo.click`** (Strapi, PM2 process `waldo-api`, online). There is
  **no** legacy website/dashboard Forge site to retire — the website is fully on Vercel. (Resolves an
  earlier open question.)
- **Production DB is MySQL — NOT PostgreSQL.** The server's Strapi `.env` has `DATABASE_CLIENT=mysql`,
  `DATABASE_NAME=waldo_production`, port 3306, and the **MySQL** service is active (postgres/mariadb
  inactive). ⚠️ This contradicts the owner's earlier answer ("Postgres"); the server is the source of
  truth. **Backups use `mysqldump`/`mysql`, not `pg_dump`.**
- **Redis IS enabled in prod:** `REDIS_ENABLED=true`, `REDIS_HOST=127.0.0.1`, `REDIS_TTL=14400`; the
  Redis service is active and password-protected (`NOAUTH` on anon ping). So the Strapi HTTP cache
  (`docs/domain/cache.md`) is live and cache-invalidation-on-write behavior applies to every deploy.
- **`dashboard.waldo.click` DNS no longer resolves** (`Could not resolve host`). The dashboard is now
  only `waldo.click/dashboard`. The reset-password flow already uses `FRONTEND_URL`, not `DASHBOARD_URL`
  (explicit comment at `apps/strapi/src/extensions/users-permissions/controllers/authController.ts:589`),
  so nothing is broken by the dead subdomain. The prod `.env` still sets `DASHBOARD_URL` and the root
  `.env.dashboard` still exists — both are **harmless stale cruft to remove**, not a bug.
- **Prod env flags of note:** `NODE_ENV=production`, `CRON_ENABLED=true` (crons run on prod),
  `WEBPAY_ENVIRONMENT=production`, `PRO_ENABLE=false` (matches the pending-Transbank open concern),
  `FRONTEND_URL=https://www.waldo.click`, `CLOUDFLARE_ZONE_ID=306874b6…` (prod zone).

### 1.9 Actual Strapi deploy layout on the server (diverges from `docs/deploy/deployment.md`)

- The deploy directory `/home/forge/api.waldo.click` is **not a git repo**. It uses a
  `releases/` + `current` layout (atomic release directories) plus a persistent `.env` and `storage/`.
  This contradicts the `docs/deploy/deployment.md` description of a `git sparse-checkout` + `git checkout main`
  deploy. The rollback story ("activate previous release") maps to swapping `current` between `releases/`.
- A `package-lock.json` (npm) is present in the deploy dir, while the repo standard is **pnpm**. Both
  `pnpm@11.5.3` and `yarn@1.22.22` are installed on the box (Node v22.20.0). The exact
  install/build command Forge runs on deploy should be pinned to **one** tool (see roadmap P1/P2).

**Impact:** the runbook does not describe the real deploy mechanism, and the package manager used on the
server is ambiguous — both are error sources during a manual deploy or rollback.

### 1.6 Strapi deploy specifics

- DB supports mysql/postgres via env (`apps/strapi/config/database.ts`); migrations dir exists at
  `apps/strapi/database/migrations`.
- Cron is enabled by default (`apps/strapi/config/server.ts`, `CRON_ENABLED` default true); four crons
  per project docs. On a multi-instance or staging+prod setup, crons will run on every instance that
  has it enabled.
- Cloudflare cache purge is implemented in Strapi (`apps/strapi/src/services/cloudflare/`), invoked
  from `apps/strapi/src/api/ad/services/ad.ts`. Purge targets the zone from `CLOUDFLARE_ZONE_ID`, so it
  is **environment-scoped by env var** (staging must carry the staging zone, prod the prod zone).
- Redis HTTP cache is optional and gated on `REDIS_ENABLED` (`docs/domain/cache.md`). A documented past
  incident (2026-07-03) shows per-user routes were once cached globally — see `docs/domain/cache.md`.

### 1.7 Secret hygiene (not a leak, worth noting)

- `.env.global` at the repo root holds real `CLOUDFLARE_API_TOKEN` and `CODACY_API_TOKEN` values.
- Confirmed **not tracked by git** (`git ls-files` returns nothing; `.gitignore` lines 23–28, 50
  cover `.env`, `.env.global`, `.env.dashboard`, `*.env`). Only `*.env.example` files are tracked.
- So: no repository leak. The residual risk is local plaintext at the repo root and manual rotation.

---

## 2. Roadmap (prioritized)

Ordered by risk-reduction per unit of effort. P1 items are the ones that most directly prevent
production errors.

### P1 — Add a GitHub CI gate + protect `main`

**Why:** nothing automated stands between a bad commit and production (§1.3), and `main` currently
accepts direct pushes (§1.8). Because prod deploys are **manual from `main`** (§1.8), the single most
valuable guarantee is: *`main` is always green and only reachable through a reviewed, CI-passing PR* —
so a manual `vercel --prod` / Forge deploy is always shipping validated code.

- Add a GitHub Actions workflow that runs on PRs targeting `develop` and `main`:
  - `pnpm install --frozen-lockfile`
  - `turbo run lint typecheck build test` (website typecheck is already `typeCheck: true`; Strapi has Jest).
  - Optionally `pnpm codacy` (already a Turbo task).
- Turn on **branch protection on `main`**: require PR + passing CI + up-to-date branch; no direct pushes.
  (Matches the existing `feature → develop → PR to main` convention in project memory.)
- Delete `apps/website/bitbucket-pipelines.yml` (dead, wrong platform, wrong branch).

**Acceptance:** a PR with a type error or failing test cannot be merged to `main`, and nothing lands on
`main` without a PR.

### P1 — Make the deployment runbook match reality

**Why:** the current runbook describes a 3-app, all-Forge, Yarn world that no longer exists (§1.1, §1.2, §1.4).

- Rewrite `docs/deploy/deployment.md` to the true topology:
  - **website (+ dashboard routes)** → Vercel, built from `vercel.json`.
  - **strapi** → Forge + PM2 (`apps/strapi/ecosystem.config.js`, app `waldo-api`, port 1337).
- Fix `apps/strapi/ecosystem.config.js` to launch via pnpm, not `yarn` (§1.2).
- Update `README.md` and `CLAUDE.md`/`AGENTS.md`: 2 apps, pnpm (not Yarn), dashboard is a website route.
- Remove dead artifacts: `apps/website/ecosystem.config.cjs`, root `.env.dashboard`.
- **Retire `dashboard.waldo.click` references** (§1.8): repoint Strapi `DASHBOARD_URL` to
  `https://waldo.click/dashboard` (it is used in password-reset email links — verify those still work),
  and drop `.env.dashboard`. Confirm no email/redirect still points at the dead subdomain.

**Acceptance:** a new operator can deploy either app from the doc without hitting a missing app/process/tool,
and no artifact or email points at the retired dashboard subdomain.

### P2 — Strapi production-deploy safety (schema + data)

**Why:** Strapi is the single source of truth; a bad schema/migration on prod is the highest-blast-radius failure.

- Document and enforce ordering for schema changes: **backup DB → deploy Strapi → run migrations → verify → purge cache**.
- Take an explicit **`mysqldump`** snapshot of `waldo_production` immediately **before** each prod Strapi
  deploy (MySQL, §1.8; independent of `backupCron`), and confirm a **`mysql < dump.sql`** restore works
  at least once.
- Always deploy **staging first**, validate, then production (see the promotion item below).
- Confirm crons don't double-run across environments (`CRON_ENABLED=true` on prod, §1.6/§1.8).
- Since Redis is live in prod (§1.8), include a **Cloudflare + Redis purge** step in the deploy checklist
  so stale cached responses don't survive a release.

**Acceptance:** every prod Strapi release has a pre-deploy `mysqldump` snapshot and a tested restore path.

### P2 — Formalize the (manual) staging → production flow into a checklist

**Why:** deploys are fully manual (§1.8), so the failure mode is human error — wrong commit, skipped
step, forgotten cache purge or migration. A written pre-flight checklist is the direct fix. The
environment split already exists: `develop` preview = staging, `main` = prod (§1.8).

- Standard flow to document: `feature → PR → develop` (validate on the Vercel **preview/staging** URL) `→
  PR → main` (green CI) `→` manual prod deploy.
- Write a **deploy checklist** per app. For Vercel, prefer **promoting the exact preview deployment that
  was validated** (`vercel promote`) over rebuilding prod from a different commit. For Strapi/Forge:
  pg_dump → deploy → migrate → health check → purge Cloudflare (correct zone).
- Since it's manual, add a "deploy from `main` only, and only when CI is green" rule to the checklist.

**Acceptance:** one page lists the exact ordered steps to take a change from merged → staging → production
for each app, and prod is never built from an unvalidated commit.

### P2 — Post-deploy smoke checks (lightweight automation)

**Why:** `docs/deploy/deployment.md` post-deploy checks are all manual (health URL, `pm2 status`, Sentry eyeball).

- Add a small smoke script hitting the health endpoints already named in the runbook
  (`/`, Strapi `/api/health`) plus one authenticated dashboard route, run automatically after deploy.
- Fail loudly (non-zero exit / alert) so a broken deploy is caught in seconds, not by a user.

**Acceptance:** a deploy that boots but 500s on a key route is flagged automatically.

### P3 — Rollback runbooks for both platforms

**Why:** `docs/deploy/deployment.md` documents Forge rollback but not Vercel (§1 / Rollback section).

- Add the Vercel instant-rollback / promote-previous-deployment steps.
- Keep the Forge "Activate previous release" steps; add the DB-restore step for schema-changing releases.

### P3 — Cloudflare cache/zone correctness per environment

**Why:** purge is zone-scoped by env var (§1.6) and project memory records this is easy to get wrong.

- Add a startup/CI assertion (or checklist item) that staging carries the staging `CLOUDFLARE_ZONE_ID`
  and prod carries the prod zone, so a deploy can never purge the wrong environment's cache.

### P3 — Secret hygiene

- Keep secrets out of git (already the case). Add a documented **rotation** procedure for the tokens in
  `.env.global` and the Strapi production credentials (`APP_KEYS`, `JWT_SECRET`, Transbank keys — already
  flagged in `docs/deploy/env-vars.md`). Consider a secret-scanning check in the P1 CI workflow.

---

## 3. Still open to confirm

Most questions were resolved by the prod-server inspection (§1.8–1.9). Legacy-Forge-site and Redis
questions are **answered** (only `api.waldo.click`; Redis enabled).

**Staging backend — resolved and verified.** There is a separate Forge server (`waldo-staging`,
`64.176.6.118`) hosting the staging Strapi at `api.waldoclick.dev`. Verified read-only on 2026-07-08 that
staging is properly isolated: `DATABASE_NAME=waldo_staging` (distinct from `waldo_production`),
`WEBPAY_ENVIRONMENT=integration` (test payments never hit the real gateway), its own Cloudflare zone
(`39f28d…` = waldoclick.dev), Redis enabled. So the P2 "staging-first" flow is real. **However, the owner
plans to decommission this box and co-host staging alongside prod on one server — see §4, which changes
the isolation requirements.**

What genuinely remains:

1. **Forge deploy command:** which exact install/build command does each Forge deploy script run
   (`pnpm`? `npm`? `yarn`? — both `pnpm@11.5.3` and `yarn@1.22.22` are installed, and an `npm`
   `package-lock.json` is present in the release dir) and does it run DB migrations? Needed to pin the
   runbook (§1.9).

---

## 4. Planned consolidation: staging + prod on one Forge server

**Decision (owner, 2026-07-08):** decommission the standalone staging box (`waldo-staging`,
`64.176.6.118`) and, for cost, run **both staging and production as two separate Forge sites on the
current prod server** (`waldo-production`, `64.176.14.123`) — distinct sites, distinct databases, fully
separate configuration, same physical host.

This is viable, but co-hosting removes the physical isolation staging currently has. The items below are
the concrete requirements to do it safely; several are **verified hazards**, not hypotheticals.

### 4.1 Staging blueprint to replicate (captured before decommission)

The new staging site should reproduce the current `api.waldoclick.dev` config, adjusted for co-hosting:

| Setting | Current staging value | On the shared prod box |
| --- | --- | --- |
| Forge site / domain | `api.waldoclick.dev` | keep the staging domain, new site |
| DB (MySQL) | `waldo_staging` | **separate DB + separate DB user** from `waldo_production` |
| `PORT` | `1337` | **must differ from prod's 1337** (e.g. `1338`) |
| PM2 process | `waldo-api` | **must be renamed** (both are `waldo-api` today → collision) |
| `WEBPAY_ENVIRONMENT` | `integration` | keep `integration` (never `production` on staging) |
| `CLOUDFLARE_ZONE_ID` | `39f28d…` (waldoclick.dev) | keep the staging zone (per-env purge, already correct) |
| Redis | `127.0.0.1:6379`, enabled | **must be isolated — see 4.2** |
| `NODE_ENV` | `production` | `production` (normal for a staging deploy) |

### 4.2 ⚠️ Redis cache collision (verified in code — must fix before co-hosting)

The Strapi cache middleware connects to Redis with **only** `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD` —
no logical-DB index and no key prefix (`apps/strapi/src/middlewares/cache.ts:14`), and the cache key is
`cache:<method>:<url>:<query>` with **no environment prefix** (`cache.ts:58`). Invalidation runs a global
`redis.keys('cache:*:/api/...')` scan (`cache.ts:127`).

**Consequence:** if the two sites share one Redis instance on DB 0 (their current default), staging and
prod will read/write the **same keys** for the same URL and **cross-invalidate** each other — a staging
write would `DEL` prod's cached ad listings, and a prod response could be served to a staging request.
This is a correctness/data-leak hazard, not just noise.

**Fix (pick one):**

- **Simplest, zero code change:** run a **separate Redis instance for staging** (e.g. port `6380`) and
  point the staging `.env` `REDIS_HOST/PORT` at it. Recommended.
- **Minimal code change:** add a `REDIS_DB` env and pass `db:` to `new Redis({...})` in `cache.ts`
  (staging=1, prod=0). Isolation holds because `KEYS` is per-DB.

### 4.3 Other co-hosting requirements

- **Ports & PM2 names:** distinct `PORT` and distinct PM2 process names per site (see table). Nginx on
  each Forge site proxies to its own port.
- **DB isolation:** separate database **and** a separate MySQL user whose grants cover only the staging
  DB, so a staging misconfig can never read/write `waldo_production`.
- **Cron side-effects (`CRON_ENABLED=true` on both):** staging crons will run on the shared box. Ensure
  staging crons cannot email real users or run against prod data — point staging Mailgun at a
  sandbox/test domain and confirm each cron reads only the staging DB. (This risk exists today on the
  separate box, but co-hosting makes accidental prod-data access easier if grants aren't tight.)
- **Secrets isolation:** the staging `.env` must not contain production payment/API keys — keep fully
  separate per site (Forge already stores env per site).
- **Blast radius / noisy neighbor (the real trade-off):** a server-level problem (disk full from
  `releases/` + uploads, OOM from two Strapi + MySQL + Redis + a build, a bad `apt upgrade`, a reboot)
  now takes down **staging and prod together**, and staging load/QA competes for the same CPU/RAM/DB
  connections as prod. Mitigate: cap PM2 `max_memory_restart` per process, keep only N recent releases,
  monitor disk, and avoid heavy staging activity during prod traffic peaks. Accept that this box is now a
  single point of failure for both environments.
- **Backups:** `mysqldump` **both** `waldo_production` and the staging DB; verify the prod dump/restore
  independently of staging.

### 4.4 Migration steps (safe order, when you do it)

1. Create the staging Forge site on the prod box with its own domain, DB, DB user, port, and PM2 name.
2. Stand up staging Redis isolation (separate instance or `REDIS_DB`) per §4.2 **before** enabling cache.
3. Point the `develop` Vercel preview's `API_URL` at the new staging API; validate a full flow on staging.
4. Only then decommission `64.176.6.118`.

---

*Generated from a read-only review of the repository on 2026-07-08; deployment wiring verified by
read-only SSH inspection of both the production (`waldo-production`) and staging (`waldo-staging`) Forge
servers the same day (§1.8–1.9, §4). No configuration was changed on either server.*
