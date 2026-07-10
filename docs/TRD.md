# Technical Requirements Document (TRD)

This document is the as-built technical reference for the Waldo Project. It describes the stack, architecture, integrations, and non-functional requirements **as they exist in the current codebase**, verified directly against `pnpm-workspace.yaml`, `package.json` manifests, and live source — not copied from `.planning/codebase/ARCHITECTURE.md` (dated 2026-06-10), `CLAUDE.md`/`AGENTS.md` (repo root, stale on package topology), or the pre-existing `/docs/*.md` set (several of which also describe a stale 3-app topology, see below).

---

## Table of Contents

- [Inconsistencias detectadas](#inconsistencias-detectadas)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Integrations](#integrations)
- [Non-Functional Requirements](#non-functional-requirements)
- [Preguntas abiertas](#preguntas-abiertas)

---

## Inconsistencias detectadas

Two corrections, verified directly against current source, that any reader relying on this repo's own prose (CLAUDE.md, AGENTS.md, or several pre-existing `/docs/*.md` files) would get wrong:

**1. The monorepo is 2 packages, not 3 — there is no separate `apps/dashboard`.**

`pnpm-workspace.yaml` lists exactly two packages:

```yaml
packages:
  - 'apps/strapi'
  - 'apps/website'
```

`ls apps/` confirms only `strapi` and `website` exist on disk. `CLAUDE.md`/`AGENTS.md` (repo root) both describe "three apps in a monorepo" (`apps/website`, `apps/dashboard`, `apps/strapi`) — this is stale. The admin dashboard is **not** a separate deployed application; it is a set of routes under `apps/website/app/pages/dashboard/**` (`account`, `ads`, `articles`, `featured`, `integrations`, `maintenance`, `orders`, `reservations`, `users`, plus `index.vue`), gated globally by `apps/website/app/middleware/dashboard-guard.global.ts` (requires a resolved session user with `role.name.toLowerCase() === "manager"`). This same stale 3-app claim also appears in `docs/deployment.md` (which describes a separate `waldo-dashboard` PM2 process / Forge site on port 3001) and `docs/env-vars.md` (which has a standalone `## apps/dashboard` env-var section) — both predate the dashboard-into-website merge and should be read with that correction in mind. See [docs/BSD.md](../docs/BSD.md) and [docs/FLOWS.md](../docs/FLOWS.md), which state this same fact for consistency across all Wave 1/2 documents in this phase.

**2. There are 6 active cron jobs plus 1 manual-only task, not 4.**

`CLAUDE.md` states "Four active cron jobs: `adCron` (1 AM), `userCron` (2 AM), `backupCron` (3 AM), `cleanupCron` (Sunday 4 AM)." This undercounts. `apps/strapi/config/cron-tasks.ts` (registered via `apps/strapi/config/server.ts`'s `cron: { enabled: true, tasks: cronTasks }`) currently registers:

| Key | Schedule | Purpose |
|---|---|---|
| `adCron` | 1 AM daily | Ad expiry / `remaining_days` decrement |
| `userCron` | 2 AM daily | Free reservation slot restore |
| `backupCron` | 3 AM daily | Database backup |
| `verificationCodeCleanupCron` | 4 AM daily | Expired 2-step login code cleanup |
| `cleanupCron` | Sunday 4 AM | Orphan media audit (Cloudinary) |
| `subscriptionChargeCron` | 5 AM daily, **only when `PRO_ENABLE=true`** | Monthly PRO billing |
| `userConfirmedMigration` | never auto-fires (far-future placeholder) | Manual-only, one-time data migration |

That is **6 active scheduled jobs plus 1 manual-trigger-only task**. See [docs/FLOWS.md](../docs/FLOWS.md) Flow 6 for the full per-job trace, source-file mapping, and error-state notes — this note exists here only to flag the correction, not to duplicate the flow.

---

## Technology Stack

### Website (`apps/website`) — public site + dashboard routes

| Layer | Choice | Verified version |
|---|---|---|
| Framework | Nuxt | `^4.1.3` (`future.compatibilityVersion: 4`) |
| UI | Vue 3, Composition API, `<script setup>` | (bundled with Nuxt 4) |
| Language | TypeScript, strict mode (`typeCheck: true`) | — |
| State | Pinia + `@pinia-plugin-persistedstate/nuxt` | `^2.2.2` (pinia) |
| Strapi client | `@nuxtjs/strapi` v2 | — used for reads; all writes go through the httpOnly-cookie Nitro proxy (`useApiClient()`), not the SDK directly — see Architecture |
| Images | `@nuxt/image` | `^1.11.0` |
| SEO | `@nuxtjs/seo` | `^3.2.2` |
| Security headers / CSP | `nuxt-security` | `2.4.0` |
| Error tracking | `@sentry/nuxt` | `^9.17.0` (production-only, `NODE_ENV === "production"` guard) |
| Build tool | Vite | `^6.2.5` |
| Testing | Vitest + `@nuxt/test-utils` | `^3.0.9` |
| Styling | Sass, BEM convention | — |
| Linting | `@nuxt/eslint` | — |

### Strapi (`apps/strapi`) — sole backend / business-logic layer

| Layer | Choice | Verified version |
|---|---|---|
| Framework | Strapi | `5.41.1` |
| Language | TypeScript | — |
| Testing | Jest, AAA pattern | — |
| Email provider | `@strapi/provider-email-mailgun` | `5.41.1` |
| Cache (optional) | Redis via `ioredis`, `global::cache` middleware | disabled by default, gated on `REDIS_ENABLED=true` |
| Logging | Winston (Better Stack + 90-day local file rotation) — the audit-log storage mechanism (see NFRs) | — |

### Monorepo tooling

- **Orchestration:** Turbo (`turbo.json` declares Strapi-before-website build ordering)
- **Package manager:** pnpm (never npm/yarn — see `pnpm-workspace.yaml`)
- **Deploy:** independent per-app deploy via Laravel Forge with `git sparse-checkout` (see [docs/deployment.md](../docs/deployment.md) — note its 3-app framing is stale per Inconsistencias detectadas above; the underlying sparse-checkout/PM2/Forge mechanism it describes for `apps/strapi` and `apps/website` is otherwise accurate)

### Notable version-history detail: the httpOnly-proxy migration (v1.46 era)

`@nuxtjs/strapi` is retained in `apps/website` for **read** operations (`useStrapi()`/`find`/`findOne`), but as of the Phase 129 hardening work, it is no longer the path for **mutations** or session/token handling. `useApiClient()` is the drop-in composable for all POST/PUT/DELETE calls, and session state (`useSessionUser`/`useSessionAuth`/`useSessionClient`) is custom-built rather than SDK-provided. The JWT itself is never held in client-accessible storage — see Architecture below.

---

## Architecture

### The 2-package topology

```
waldo-project/ (pnpm workspace)
├── apps/strapi/    — sole business-logic + CMS layer (Strapi v5)
└── apps/website/   — SSR/Nitro-proxy client (Nuxt 4), serves BOTH:
    ├── public routes   — anunciar, anuncios, blog, cuenta, login, pagar, pro, registro, etc.
    └── /dashboard/**   — admin routes, gated by dashboard-guard.global.ts (role: manager)
```

All business logic — validation, payment orchestration, moderation rules, audit logging, cron jobs — lives in Strapi. `apps/website` is a stateless HTTP client for both its public and dashboard surfaces; it holds no independent business rules beyond client-side form validation and route guards. See [docs/BSD.md](../docs/BSD.md) for the full 21-entity data model this backend layer exposes.

### Session / auth architecture: httpOnly proxy cookie

The client never holds a JWT in any client-readable storage. The flow (fully traced in [docs/FLOWS.md](../docs/FLOWS.md) Flow 1):

1. Strapi issues a JWT on successful authentication (local 2-step verify, Google OAuth, or Google One Tap).
2. A **Nitro server route** (`apps/website/server/api/auth/*`) receives the JWT server-side and sets it as an **httpOnly, `sameSite: lax`, 7-day cookie** named `waldo_jwt`. The JWT is discarded from that route's own JSON response — the browser only ever receives `{ user }`.
3. Every subsequent API call is routed through the Nitro catch-all proxy (`apps/website/server/api/[...].ts`), which reads `waldo_jwt` from the incoming request's cookie jar and injects `Authorization: Bearer <jwt>` before forwarding to Strapi.
4. A shared `X-Proxy-Key` header (`config.proxySecretWeb`, verified against `process.env.PROXY_SECRET_WEB` / `PROXY_SECRET_APP` in `apps/strapi/src/middlewares/proxy-auth.ts`) authenticates the Nitro layer itself to Strapi as a trusted proxy, independent of the end-user's JWT.
5. GET redirects from payment gateways (Webpay, Oneclick) are marked `config: { auth: false }` on the Strapi route — since `sameSite: lax` cookies are sent on top-level navigations, the proxy would otherwise inject the authenticated user's `Authorization` header on the gateway's own callback GET, causing Strapi to apply the (permission-lacking) authenticated role and 403 the callback. This is documented per-route, not a blanket exemption.

### Public-vs-dashboard route split

Both surfaces are served by the same Nuxt application and the same build. The only structural difference is:

- **Route namespace:** dashboard pages live under `/dashboard/**` (10 subdirectories).
- **Middleware gate:** `dashboard-guard.global.ts` runs on every navigation, engages only for `/dashboard` paths, and requires `role.name.toLowerCase() === "manager"`.
- **Data-loading convention:** public pages use `useAsyncData()` as the sole data-loading trigger (CLAUDE.md rule — never paired with a bare `await storeAction()`); dashboard components use `watch({ immediate: true })` as the sole trigger (never paired with `onMounted`).

See [docs/UXD.md](../docs/UXD.md) for the full page inventory and component taxonomy behind this split.

### Data layer

The full 21-entity schema (20 content-types under `apps/strapi/src/api/*/content-types/*/schema.json` plus `User`, which lives under the `users-permissions` plugin extension path and is easy to miss with a naive glob) is documented in [docs/BSD.md](../docs/BSD.md), including the Mermaid ER diagram and the non-CRUD API endpoint reference. This document does not duplicate that content.

### Runtime flows

All 6 mandated application flows (authentication, ad lifecycle, payment/checkout, reservations, CRUD + audit-log, cron jobs) — each with a Mermaid diagram and happy-path/error-state/role-gated prose — are documented in [docs/FLOWS.md](../docs/FLOWS.md). This document references them by name rather than re-deriving them.

---

## Integrations

Verified against `docs/env-vars.md`, `.planning/codebase/INTEGRATIONS.md` (lead, cross-checked), and live middleware/service source.

| Integration | Purpose | Auth / config | Notes |
|---|---|---|---|
| **Transbank Webpay Plus** | Card payments (one-off ad/pack purchases) | `WEBPAY_COMMERCE_CODE`, `WEBPAY_API_KEY`, `WEBPAY_ENVIRONMENT` | `transbank-sdk`; abstracted behind `apps/strapi/src/services/payment-gateway/` registry pattern for multi-gateway extension (currently only `transbank` adapter registered). Order identity is always `order.documentId` — see CLAUDE.md Payment Rules and [docs/FLOWS.md](../docs/FLOWS.md) Flow 3. |
| **Transbank Oneclick Mall** | Recurring PRO subscription billing | `ONECLICK_COMMERCE_CODE`, `ONECLICK_API_KEY`, `ONECLICK_CHILD_COMMERCE_CODE` | Gated behind `PRO_ENABLE=true`; production contracting with Transbank is a pending open concern (see [docs/deployment.md](../docs/deployment.md) Open Concerns). |
| **Mailgun** | Transactional email (auth, moderation, receipts, gifts) | `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_EMAIL` | `@strapi/provider-email-mailgun`; templates are MJML + Nunjucks. Nearly all email sends in the codebase are wrapped in non-fatal try/catch — a failed send never blocks the underlying business operation. |
| **Cloudinary** | Media storage/optimization for ad galleries, avatars, article covers | (asset-pipeline env, see `.env.example` in `apps/strapi`) | Referenced by `media-cleanup.cron.ts` (Flow 6) for orphan-image auditing (audit-only, never auto-deletes). |
| **Better Stack (via Winston)** | Structured log aggregation | Winston transport config | The audit-log storage backend (Phase 5 pivot) — see Non-Functional Requirements below. |
| **Sentry** (`@sentry/nuxt`, Strapi Sentry plugin) | Error tracking | `SENTRY_DSN` (+ org/project/auth-token for source maps) | Restricted to production only in all runtime entry points (`NODE_ENV === "production"` guard) — dev/staging generate zero Sentry traffic. |
| **Google OAuth2** | Social login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Strapi users-permissions provider; full code-exchange flow via `google-auth-library`. |
| **Google One Tap** | Passwordless login | `GOOGLE_CLIENT_ID` (shared with OAuth) | RS256/JWKS credential verification; bypasses the 2-step verification flow (Google has already asserted identity) — see [docs/FLOWS.md](../docs/FLOWS.md) Flow 1. |
| **Google Analytics 4 / Search Console** | Analytics reporting surfaced in the dashboard Integrations panel | `GA4_PROPERTY_ID`, `GOOGLE_SC_SITE_URL`, service-account credentials (`GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`) | `Auth.GoogleAuth` instantiated per method call (not cached as an instance field) to avoid stale-credential reuse. |
| **GTM** (`@saslavik/nuxt-gtm`) | Tag management / GA4 event routing | `GTM_ID` | `enableRouterSync: true` fires `page_view` on SPA route changes; replaces an earlier hand-rolled `gtm.client.ts` plugin. Consent Mode v2 implemented (default-deny pushed before GTM script load). |
| **Cloudflare** | CDN + Analytics API (dashboard Integrations panel) | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` | Analytics response typed via a local `any`-cast helper (`extractGroups<T>()`) since Cloudflare's GraphQL Analytics API has no published TS types. |
| **Google reCAPTCHA v3** | Bot/abuse protection on mutating requests | `RECAPTCHA_SITE_KEY` (client), `RECAPTCHA_SECRET_KEY` (server-only, verified in the Nitro proxy) | Method-based guard (POST/PUT/DELETE) rather than an allowlist — protects all future mutating routes automatically without per-route opt-in; verified in `apps/strapi/src/middlewares/recaptcha.ts` (`ctx.method === "POST" \| "PUT"` branches). |
| **Zoho CRM** | Lead/contact sync on ad publish and pack purchase | `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` | `Zoho-oauthtoken` header scheme (not `Bearer`); 401 interceptor with single-retry guard; `ad_paid` sync is fire-and-forget (non-blocking, since the controller redirects immediately after), `pack_purchased` sync is awaited. |
| **AI providers** (Gemini, Anthropic Claude, Groq, DeepSeek, Tavily, Serper) | Article-drafting assistant (dashboard "Artículos" AI lightbox) and search | Provider-specific API keys, `AI_PROVIDER` env selects default | Uniform `PROVIDERS` map hides per-provider signature differences; Groq (`llama-3.3-70b-versatile`, `response_format: json_object`) is the current default for structured article generation (rate-limit workaround over Gemini). |

---

## Non-Functional Requirements

### Security

- **httpOnly session cookie:** the JWT (`waldo_jwt`) is never exposed to client-side JavaScript — see Architecture above. `COOKIE_DOMAIN` (optional) enables cross-subdomain cookie sharing in production (`.waldo.click`).
- **Proxy secret:** all Nitro→Strapi requests carry an `X-Proxy-Key` header validated against `PROXY_SECRET_WEB`/`PROXY_SECRET_APP` in `apps/strapi/src/middlewares/proxy-auth.ts`, so Strapi only accepts traffic from the trusted proxy layer.
- **reCAPTCHA v3 on mutations:** method-based guard (POST/PUT/DELETE) applied broadly rather than route-by-route, closing the gap where a new mutating route could otherwise ship unprotected by omission.
- **Role-gated moderation and admin actions:** `global::isManager` policy on ad approve/reject/ban, gift-reservation endpoints, cron-runner manual trigger, and AI provider endpoints.
- **Payment identity invariant:** order identity is always `order.documentId`; gateway references (`buy_order`, `token_ws`, `TBK_*`, `authorization_code`) are stored for audit only and never used as a lookup/redirect key — enforced project-wide per CLAUDE.md Payment Rules and verified against every payment code path in [docs/FLOWS.md](../docs/FLOWS.md) Flow 3.
- **Fail-closed amount validation:** the Webpay return handler throws if `AD_FEATURED_PRICE` is unset rather than trusting the gateway-reported charge amount unconditionally.
- **TypeScript strict mode, `typeCheck: true`:** enabled across the website build; zero `any` in Strapi's ad/payment/integration service layer (established incrementally, tracked in `.planning/PROJECT.md`'s validated-requirements history).

### Caching

- **Optional Redis HTTP cache** (`global::cache` Strapi middleware, `apps/strapi/src/middlewares/cache.ts`), disabled by default, gated on `REDIS_ENABLED=true`. Caches `GET`/`HEAD` responses for public collection routes (e.g. `/api/ads`, `/api/categories`); excludes admin, auth, orders, users, uploads, and binary-asset paths. Invalidates on write via a `KEYS cache:*:/api/{collection}*` scan + bulk `DEL`. Fails open (falls through to the normal handler) if Redis is unreachable. Full detail in [docs/cache.md](../docs/cache.md).
- **Known limitation:** the Nuxt proxy layer does not forward `X-Cache`/`Cache-Control` headers to the browser — visible only on direct Strapi requests, not through website/dashboard clients (tracked, unresolved).

### Backups

- `backupCron` (3 AM daily) runs a `pg_dump` database backup with 7-file rotation (`apps/strapi/src/cron/bbdd-backup.cron.ts`) — see [docs/FLOWS.md](../docs/FLOWS.md) Flow 6 for the full cron registry, including the corrected 6-active-plus-1-manual count (Inconsistencias detectadas above).

### Observability

- **Audit logging:** every Strapi content mutation (`create`/`update`/`delete`) is captured by a single global `strapi.db.lifecycles.subscribe()` hook, registered as the first statement in `bootstrap()`. Rather than a database table, every audit event is written through a shared `logAuditInfo`/`logAuditWarn`/`logAuditError` helper into the project's existing Winston logger (Better Stack + 90-day local file rotation) — a deliberate architectural pivot away from an earlier dedicated `audit-log` content-type. The envelope is `{ actor: number | "system", actor_type: "admin::user" | "plugin::users-permissions.user" | "system", data?: Record<string, unknown> }`. Full trace, including direct call-site homologation across the payment/ad domains, in [docs/FLOWS.md](../docs/FLOWS.md) Flow 5 — this NFR section references it rather than re-describing it.
- **Error tracking:** Sentry, production-only (see Integrations table above).
- **Deploy health checks:** per-app health-check URL + PM2 status check + Sentry error-spike check after every deploy (see [docs/deployment.md](../docs/deployment.md); note its "3-app" framing predates the dashboard merge, per Inconsistencias detectadas — the website/Strapi deploy mechanics it documents remain accurate).

---

## Preguntas abiertas

- **`cron-runner` manual-trigger endpoint (`POST /api/cron-runner/:name`) production access control:** confirmed to exist and to be gated `global::isManager` at the route-policy layer (per [docs/BSD.md](../docs/BSD.md)'s API Endpoint Reference), but its real-world operational exposure (e.g. whether it is reachable from the public internet vs. an internal-only path) was not independently re-verified against production Forge/Nginx configuration in this pass.
- **`docs/env-vars.md` and `docs/deployment.md` need a follow-up edit pass to remove their stale `apps/dashboard` sections** — flagged here as a correction *note* per this document's own Inconsistencias detectadas section, but actually editing those two pre-existing docs is out of scope for this phase (D-10 requires noting the correction, not rewriting every existing `/docs/*.md` file that references it).
- **Whether other plugin-extension content-types besides `User` exist under `apps/strapi/src/extensions/`:** resolved as "no" per [docs/BSD.md](../docs/BSD.md)'s verification (`extensions/` contains only `users-permissions/`), included here only for cross-reference completeness.
