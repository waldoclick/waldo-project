---
gsd_state_version: 1.0
milestone: v1.22
milestone_name: Checkout Flow UI
status: shipped
stopped_at: Milestone closed
last_updated: "2026-03-08T22:00:00.000Z"
last_activity: 2026-03-08 — v1.22 milestone closed (Phase 53 shipped; Phase 54 deferred)
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08 after v1.22)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.22 shipped — ready to start next milestone

## Current Position

Phase: — (no active phase)
Plan: —
Status: v1.22 closed — Phase 53 shipped, Phase 54 (redirect wiring from resumen.vue / BuyPack.vue) deferred to next milestone
Last activity: 2026-03-08 — v1.22 Checkout Flow UI milestone closed

## Accumulated Context

### Decisions

All decisions from v1.1–v1.22 planning are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.9**: `typeCheck: true` permanently enabled in both apps
- [Phase 33-34]: GTM delivered via `@saslavik/nuxt-gtm` module in both apps
- **v1.15**: `$setSEO` derives ogTitle/ogDescription from title/description — zero call-site changes when extending plugin
- **v1.15**: `key: "structured-data"` on useHead script entry prevents JSON-LD accumulation on SPA nav
- **v1.15**: `useSeoMeta({ robots: "noindex, nofollow" })` for private page noindex defense-in-depth
- **v1.16**: `descPart` leading-space pattern eliminates double-space when ad description is null
- **v1.16**: `descPrefix`/`descSuffix` split for budget-aware ad description slicing
- **v1.17**: Use `strapi.db.query` to bypass content-API sanitizer for server-enforced role filtering
- **v1.17**: Use `dsn: undefined` pattern (not conditional init) in sentry.*.config.ts
- **v1.18**: `stepRoutes` Record map pattern for wizard step-to-URL routing in `CreateAd.vue`
- **v1.18**: Per-page analytics — each wizard step page owns its own `stepView` in `onMounted`; no centralized watcher
- **v1.18**: `if (import.meta.server) return;` is mandatory first line of any client-only middleware reading a localStorage-backed store
- **v1.19**: Floating promise pattern for any Zoho sync inside a redirect handler — capture variables before `Promise.resolve().then()`
- **v1.19**: First-publish guard pattern: `isPending` check before firing any "ad published" side effects
- **v1.19**: Zoho stage names must match CRM pipeline exactly — validate before hardcoding
- **v1.20**: AdQueryOptions interface for ad service methods; `unknown` + narrowing replaces `any` everywhere in Strapi
- **v1.20**: Data double-cast `as unknown as Parameters<...>[1]['data']` for entityService JSON fields
- **v1.21**: `publishAd(adId)` helper — any payment confirmation path MUST call it to set `draft: false`
- **v1.21**: Endpoint domain belongs with the entity, not the trigger — `/api/ads/save-draft` not `/api/payments/ad-draft`
- **v1.21**: Plan the full lifecycle of a new boolean field — `default: true` requires explicitly planning the flip to `false`
- **v1.21**: New Strapi endpoints require manual permission setup in admin panel — document as deploy step in plan
- **v1.22**: `/pagar` is the central payment page — all flows with `hasToPay === true` must redirect here
- **v1.22**: `PaymentAd` pattern — ad preview as first checkout element gives user context before paying

### Pending Todos

- Phase 54 (redirect wiring): `resumen.vue` and `BuyPack.vue` must redirect to `/pagar` when `hasToPay === true`; payment logic to move into `CheckoutDefault`

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-08
Stopped at: Milestone v1.22 closed
Resume with: `/gsd-progress` to assess next milestone
