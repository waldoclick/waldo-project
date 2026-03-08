---
gsd_state_version: 1.0
milestone: v1.23
milestone_name: Unified Payment Flow
status: planning
stopped_at: Completed 055-03-PLAN.md
last_updated: "2026-03-08T22:58:54.596Z"
last_activity: 2026-03-08 — Roadmap created (Phases 55-57)
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 3
  completed_plans: 3
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08 after v1.23 start)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.23 Unified Payment Flow — Phase 55: Store Unification

## Current Position

Phase: 55 — Store Unification (not started)
Plan: —
Status: Ready to plan
Last activity: 2026-03-08 — Roadmap created (Phases 55-57)

```
Progress: [░░░░░░░░░░] 0/3 phases complete
```

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
- **v1.22**: `CheckoutDefault.vue` owns full payment logic — `resumen.vue` is review/redirect only
- **v1.23**: Pack purchase uses `adStore` — `packs.store.ts` eliminated; `adStore.ad.ad_id` presence determines if ad is part of the payment
- [Phase 055-01]: Module-level ref + lastFetch pattern for composable-level caching (no Pinia) — Avoids Pinia overhead when state is non-persistent; same TTL semantics as packs.store
- [Phase 55-store-unification]: anunciar/index.vue returns packs from useAsyncData as initData for SSR hydration — initData.value?.packs safe in onMounted
- [Phase 55-store-unification]: gracias.vue: useAsyncData key renamed to 'packs-gracias-pack'; packData computed eliminates (as any) template casts; ads_count field corrected to total_ads
- [Phase 55-store-unification]: Stub-then-delete pattern: remove store imports from last consumer (comprar.vue) before deleting packs.store.ts to keep nuxt typecheck passing — the file is deleted in Phase 56 anyway

### v1.23 Phase Map

| Phase | Goal | Requirements | Status |
|-------|------|--------------|--------|
| 55. Store Unification | `packs.store.ts` eliminated; pack data loaded directly where needed | PAY-04, CLN-02 | Not started |
| 56. Pack Purchase Flow | `/packs` "Comprar" → `adStore` write + navigate to `/pagar`; `/packs/comprar` + `BuyPack.vue` removed | PACK-01, PACK-02, PACK-03, CLN-01 | Not started |
| 57. Payment Hub Adaptation | `/pagar` works for pack-only and pack+ad; `FormCheckout` hides reservation options in pack-only | PAY-01, PAY-02, PAY-03 | Not started |

### Key Context for v1.23 Implementation

- `packs.store.ts` is currently used by: `PaymentMethod.vue` (FormCheckout), `packs/index.vue`, `packs/comprar.vue`
- `BuyPack.vue` is the component inside `packs/comprar.vue` that handles pack purchase — both deleted together
- `/pagar` currently only handles the ad+pack flow (expects `adStore.ad.ad_id`); pack-only requires adapting `CheckoutDefault.vue`
- `adStore` already has `pack` field (PackType) — pack selection from `/packs` writes to `adStore.pack`
- `FormCheckout` already passes `:hide-free="true"` to `PaymentMethod` — pack-only flow needs similar condition to hide reservation sections
- `publishAd()` in `CheckoutDefault.vue` must be guarded: call only when `adStore.ad.ad_id` is set

### Pending Todos

None.

### Blockers/Concerns

- Whether the Strapi `payments/ad` endpoint requires `ad` in the payload for pack-only calls — may need to verify at implementation time (PAY-01). Endpoint signature changes are out of scope unless strictly required (per REQUIREMENTS.md Out of Scope).

## Session Continuity

Last session: 2026-03-08T22:58:49.267Z
Stopped at: Completed 055-03-PLAN.md
Resume with: `/gsd-plan-phase 55`
