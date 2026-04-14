---
phase: quick-260414-lxu
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - README.md
  - apps/website/README.md
  - apps/dashboard/README.md
  - apps/strapi/README.md
  - docs/payment-flow.md
  - docs/reservation-system.md
  - docs/data-model.md
  - docs/env-vars.md
  - docs/deployment.md
autonomous: true
requirements:
  - DOC-01
  - DOC-02
  - DOC-03
must_haves:
  truths:
    - "Root README.md is a pure global index (intro + links only, no content sections)"
    - "Each app has a technical README with prereqs, env vars, scripts, ports — nothing else"
    - "docs/payment-flow.md, docs/reservation-system.md, docs/data-model.md, docs/env-vars.md, docs/deployment.md exist and match the style of docs/ad-statuses.md and docs/permissions.md"
    - "Root README links to all 3 app READMEs and all 8 docs/*.md files"
    - "No table of contents inside individual docs/*.md files"
  artifacts:
    - path: "README.md"
      provides: "Global monorepo index with links to app READMEs and domain docs"
    - path: "apps/website/README.md"
      provides: "Website technical setup (prereqs, env vars, scripts, ports)"
    - path: "apps/dashboard/README.md"
      provides: "Dashboard technical setup (prereqs, env vars, scripts, ports)"
    - path: "apps/strapi/README.md"
      provides: "Strapi technical setup (prereqs, env vars, scripts, ports)"
    - path: "docs/payment-flow.md"
      provides: "Payment gateway flow (Webpay + Oneclick) end-to-end"
    - path: "docs/reservation-system.md"
      provides: "Ad reservation + free slot lifecycle"
    - path: "docs/data-model.md"
      provides: "Core entity relationships: User → Ad → AdReservation → Order → Pack"
    - path: "docs/env-vars.md"
      provides: "Complete env var reference per app"
    - path: "docs/deployment.md"
      provides: "Laravel Forge + sparse-checkout deployment runbook"
  key_links:
    - from: "README.md"
      to: "apps/*/README.md, docs/*.md"
      via: "markdown links"
      pattern: "\\]\\(\\./(apps|docs)/"
---

<objective>
Restructure the monorepo documentation so the root README.md becomes a minimal global index, each app README is strictly technical setup, and the `docs/` folder hosts domain documentation. Create the 5 missing domain docs.

Purpose: The current root README.md and the app READMEs (website, dashboard) mix technical setup, business rules, and outdated content. There is no index pointing to the already-good domain docs (`ad-statuses.md`, `permissions.md`, `analytics-events.md`), and critical domains (payment flow, reservation system, data model, env vars, deployment) are undocumented.

Output: Rewritten root README, rewritten app READMEs, 5 new domain docs in `docs/`.
</objective>

<context>
@CLAUDE.md
@README.md
@apps/website/README.md
@apps/dashboard/README.md
@apps/strapi/README.md
@docs/ad-statuses.md
@docs/permissions.md
@docs/analytics-events.md

<notes>
Style reference: `docs/ad-statuses.md` and `docs/permissions.md` are the canonical examples. Match their tone:
- Prose-first with tables where they add value
- No decorative emojis in headings
- No table of contents inside the file (the root README IS the index)
- English for new docs (consistent with existing `docs/*.md`)
- Spanish UI labels preserved when quoting UI text

Existing good docs (do NOT modify): `docs/ad-statuses.md`, `docs/permissions.md`, `docs/analytics-events.md`.

Stack facts to honor (from CLAUDE.md + current READMEs):
- Monorepo with Yarn 1.22.22 + Turbo, Node 18+
- Strapi v5 on port 1337, Website (Nuxt 4) on 3000, Dashboard (Nuxt 4) on 3001
- Deployment via Laravel Forge using `git sparse-checkout` per app
- PM2 process manager, ecosystem files per app
- Oneclick Mall must be contracted separately with Transbank (open blocker, mention in payment-flow.md)
- Core entities: User, Ad, AdReservation, AdFeaturedReservation, Order, Pack, SubscriptionPro, SubscriptionPayment
- Payment gateway independence is a core value — order identity is always `order.documentId`, never `buy_order`/`token_ws`

The current `apps/website/README.md` and `apps/dashboard/README.md` are nearly identical boilerplate ("Project Documentation") that describe generic Nuxt/package guides and only the website's DEV_MODE feature. Both must be rewritten from scratch as real technical READMEs for their specific app.
</notes>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create 5 missing domain docs in docs/</name>
  <files>docs/payment-flow.md, docs/reservation-system.md, docs/data-model.md, docs/env-vars.md, docs/deployment.md</files>
  <action>
Create 5 new files in `/home/gab/Code/waldo-project/docs/`. Match the style of `docs/ad-statuses.md` and `docs/permissions.md` exactly: prose-first, tables where they help, no decorative heading emojis, no in-file table of contents, English. Do NOT add a table of contents at the top.

**1. docs/payment-flow.md** — Payment gateway flow
Sections:
- Overview: "Order identity is always `order.documentId`" rule (from CLAUDE.md payment rules — copy verbatim as a warning block).
- Gateways: Webpay Plus (one-shot), Oneclick Mall (recurring PRO subscriptions) — note Oneclick Mall must be contracted separately with Transbank.
- End-to-end flow: User selects pack/featured → POST `/api/payments/checkout` → Strapi creates Order (draft) → Webpay init returns redirect URL → user pays at Transbank → GET `/api/payments/webpay` (no auth header, `auth: false` route) → Strapi finalizes order → redirect to website `/pagar/gracias?order={documentId}`.
- PRO subscription flow: POST `/api/payments/pro` → Oneclick Mall inscription → first charge → redirect `/api/payments/pro-response` → `/pro/gracias?order={documentId}`.
- PackType and FeaturedType semantics (port the rules from the current Strapi README "Sistema de Pagos" section).
- Monthly billing cron: `subscription-payment` records, `chargeUser` with `periodEnd` param, calendar billing (reference phase 120-122 decisions from STATE.md).
- Audit trail: `buy_order`, `token_ws`, `authorization_code` stored inside the order record — never used as primary key.
- Key source files: `apps/strapi/src/api/payment/`, `apps/strapi/src/api/order/`, `apps/website/app/pages/pagar/`, `apps/website/app/pages/pro/`.

**2. docs/reservation-system.md** — Ad reservation + free slot lifecycle
Sections:
- Overview: Every ad needs a reservation slot to transition from `draft` → `pending`. Reservations come in two flavors: `ad-reservation` (standard publication slot) and `ad-featured-reservation` (featured placement slot).
- Free slot guarantee: Each user is guaranteed 3 free reservation slots; `userCron` (2 AM daily, America/Santiago) restores them. Both `active` and `pending` ads count as in-use.
- Lifecycle: reservation created → linked to ad → ad approved → slot consumed; if ad rejected or banned → slot freed for reuse.
- Manager gift flow: POST `/api/ad-reservations/gift` and `/api/ad-featured-reservations/gift` (manager-only, `global::isManager`).
- Relationship to ad statuses: cross-reference `docs/ad-statuses.md` (which covers the ad side). This doc covers the reservation side only.
- Key source files: `apps/strapi/src/api/ad-reservation/`, `apps/strapi/src/api/ad-featured-reservation/`, `apps/strapi/src/crons/user-*.cron.ts`.

**3. docs/data-model.md** — Core entity relationships
Sections:
- Overview: Single sentence "All business data lives in Strapi v5; website and dashboard are stateless HTTP clients."
- Entity diagram (ASCII-art, match style of `ad-statuses.md` state transition diagram):
```
User
 ├── 1:N → Ad
 │         ├── 1:1 → AdReservation
 │         ├── 0:1 → AdFeaturedReservation
 │         └── N:1 → Category, Commune, Region
 ├── 1:N → Order
 │         ├── N:1 → Pack
 │         └── N:1 → Ad (optional)
 ├── 0:1 → SubscriptionPro  (pro_status field)
 └── 1:N → SubscriptionPayment
```
- Entity table: name | key fields | relations | source file. Include User, Ad, AdReservation, AdFeaturedReservation, Order, Pack, SubscriptionPro, SubscriptionPayment, Category, Commune, Region, Policy, Faq, Term, Condition, Article.
- Derived/computed fields: `Ad.status` (virtual, computed by `computeAdStatus()`), `User.pro_status === "active"` as single source of truth for PRO.
- Write-operation note: prefer `documentId` over numeric `id` for updates/deletes in Strapi v5.

**4. docs/env-vars.md** — Complete env var reference
Sections per app. Extract from nuxt.config.ts / ecosystem.config.cjs where relevant, otherwise reference CLAUDE.md and current READMEs. Tables with columns: Variable | Scope (server/public) | Required | Purpose.

- `apps/website`: `DEV_MODE`, `DEV_USERNAME`, `DEV_PASSWORD`, `NUXT_PUBLIC_STRAPI_URL`, `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`, Sentry DSN vars, nuxt-security keys.
- `apps/dashboard`: `NUXT_PUBLIC_STRAPI_URL`, `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NUXT_PUBLIC_AUTH_COOKIE_NAME`, Sentry DSN.
- `apps/strapi`: `DATABASE_*` (host/port/name/user/password), `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, Transbank keys (Webpay Plus + Oneclick Mall), SMTP vars, Google service account (for GA4 / Search Console), Cloudflare Analytics token, Sentry DSN.
- Note about secret rotation and never committing `.env` files.

**5. docs/deployment.md** — Laravel Forge runbook
Sections:
- Overview: Each app deploys independently on Laravel Forge via `git sparse-checkout`.
- Architecture: three Forge sites (website / dashboard / strapi), PM2 manages processes per app, ecosystem files at `apps/*/ecosystem.config.*`.
- Deployment flow: Forge triggers deploy → `git sparse-checkout set apps/<app>` → move contents to release root → `yarn install --frozen-lockfile` → `yarn build` → `pm2 reload ecosystem.config.cjs`.
- Build order: Strapi must build before website and dashboard (turbo.json dependency).
- Environment differences: staging vs production (reference the badge URLs in current READMEs).
- Rollback: Forge release rollback.
- Post-deploy checks: health check URLs, Sentry release tagging.
- Open concerns: Oneclick Mall production contracting pending with Transbank (from STATE.md blockers).
  </action>
  <verify>
    <automated>test -f docs/payment-flow.md && test -f docs/reservation-system.md && test -f docs/data-model.md && test -f docs/env-vars.md && test -f docs/deployment.md && ! grep -l "^## Table of Contents\\|^## Índice" docs/payment-flow.md docs/reservation-system.md docs/data-model.md docs/env-vars.md docs/deployment.md</automated>
  </verify>
  <done>5 new docs exist in `docs/`, each matches style of `ad-statuses.md`/`permissions.md`, none contain an in-file table of contents.</done>
</task>

<task type="auto">
  <name>Task 2: Rewrite 3 app READMEs as pure technical docs</name>
  <files>apps/website/README.md, apps/dashboard/README.md, apps/strapi/README.md</files>
  <action>
Rewrite all three app READMEs from scratch. Each must be strictly technical: prereqs, env vars, scripts, ports. No business rules, no feature overviews, no duplicated content. Keep it short (target 40-80 lines per file).

**Common structure for each file:**
```
# <App Name>

<1-2 sentence description of what the app is>

## Prerequisites
- Node.js 18+
- Yarn 1.22.22
- <app-specific: e.g. Strapi running on :1337 for website/dashboard, PostgreSQL for strapi>

## Environment Variables
See [../../docs/env-vars.md](../../docs/env-vars.md) for the full reference. Minimum required to boot:
<short table with ONLY the vars required to boot locally>

## Scripts
<table: Command | What it does>

## Port
<port number + base URL>

## Source Layout
<bullet list of key directories — see CLAUDE.md "Project Structure" section for the canonical layout, don't duplicate, reference it>
```

**apps/website/README.md:**
- Description: "Public-facing Nuxt 4 website for the Waldo classified ads platform."
- Prereqs: Node 18+, Yarn 1.22.22, Strapi running on :1337
- Min env: `NUXT_PUBLIC_STRAPI_URL`, `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`, optional `DEV_MODE`+`DEV_USERNAME`+`DEV_PASSWORD`
- Scripts: `yarn dev`, `yarn build`, `yarn preview`, `yarn test`, `yarn lint`
- Port: 3000
- Keep the staging/production Forge badges (copy from current README.md).
- Remove entirely: the "Modo Desarrollo" long-form section (now just mention DEV_MODE as an env var with a one-line description).

**apps/dashboard/README.md:**
- Description: "Admin dashboard for the Waldo classified ads platform (Nuxt 4)."
- Prereqs: Node 18+, Yarn 1.22.22, Strapi running on :1337
- Min env: `NUXT_PUBLIC_STRAPI_URL`, `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NUXT_PUBLIC_AUTH_COOKIE_NAME`
- Scripts: `yarn dev`, `yarn build`, `yarn preview`, `yarn test`, `yarn lint`
- Port: 3001
- Keep the staging/production Forge badges (copy from current README.md).
- Remove entirely: all the generic "Project Documentation" / "Modo Desarrollo" boilerplate (DEV_MODE does not apply to the dashboard).

**apps/strapi/README.md:**
- Description: "Backend API and CMS for the Waldo classified ads platform (Strapi v5)."
- Prereqs: Node 18+, Yarn 1.22.22, PostgreSQL 14+
- Min env: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`
- Scripts: `yarn develop`, `yarn build`, `yarn start`, `yarn test` (jest), `yarn lint`
- Port: 1337
- Remove entirely: the "Reglas de Anuncios" and "Sistema de Pagos" sections (those belong in `docs/ad-statuses.md` and `docs/payment-flow.md` respectively — link to them instead).

Each app README must link to `../../docs/env-vars.md` for full env var reference. Do NOT duplicate business rules — link to `/docs/*.md` files instead.
  </action>
  <verify>
    <automated>wc -l apps/website/README.md apps/dashboard/README.md apps/strapi/README.md | awk 'NR<=3 && $1>100 {print "TOO LONG:"$0; exit 1}' && grep -q "docs/env-vars.md" apps/website/README.md && grep -q "docs/env-vars.md" apps/dashboard/README.md && grep -q "docs/env-vars.md" apps/strapi/README.md && ! grep -q "Reglas de Anuncios\\|Sistema de Pagos" apps/strapi/README.md && ! grep -q "Modo Desarrollo" apps/dashboard/README.md</automated>
  </verify>
  <done>All 3 app READMEs rewritten, each ≤100 lines, purely technical, linking to `docs/env-vars.md`, no business rules duplicated, no generic boilerplate remains.</done>
</task>

<task type="auto">
  <name>Task 3: Rewrite root README.md as global index</name>
  <files>README.md</files>
  <action>
Replace `/home/gab/Code/waldo-project/README.md` entirely with a minimal global index. Target length: 30-50 lines. No content sections, no business rules, no setup instructions — just intro + links.

**Exact structure:**
```
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

## Quick Start

```bash
yarn install
yarn dev
```

See [CLAUDE.md](./CLAUDE.md) for coding conventions and agent rules.
```

Do NOT include: prereqs, detailed install steps, port tables, feature lists, emoji decoration headings, business rules, "Resources" / "Tools" / "Authentication" sections. The app READMEs handle setup details; the docs/ files handle domain content. The root README only indexes.
  </action>
  <verify>
    <automated>test $(wc -l < README.md) -le 60 && grep -q "apps/website/README.md" README.md && grep -q "apps/dashboard/README.md" README.md && grep -q "apps/strapi/README.md" README.md && grep -q "docs/ad-statuses.md" README.md && grep -q "docs/permissions.md" README.md && grep -q "docs/analytics-events.md" README.md && grep -q "docs/payment-flow.md" README.md && grep -q "docs/reservation-system.md" README.md && grep -q "docs/data-model.md" README.md && grep -q "docs/env-vars.md" README.md && grep -q "docs/deployment.md" README.md && ! grep -q "Sistema de Pagos\\|Reglas de Negocio\\|PackType" README.md</automated>
  </verify>
  <done>Root README is ≤60 lines, links to all 3 app READMEs and all 8 docs files, contains no business rules or setup duplication.</done>
</task>

</tasks>

<verification>
Run all three task verifications above in sequence. Additionally, do a smoke check:

```bash
# Every docs/*.md file is linked from the root README
for f in docs/*.md; do
  grep -q "$f" README.md || { echo "UNLINKED: $f"; exit 1; }
done

# Every app README is linked from the root README
for f in apps/website/README.md apps/dashboard/README.md apps/strapi/README.md; do
  grep -q "$f" README.md || { echo "UNLINKED: $f"; exit 1; }
done
```
</verification>

<success_criteria>
- Root README.md is a minimal global index (≤60 lines, links-only).
- 3 app READMEs are pure technical setup (≤100 lines each, no duplicated business rules).
- 5 new domain docs exist in `docs/` matching the style of `ad-statuses.md` and `permissions.md`.
- No `docs/*.md` file has an in-file table of contents.
- `apps/website/docs/` and `apps/dashboard/docs/` are left untouched (out of scope).
- Existing good docs (`ad-statuses.md`, `permissions.md`, `analytics-events.md`) are NOT modified.
</success_criteria>

<output>
After completion, create `.planning/quick/260414-lxu-documentation-restructure-rewrite-root-r/260414-lxu-SUMMARY.md` summarizing files created/rewritten and any assumptions made about env vars or flows that could not be verified from source.
</output>
