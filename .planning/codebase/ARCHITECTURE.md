# Architecture

**Analysis Date:** 2026-06-10

## Pattern Overview

**Overall:** Headless CMS monorepo — Strapi as authoritative backend, Nuxt as stateless SSR client

**Key Characteristics:**

- All business logic lives in Strapi (`apps/strapi`). Nuxt apps are pure HTTP clients with no server-side business logic
- Single Nuxt app hosts both public website pages (`/anuncios`, `/pagar`, `/blog`) and admin dashboard pages (`/dashboard/**`) — gated by `dashboard-guard.global.ts` middleware
- Payment gateway is abstracted behind `IPaymentGateway` interface with a registry pattern — swapping gateways is an env-var change (`PAYMENT_GATEWAY`)
- Turbo orchestrates the monorepo build; `waldo-website#build` depends on `waldo-strapi#build`

## Layers

**Nuxt Pages (Presentation):**

- Purpose: Composition-only entry points. Arrange components, fire `useAsyncData`, define page meta. No HTML sections or BEM classes directly.
- Location: `apps/website/app/pages/`
- Contains: `<script setup>` with imports, `useAsyncData`, `definePageMeta`, `useSeoMeta`
- Depends on: Components, Composables, Stores
- Used by: Browser / SSR renderer

**Nuxt Components (UI):**

- Purpose: Reusable Vue components with template + logic + SCSS
- Location: `apps/website/app/components/` (239 files, auto-imported by Nuxt)
- Contains: Feature components (`CreateAd.vue`, `CheckoutDefault.vue`), layout atoms (`ButtonIcon.vue`, `TableDefault.vue`), lightboxes (`LightboxLogin.vue`, `LightboxRegister.vue`)
- Depends on: Composables, Stores, `@nuxtjs/strapi`
- Used by: Pages, other Components

**Nuxt Composables (Shared Logic):**

- Purpose: Reusable reactive logic and Strapi API access wrappers
- Location: `apps/website/app/composables/` (auto-imported by Nuxt)
- Contains: `useApiClient.ts` (reCAPTCHA-injecting fetch wrapper), `useOrderById.ts`, `useAdAnalytics.ts`, `useMeStore`-adjacent helpers
- Depends on: `useStrapiClient` from `@nuxtjs/strapi`, Pinia stores
- Used by: Pages, Components

**Nuxt Stores (State):**

- Purpose: Client-side state across the ad-creation wizard and user session
- Location: `apps/website/app/stores/`
- Contains: `ad.store.ts` (multi-step wizard state), `me.store.ts` (current user profile), `filter.store.ts`, `categories.store.ts`, `regions.store.ts`, `packs.store.ts`, etc.
- Depends on: `useApiClient`, Pinia, `@pinia-plugin-persistedstate/nuxt`
- Used by: Pages, Components

**Nuxt Nitro Server (Proxy / Security Layer):**

- Purpose: Thin server layer for reCAPTCHA verification and image proxying; contains no business logic
- Location: `apps/website/server/`
- Contains: `server/api/recaptcha.ts`, `server/api/images/`, `server/routes/sitemap.xml.ts`, `server/utils/recaptcha.ts`
- Depends on: `h3`, `$fetch`
- Used by: Browser requests that hit `/api/*` on the Nuxt server before proxying to Strapi

**Strapi API Modules (HTTP Interface):**

- Purpose: Route definitions, controller classes (thin HTTP handlers), Strapi core service overrides
- Location: `apps/strapi/src/api/{module}/` — each module has `controllers/`, `routes/`, `services/`, `content-types/` (where applicable)
- Contains: 31 API modules: `ad`, `payment`, `order`, `category`, `region`, `commune`, `subscription-pro`, `subscription-payment`, `article`, `contact`, `faq`, `indicator`, `filter`, `related`, `remaining`, `ad-reservation`, `ad-featured-reservation`, `ad-pack`, `verification-code`, and more
- Depends on: Strapi core, `src/services/`, `src/utils/`
- Used by: External HTTP clients (Nuxt apps, mobile app)

**Strapi Services (Business Logic):**

- Purpose: All external integrations and domain logic — injected into controllers and cron jobs
- Location: `apps/strapi/src/services/` (20 service directories)
- Contains: `payment-gateway/` (abstraction), `transbank/`, `oneclick/`, `facto/`, `zoho/`, `mjml/`, `google/`, `google-analytics/`, `gemini/`, `anthropic/`, `cerebras/`, `groq/`, `deepseek/`, `tavily/`, `serper/`, `better-stack/`, `cloudflare/`, `search-console/`, `slack/`, `weather/`, `indicador/`
- Depends on: External APIs, `strapi.db`, env vars
- Used by: Strapi controllers (`src/api/**`), cron jobs (`src/cron/`)

**Strapi Middlewares (Cross-Cutting):**

- Purpose: Request pipeline interceptors — reCAPTCHA, user registration, image handling, field protection, caching
- Location: `apps/strapi/src/middlewares/`
- Contains: `recaptcha.ts`, `protect-user-fields.ts`, `user-registration.ts`, `upload.ts`, `cache.ts`, `hide-admin-redirect.ts`, `image-uploader.ts`, `image-converter.ts`
- Depends on: Koa `Context`, Strapi services
- Used by: Every incoming request (registered in `apps/strapi/config/middlewares.ts`)

**Strapi Cron Jobs (Scheduled Tasks):**

- Purpose: Daily maintenance — ad expiry, free reservation restore, subscription billing, DB backup, cleanup
- Location: `apps/strapi/src/cron/`
- Contains: `ad-expiry.cron.ts` (1 AM), `ad-free-reservation-restore.cron.ts` (2 AM), `bbdd-backup.cron.ts` (3 AM), `media-cleanup.cron.ts` (Sunday 4 AM), `subscription-charge.cron.ts` (5 AM, `PRO_ENABLE=true` only), `verification-code-cleanup.cron.ts` (4 AM)
- Depends on: Strapi DB, backup utilities, Oneclick service
- Used by: `apps/strapi/config/cron-tasks.ts` scheduler

**Strapi Policies (Authorization):**

- Purpose: Reusable authorization checks attached to specific routes
- Location: `apps/strapi/src/policies/`
- Contains: `isAuthenticated.ts`, `isManager.ts`
- Used by: Route definitions in `src/api/*/routes/`

## Data Flow

**Ad Creation (Paid, Webpay):**

1. User fills multi-step wizard: `apps/website/app/pages/anunciar/*.vue` → state lives in `ad.store.ts`
2. `/anunciar/resumen.vue` calls `POST /api/payments/ad-create` via `useApiClient` (auto-injects reCAPTCHA token)
3. Nuxt Nitro proxy verifies reCAPTCHA token, forwards to Strapi
4. `PaymentController.adCreate` validates payment, calls `adService.create()`, then `adService.processPaidPayment()` → returns Webpay checkout URL + token
5. Browser redirects to Webpay external payment page
6. Webpay POSTs `token_ws` back to `GET /api/payments/ad-response` on Strapi
7. `PaymentController.adResponse` calls `adService.processPaidWebpay(token)`, creates Strapi Order record, generates Facto document, redirects to `${FRONTEND_URL}/pagar/gracias?order={order.documentId}`
8. `/pagar/gracias.vue` calls `useOrderById(documentId)` → `GET /api/payments/thankyou/:documentId` → displays receipt

**Ad Creation (Free):**

1. Same wizard flow as paid
2. `adService.processFreePayment(adId)` activates ad immediately — no Webpay redirect
3. Response returns success, browser navigates to confirmation

**PRO Subscription (Oneclick):**

1. User clicks subscribe → `POST /api/payments/pro-create` → Strapi starts Oneclick inscription, stores `inscription_token` on `subscription-pro` record
2. Browser redirects to Transbank card enrollment page
3. Transbank GETs `/api/payments/pro-response?TBK_TOKEN=...` on Strapi
4. `PaymentController.proResponse` resolves user via `inscription_token`, charges prorated first month, creates `subscription-payment` record, sets `user.pro_status = 'active'`, redirects to `/pro/pagar/gracias?order={documentId}`

**Subscription Renewal (Cron):**

1. `subscriptionChargeCron` fires at 5 AM → `SubscriptionChargeService.chargeExpiredSubscriptions()`
2. Queries `subscription-payment` records where `period_end < now`, charges via Oneclick, creates new `subscription-payment` record with next `period_end`, retries on days 1 and 3, deactivates after 3 consecutive failures

**State Management:**

- `ad.store.ts`: multi-step wizard state held in memory during session (not persisted)
- `me.store.ts`: current user profile loaded on demand via `useApiClient`
- Catalog stores (`categories.store.ts`, `regions.store.ts`, `packs.store.ts`): fetched from Strapi with cache guards (`lastFetch: 0`, TTL check `Date.now() - lastFetch < TTL`)
- Stores with `persist:` have an inline audit comment (`// persist: CORRECT|REVIEW|RISK — <rationale>`) directly above the key

## Key Abstractions

**IPaymentGateway:**

- Purpose: Interface isolating payment gateway implementations from consuming code
- Files: `apps/strapi/src/services/payment-gateway/types/gateway.interface.ts`, `apps/strapi/src/services/payment-gateway/adapters/transbank.adapter.ts`
- Pattern: Registry in `apps/strapi/src/services/payment-gateway/registry.ts` reads `PAYMENT_GATEWAY` env var and instantiates the correct adapter via factory map

**Service Directories (Strapi):**

- Purpose: Each external integration is an isolated service directory with `index.ts` barrel re-export — consumers import from `index.ts` only, never from individual files
- Examples: `apps/strapi/src/services/zoho/`, `apps/strapi/src/services/facto/`, `apps/strapi/src/services/transbank/`
- Pattern: `{service}.service.ts` + `{service}.types.ts` + `{service}.factory.ts` + `index.ts`

**useApiClient:**

- Purpose: Drop-in replacement for `useStrapiClient()` that auto-injects `X-Recaptcha-Token` on all POST/PUT/DELETE requests; falls back gracefully when reCAPTCHA is unavailable (SSR, adblocker)
- File: `apps/website/app/composables/useApiClient.ts`
- Pattern: Used everywhere in composables and stores instead of raw `useStrapiClient()`

**PaymentController:**

- Purpose: Orchestrates the full payment lifecycle — ad creation, Webpay response handling, Pro subscription enrollment, order creation, Facto document generation
- File: `apps/strapi/src/api/payment/controllers/payment.ts`
- Pattern: Class with `controllerWrapper` for consistent error handling; each method is a self-contained flow. Order identity always uses Strapi `order.documentId`, never payment gateway references.

## Entry Points

**Nuxt SSR (website):**

- Location: `apps/website/nuxt.config.ts`, `apps/website/app/app.vue`
- Triggers: HTTP request to Vercel serverless function
- Responsibilities: SSR render, hydration, Nitro API proxy routes

**Strapi API Server:**

- Location: `apps/strapi/config/` (bootstrap and configuration), `apps/strapi/src/bootstrap/`
- Triggers: HTTP request to Strapi server
- Responsibilities: REST API endpoints, admin panel, cron job scheduling

**Key Public Pages:**

- `apps/website/app/pages/index.vue` — home page with SSR-loaded categories, packs, FAQs
- `apps/website/app/pages/anunciar/index.vue` — ad creation wizard entry point
- `apps/website/app/pages/pagar/index.vue` — checkout entry point (requires `auth` middleware)
- `apps/website/app/pages/[slug].vue` — ad detail page (dynamic route)
- `apps/website/app/pages/anuncios/index.vue` — ad catalog listing

**Key Admin Pages:**

- `apps/website/app/pages/dashboard/ads/index.vue` — ad moderation (requires `manager` role)
- `apps/website/app/pages/dashboard/maintenance/` — catalog maintenance (categories, regions, packs, FAQs, etc.)

**Global Middleware:**

- `apps/website/app/middleware/dashboard-guard.global.ts` — blocks `/dashboard/**` for non-manager users
- `apps/website/app/middleware/onboarding-guard.global.ts` — redirects users with incomplete profiles
- `apps/website/app/middleware/referer.global.ts` — tracks referer for analytics

## Error Handling

**Strategy:** Fail-fast in controllers with structured JSON responses; payment failures redirect to dedicated error pages

**Patterns:**

- Strapi `PaymentController` wraps every handler in `controllerWrapper` — catches all exceptions, returns `{ success: false, message }` with HTTP 400
- Webpay cancellation/rejection: redirect to `${FRONTEND_URL}/pagar/error?reason=cancelled|rejected`
- PRO cancellation/rejection: redirect to `${FRONTEND_URL}/pro/error?reason=cancelled|rejected|charge-failed`
- Nuxt pages: `createError()` for SSR errors propagated to error page; `useOrderById` re-throws with status codes
- Cron jobs: log errors via Logtail `logger.error()`, continue processing remaining records (non-fatal per-record failures)
- Facto document generation in payment flow is wrapped in try/catch — failure is non-fatal (order is still created, charge succeeded)

## Cross-Cutting Concerns

Logging: Logtail via `apps/strapi/src/utils/logtail/` — imported as `logger` and used as `logger.info/warn/error` throughout Strapi controllers and services. Structured key-value payloads always included.

Validation:

- reCAPTCHA v3 enforced at two layers: Strapi middleware (`src/middlewares/recaptcha.ts`) for auth endpoints; Nitro server (`server/utils/recaptcha.ts`) for all other mutating requests
- `useApiClient` on the frontend automatically injects the token — callers do not need to manage it
- Mobile app bypass: requests with valid `X-Mobile-App-Api-Key` header skip reCAPTCHA (constant-time comparison)

Authentication: `@nuxtjs/strapi` JWT stored in cookies. Nuxt route middleware (`auth.ts`, `dashboard-guard.global.ts`) guards protected routes. Strapi `users-permissions` plugin handles JWT issuance and validation. `protect-user-fields.ts` middleware blocks direct writes to sensitive user fields from external callers.

---

Architecture analysis: 2026-06-10
