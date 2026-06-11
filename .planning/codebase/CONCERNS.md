# Codebase Concerns

**Analysis Date:** 2026-06-10

---

## Tech Debt

**Stale project documentation after dashboard merge (phase 125):**
- Issue: `AGENTS.md` / `CLAUDE.md` still describe a 3-app monorepo (`apps/website`, `apps/dashboard`, `apps/strapi`). `docs/deployment.md` still lists a separate Dashboard Forge site at port 3001 with its own PM2 process and `ecosystem.config.cjs`. `pnpm-workspace.yaml` was updated to 2 apps, but prose docs were not. Future agents reading these docs will try to deploy or reference a non-existent `apps/dashboard` app.
- Files: `AGENTS.md`, `docs/deployment.md`, `docs/env-vars.md`
- Impact: Incorrect deployment runbooks, stale env var docs, confusing onboarding for future agents
- Fix approach: Update all three docs — change "three apps" to "two apps", remove Dashboard Forge/PM2 entry from deployment docs, remove Dashboard section from `docs/env-vars.md`

**Mixed `strapi.db.query` / `strapi.service` API access — `strapi.documents` (v5 Document Service) never used:**
- Issue: 128+ calls use `strapi.db.query` (low-level v4 API) across payment utils, cron jobs, controllers, and the ad service. `strapi.service` calls also coexist. The Strapi v5 Document Service (`strapi.documents(...)`) is never used. Many write operations still use `where: { id: numericId }` despite AGENTS.md instructing `documentId` preference.
- Files: `apps/strapi/src/api/payment/utils/ad.utils.ts`, `apps/strapi/src/api/ad/services/ad.ts`, `apps/strapi/src/cron/ad-expiry.cron.ts`, `apps/strapi/src/cron/subscription-charge.cron.ts`, `apps/strapi/src/api/order/controllers/order.ts`
- Impact: Bypasses Strapi v5 lifecycle hooks and draft/publish system; numeric `id` writes may break as Strapi v5 migrates content to `documentId` as primary key
- Fix approach: Migrate write operations to `strapi.documents(uid)` calls; convert `where: { id }` to `documentId` lookups per AGENTS.md rules; read-only queries can stay on `strapi.db.query` temporarily

**Hardcoded fallback prices scattered across payment services:**
- Issue: `AD_FEATURED_PRICE` fallback `10000` (CLP) appears in 7 different places. `duration_days: 15` / `remaining_days: 15` are hardcoded in ad creation rather than derived from the pack record (correctly derived in `checkout.service.ts:268` and `free-ad.service.ts:42` — but not everywhere).
- Files: `apps/strapi/src/api/payment/services/checkout.service.ts` (5 occurrences), `apps/strapi/src/api/payment/services/ad.service.ts:346`, `apps/strapi/src/api/payment/utils/general.utils.ts:74`, `apps/strapi/src/api/payment/utils/ad.utils.ts:48`, `apps/strapi/src/api/ad/services/ad.ts:1197`
- Impact: Price changes require touching 7+ files; duration inconsistencies if pack data differs from hardcoded 15
- Fix approach: Create a single `PAYMENT_CONSTANTS` module; derive `duration_days` from pack record's `total_days` field uniformly

**Hardcoded fallback admin email exposes development address in production:**
- Issue: `process.env.ADMIN_EMAILS || "waldo.development@gmail.com"` is the fallback in 5 separate production files. If `ADMIN_EMAILS` is unset, contact form submissions, expiry alerts, and ad-approval emails are silently routed to a development inbox.
- Files: `apps/strapi/src/cron/ad-expiry.cron.ts:139`, `apps/strapi/src/cron/ad-free-reservation-restore.cron.ts:84`, `apps/strapi/src/api/contact/services/contact.service.ts:85`, `apps/strapi/src/api/payment/services/ad.service.ts:236`, `apps/strapi/src/api/payment/services/free-ad.service.ts:66`
- Impact: Production data leakage to dev inbox; missed operational alerts
- Fix approach: Validate `ADMIN_EMAILS` at Strapi bootstrap; throw if unset in production instead of silently falling back

**OneClick service used directly by cron and cancellation — outside the payment gateway registry:**
- Issue: `OneclickService` is instantiated directly in `subscription-charge.cron.ts`, `pro-cancellation.service.ts`, and `payment.ts` controller. The `IPaymentGateway` registry in `services/payment-gateway/registry.ts` only contains `transbank` for Webpay Plus. Recurring PRO charges (the most critical billing path) run on OneClick with no gateway abstraction, no `GATEWAY_FACTORIES` registration, and no `GATEWAY_ENV_REQUIREMENTS` validation.
- Files: `apps/strapi/src/services/payment-gateway/registry.ts`, `apps/strapi/src/cron/subscription-charge.cron.ts:360`, `apps/strapi/src/api/payment/services/pro-cancellation.service.ts:36`, `apps/strapi/src/api/payment/controllers/payment.ts:425`
- Impact: No startup validation of `ONECLICK_COMMERCE_CODE`/`ONECLICK_API_KEY`; gateway abstraction is incomplete — any future gateway swap for subscriptions bypasses the standard pattern
- Fix approach: Either register an `OneclickAdapter` implementing `IPaymentGateway` in the registry, or add env var validation in bootstrap for OneClick credentials

**`wepbayResponse` typo in pack service and ad service:**
- Issue: Variable named `wepbayResponse` (should be `webpayResponse`) is used consistently throughout `pack.service.ts` and appears at `ad.service.ts:323`. The typo is harmless at runtime but makes code searches unreliable.
- Files: `apps/strapi/src/api/payment/services/pack.service.ts`, `apps/strapi/src/api/ad/services/ad.ts:323`
- Impact: Grep for `webpayResponse` misses these occurrences
- Fix approach: Rename during next refactor of pack service; update all references atomically

**`console.log(error)` swallows stack traces in payment utility catch blocks:**
- Issue: `apps/strapi/src/api/payment/utils/ad.utils.ts` uses bare `console.log(error)` at 7 catch sites (lines 56, 83, 115, 140, 165, 187, 210), then rethrows with `new Error(error.message)`. This drops the original stack trace and never reaches the structured Logtail logger.
- Files: `apps/strapi/src/api/payment/utils/ad.utils.ts`
- Impact: Stack traces lost for payment failures; Logtail/BetterStack receives no structured log for these error paths
- Fix approach: Replace `console.log(error)` with `logger.error(...)` using `apps/strapi/src/utils/logtail/index.ts` — same pattern used correctly in `payment.ts` controller

**`console.log` in `userUpdateController` exposes user state object in logs:**
- Issue: `apps/strapi/src/extensions/users-permissions/controllers/userUpdateController.ts:14` logs `"Update User Data:"` with the full `ctx.state.user` spread on every profile update, which likely includes email, phone, and session fields.
- Files: `apps/strapi/src/extensions/users-permissions/controllers/userUpdateController.ts`
- Impact: PII in server logs / Logtail
- Fix approach: Remove log entirely or replace with a structured log emitting only `userId` and changed field names

**Website stores with `persist: RISK` — no TTL guard against stale data:**
- Issue: `ads.store.ts` (search results) and `related.store.ts` (per-ad related listings) carry `// persist: RISK` audit comments — the team's own marker that TTL guards are needed. Neither has a `lastFetch`/TTL guard matching the pattern required by AGENTS.md. `communes.store.ts` carries `// persist: REVIEW` with no TTL. `app.store.ts` persists volatile UI state (`isMobileMenuOpen`).
- Files: `apps/website/app/stores/ads.store.ts`, `apps/website/app/stores/related.store.ts`, `apps/website/app/stores/communes.store.ts`, `apps/website/app/stores/app.store.ts`
- Impact: Users see stale deleted/expired ads after page refresh; related listings for a different ad persist across navigation; commune list can go stale indefinitely
- Fix approach: Add `lastFetch: 0` + TTL guard to `ads.store.ts` and `related.store.ts`; remove `isMobileMenuOpen` from `app.store.ts` persist scope; add TTL guard to `communes.store.ts`

---

## Known Bugs

**17 pre-existing test failures in website test suite:**
- Symptoms: `FormLogin`, `useLogout`, `useOrderById`, `recaptcha-proxy`, `ResumeOrder` tests fail. Documented in `125-07-SUMMARY.md` as genuine pre-existing stubs — missing `vi.stubGlobal` for Nuxt auto-imports (`useSweetAlert2`, `createError`) and component-test assertion mismatches. Phase 125 VALIDATION doc remains `status: draft / wave_0_complete: false`.
- Files: `apps/website/tests/components/FormLogin.website.test.ts`, `apps/website/tests/composables/useLogout.test.ts`, `apps/website/tests/composables/useOrderById.test.ts`, `apps/website/tests/server/recaptcha-proxy.test.ts`, `apps/website/tests/components/ResumeOrder.test.ts`
- Trigger: `pnpm test --filter waldo-website`
- Workaround: Tests are skipped in CI; fix requires adding `vi.stubGlobal` for Nuxt composables in affected test setups

---

## Security Considerations

**`frameguard` disabled — no `X-Frame-Options` header on Strapi:**
- Risk: `config/middlewares.ts:34` sets `frameguard: false`, removing the `X-Frame-Options` header. The CSP in the same file does not include a `frame-ancestors` directive. Without either, Strapi admin can potentially be iframed.
- Files: `apps/strapi/config/middlewares.ts`
- Current mitigation: Strapi admin is behind authentication; anonymous clickjacking attack surface is limited
- Recommendations: Re-enable `frameguard` or add explicit `frame-ancestors 'none'` to the CSP directives

**`'unsafe-inline'` in Strapi admin CSP `script-src`:**
- Risk: `apps/strapi/config/middlewares.ts:18` includes `'unsafe-inline'` in `script-src`. Widens XSS attack surface.
- Files: `apps/strapi/config/middlewares.ts`
- Current mitigation: Required for Strapi admin UI; cannot be removed without upstream Strapi changes
- Recommendations: Accept as Strapi-imposed constraint; document explicitly so it is not removed accidentally

**`buy_order` encodes `userId` — information passed to Transbank:**
- Risk: `buy_order` is formatted as `order-{userId}-{packId}-{adId}-{featuredFlag}-{invoiceFlag}`. This encodes internal Strapi user IDs in a field visible to Transbank and in Webpay transaction logs.
- Files: `apps/strapi/src/api/payment/services/checkout.service.ts`, `apps/strapi/src/api/payment/services/pack.service.ts`
- Current mitigation: Webpay has a 26-character limit on `buy_order`; field is audit-only per AGENTS.md
- Recommendations: Consider replacing with an opaque short reference or hash; validate `buy_order.length <= 26` before submitting

**Dev login credential check uses plain `===` comparison:**
- Risk: `apps/website/server/api/dev-login.post.ts:28` cookie is `httpOnly: false` (required for the JS middleware guard) and credential check is plain `===` (not constant-time). The recaptcha middleware uses `crypto.timingSafeEqual` for API keys.
- Files: `apps/website/server/api/dev-login.post.ts`, `apps/website/app/middleware/dev.global.ts`
- Current mitigation: Gate is only active when `DEV_MODE=true`; `devPassword` is server-only runtime config
- Recommendations: Low priority; add `timingSafeEqual` to match the pattern in `recaptcha.ts` for consistency

---

## Performance Bottlenecks

**Unbounded `limit: -1` queries in hot paths and crons:**
- Problem: `strapi.db.query(...).findMany({ limit: -1 })` is used in 14+ locations: category controller (public endpoint), subscription charge cron (all active PRO users), ad-expiry cron, media-cleanup cron, order export, and ad sort-priority recalculation. No pagination or cursor-based batching.
- Files: `apps/strapi/src/api/category/controllers/category.ts:96`, `apps/strapi/src/cron/subscription-charge.cron.ts` (lines 81, 122, 159, 203, 250, 280), `apps/strapi/src/cron/ad-expiry.cron.ts:48`, `apps/strapi/src/api/payment/controllers/payment.ts:659`, `apps/strapi/src/api/payment/utils/general.utils.ts:153`
- Cause: Convenience pattern from early development not revisited as data grows
- Improvement path: Refactor cron jobs to cursor-based batching (100 records per iteration); add hard cap on category endpoint; `limit: -1` on public category endpoint is highest immediate risk

**Proxy does not forward `X-Cache` / `Cache-Control` to browser:**
- Problem: `apps/website/server/api/[...].ts` uses `proxyRequest` which does not preserve `X-Cache` or `Cache-Control` headers from Strapi's Redis cache middleware. Redis caching works on Strapi but browsers and Cloudflare CDN never see `s-maxage` directives.
- Files: `apps/website/server/api/[...].ts`, `apps/strapi/src/middlewares/cache.ts`
- Cause: `proxyRequest` (H3/Nitro) strips response headers; explicit forwarding not implemented
- Improvement path: Add explicit header forwarding in the proxy handler: read `X-Cache` and `Cache-Control` from Strapi's response and set them on the Nitro event response

**Redis disabled by default (`REDIS_ENABLED=false`) — no alerting when absent:**
- Problem: `apps/strapi/src/middlewares/cache.ts` silently falls through to `next()` when Redis is unavailable. When `REDIS_ENABLED=true` but Redis is unreachable, each request attempts `initRedis()`, hits `console.error("[Cache] Redis not available")`, and continues — with no Sentry event or Logtail alert.
- Files: `apps/strapi/src/middlewares/cache.ts`
- Cause: Intentional graceful degradation but with no observability on degraded state
- Improvement path: Send a Logtail structured log event (not `console.error`) when Redis is enabled but unavailable; suppress repeated alerts with a flag

**`pageSize: 1000` fetches for communes and regions:**
- Problem: `communes.store.ts` and `regions.store.ts` both use `pageSize: 1000` on initial load, loading all geographic data into memory at startup. No lazy loading or pagination.
- Files: `apps/website/app/stores/communes.store.ts`, `apps/website/app/stores/regions.store.ts`
- Cause: Geographic data is small today but the pattern does not scale; also bypasses Redis cache because the fetch is made from the Nuxt client, not proxied
- Improvement path: Accept as acceptable for the current dataset size (~350 communes); add a TTL guard to avoid re-fetching on every session

**Sentry at 100% traces and profiles sample rate in Strapi production:**
- Problem: `apps/strapi/config/plugins.ts` sets `tracesSampleRate: 1.0` and `profilesSampleRate: 1.0`. At scale, 100% tracing adds per-request overhead and high Sentry quota consumption.
- Files: `apps/strapi/config/plugins.ts`
- Cause: Convenience default not tuned post-launch
- Improvement path: Reduce to `tracesSampleRate: 0.1` once baseline performance is established

---

## Fragile Areas

**Payment controller (`payment.ts`) — 757 lines handling 4 distinct payment flows:**
- Files: `apps/strapi/src/api/payment/controllers/payment.ts`
- Why fragile: Handles Webpay Plus ad flow, Webpay Plus pack flow, OneClick PRO inscription, OneClick PRO charge, and the checkout unified flow — all in one controller. Each flow directly reads `process.env` values (`FRONTEND_URL`, `PAYMENT_GATEWAY`, `PRO_MONTHLY_PRICE`) instead of using config helpers.
- Safe modification: Changes to any one flow risk side effects in others; always run the full `apps/strapi/tests/api/payment/` suite. Do not add new payment flows without extracting existing ones into separate service methods.
- Test coverage: Controller routing is tested; `checkout.service.ts` and `free-ad.service.ts` have no dedicated unit tests — only mocked in the controller test

**Ad service (`ad.ts`) — 1251 lines:**
- Files: `apps/strapi/src/api/ad/services/ad.ts`
- Why fragile: Contains ad creation, approval, rejection, draft flow, status computation (`computeAdStatus`), sort priority recalculation, and all query methods. `computeAdStatus` uses a complex multi-field heuristic (`active`, `rejected`, `banned`, `remaining_days`, `ad_reservation` presence) that breaks with schema changes.
- Safe modification: `computeAdStatus` logic is tested in `apps/strapi/tests/api/ad/services/ad.compute-status.test.ts` — always run this test when modifying status flags. Schema field changes must be reflected in both the service and the test.
- Test coverage: Status computation, sort priority, approval, and Zoho integration are tested; full controller HTTP layer is not

**Subscription charge cron — critical billing, no batching, 494 lines:**
- Files: `apps/strapi/src/cron/subscription-charge.cron.ts`
- Why fragile: Runs daily at 5 AM when `PRO_ENABLE=true`. Uses 6 `limit: -1` queries loading all PRO users and subscription records into memory simultaneously. Any uncaught exception aborts the entire batch — no per-user error isolation beyond the top-level try/catch.
- Safe modification: Add a dry-run flag before making any changes; test with a small `PRO_USER_BATCH_LIMIT` env var before deploying batching refactor
- Test coverage: Cron logic is tested in `apps/strapi/tests/cron/subscription-charge.cron.test.ts` but mocks all DB calls; real-volume behavior untested

**`image-uploader` and `image-converter` Strapi middlewares commented out — Cloudinary status unclear:**
- Files: `apps/strapi/config/middlewares.ts` (commented lines), `apps/strapi/config/plugins.ts`
- Why fragile: `// "global::image-uploader"` and `// "global::image-converter"` are commented out "para pruebas con Cloudinary" but `plugins.ts` still sets `upload.provider: "local"`. If Cloudinary was intended to replace local storage, the migration was never completed. If local was a deliberate choice, the commented middlewares are dead code.
- Safe modification: Clarify intent: either remove the middleware files and the commented config, or complete the Cloudinary migration
- Test coverage: No tests cover the upload middleware behavior

---

## Scaling Limits

**Subscription charge cron — unbounded memory usage grows with PRO user count:**
- Current capacity: Works for the current PRO user count
- Limit: At ~500-1000 PRO users, loading all users + subscription records + pending invoices into RAM simultaneously during a single cron window will cause memory pressure or OOM
- Scaling path: Refactor to cursor-based pagination — fetch 100 users per iteration, process each batch, loop until done

**`buy_order` field — Webpay 26-character limit not enforced in code:**
- Current capacity: Safe for current ID ranges
- Limit: `order-{userId}-{packId}-{adId}-{featuredFlag}-{invoiceFlag}` — if any ID grows to 5+ digits, combined string approaches or exceeds 26 chars
- Scaling path: Add `if (buyOrder.length > 26) throw` validation before Webpay submission; consider shorter encoding

---

## Missing Critical Features

**`checkout.service.ts`, `free-ad.service.ts`, `pro.service.ts` — no standalone unit tests:**
- Problem: These three services handle the unified checkout flow, free-ad credit redemption, and PRO subscription creation — all critical payment paths. They are exercised only through mocks in the controller test.
- Blocks: Confident refactoring of `checkout.service.ts` (458 lines) or `pro.service.ts`
- Files: `apps/strapi/src/api/payment/services/checkout.service.ts`, `apps/strapi/src/api/payment/services/free-ad.service.ts`, `apps/strapi/src/api/payment/services/pro.service.ts`

---

## Test Coverage Gaps

**Website: 17 known test failures (pre-existing, per 125-07 summary — not independently re-run):**
- What's not tested: `FormLogin` interaction, `useLogout` composable, `useOrderById` composable, server recaptcha proxy, `ResumeOrder` rendering
- Files: `apps/website/tests/components/FormLogin.website.test.ts`, `apps/website/tests/composables/useLogout.test.ts`, `apps/website/tests/composables/useOrderById.test.ts`, `apps/website/tests/server/recaptcha-proxy.test.ts`, `apps/website/tests/components/ResumeOrder.test.ts`
- Risk: Login and order retrieval regressions go undetected
- Priority: High

**Website: Large dashboard components have no component-level tests:**
- What's not tested: `ChartSales.vue` (390 lines), `AdsTable.vue` (218 lines), `FormCreateFour.vue` (378 lines), `LightBoxArticles.vue` (462 lines) — all migrated from the deleted `apps/dashboard`, no tests in `apps/website/tests/`
- Files: `apps/website/app/components/ChartSales.vue`, `apps/website/app/components/AdsTable.vue`, `apps/website/app/components/FormCreateFour.vue`, `apps/website/app/components/LightBoxArticles.vue`
- Risk: No regression protection for core dashboard UI
- Priority: Medium — `AdsTable.vue` is highest risk (complex filtering + pagination)

**Strapi: ~29 test files covering ~70 logic files (services + controllers + utils):**
- What's not tested: `checkout.service.ts`, `free-ad.service.ts`, `pro.service.ts`, ad controller HTTP layer (`apps/strapi/src/api/ad/controllers/ad.ts`), contact service, all CRUD controllers (region, commune, category, faq, term, indicator)
- Files: `apps/strapi/src/api/payment/services/checkout.service.ts`, `apps/strapi/src/api/payment/services/free-ad.service.ts`, `apps/strapi/src/api/ad/controllers/ad.ts`
- Risk: Payment flow regressions; API breakage on schema changes
- Priority: High for checkout and free-ad services; Medium for CRUD controllers

---

*Concerns audit: 2026-06-10*
