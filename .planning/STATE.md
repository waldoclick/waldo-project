---
gsd_state_version: 1.0
milestone: v1.12
milestone_name: Ad Creation Analytics Gaps
status: defining-requirements
stopped_at: REQUIREMENTS.md defined — ready for Phase 32 plan
last_updated: "2026-03-07T14:00:00.000Z"
last_activity: 2026-03-07 — v1.12 milestone started, requirements ANA-01 to ANA-05 defined
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 1
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.12 — Ad Creation Analytics Gaps

## Current Position

Phase: 32 — Analytics Gaps Cleanup (not yet started)
Plan: 0 of 1 complete
Status: defining-requirements — requirements defined, Phase 32 plan not yet created
Last activity: 2026-03-07 — v1.12 milestone started, requirements ANA-01 to ANA-05 defined

```
[░░░░░░░░░░] 0% — 0/1 phases complete (v1.12)
```

## Accumulated Context

### Decisions

All decisions from v1.1–v1.11 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.5**: Reservation freeing updates reservation side (FK lives on reservation), not ad side
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.7 cron pattern**: class-based service, `logger` from `../utils/logtail`, per-item try/catch inside user loop
- **v1.8**: Free ad reservations stay permanently linked to their ad when it expires — never unlinked
- **v1.8**: `restoreUserFreeReservations` counts pool as: `ad=null` + `ad.active=true`
- **v1.8**: Cron parallelization pattern — `Promise.all` in batches of 50
- [Phase 25]: useAsyncData key naming pattern: '<page>-<data>' for static pages, 'page-${param}' for dynamic routes
- [Phase 25]: Strapi route ordering: specific paths must always be registered BEFORE wildcard param routes
- [Phase 26]: Parent-page preload pattern: useAsyncData at page level fills stores before child components mount
- [Phase 26]: watch({ immediate: true }) for multi-parent components — avoids duplicating fetch logic
- [Phase 26]: onMounted classification format: `// onMounted: UI-only|analytics-only|client-only fetch — [reason]`
- [Phase 27]: AdWithPriceData extends Omit<Ad, fields> pattern for page-level API response types
- [Phase 27]: Inline interface pattern for useAsyncData return shapes — defined locally in page file
- [Phase 28]: persist audit comment classification: 9 CORRECT, 3 REVIEW, 2 RISK
- [Phase 28]: Strapi SDK filter type cast pattern: `filters: { ... } as unknown as Record<string, unknown>`
- [Phase 29]: window.d.ts consolidates all Window globals
- [Phase 29]: StrapiUser augmented in strapi.d.ts
- [Phase 29]: useAsyncData default option eliminates T | undefined
- [Phase 29]: typeCheck: true is now the permanent setting
- [Phase 30]: getBuyerName wrapper pattern — formatFullName takes (firstname, lastname) separately; wrapper adds username/email fallback chain for OrderUser objects
- [Phase 31-gtm-plugin-consent-mode-v2]: Removed gtag() shim entirely — all dataLayer interactions use direct window.dataLayer.push() with plain objects
- [Phase 31-gtm-plugin-consent-mode-v2]: Consent Mode v2: push default denial before GTM script injection; LightboxCookies pushes update command (flat structure) on user acceptance

### v1.12 Requirements

- **ANA-01**: Remove dead `useAdAnalytics` import and instantiation from `CreateAd.vue` (lines 60–63) — imported and instantiated but never called
- **ANA-02**: Fix `step_view` overcounting in `index.vue` — remove `immediate: true` from `watch(adStore.step)`; fire step 1 explicitly in `onMounted` after URL param is applied (currently in `CreateAd.vue`)
- **ANA-03**: Add `redirect_to_payment` event in `resumen.vue` `handlePayClick` — push `pushEvent("redirect_to_payment", [], { payment_method: "webpay" })` just before `handleRedirect()` when Webpay URL is present
- **ANA-04**: Guard `purchase` event in `gracias.vue` `watchEffect` with a `fired` ref — ensure event fires exactly once even if `watchEffect` re-runs
- **ANA-05**: Export `DataLayerEvent` interface from `useAdAnalytics.ts`; declare it in `window.d.ts`; type `window.dataLayer` as `DataLayerEvent[]` instead of `unknown[]`

### Codebase Context (v1.12 scope)

Key files:
- `apps/website/app/components/CreateAd.vue` — dead import at lines 60–63 (ANA-01)
- `apps/website/app/pages/anunciar/index.vue` — `watch(adStore.step, ..., { immediate: true })` at line 194 (ANA-02); note: URL param restoration happens in `CreateAd.vue` `onMounted`, not in index.vue
- `apps/website/app/pages/anunciar/resumen.vue` — `handlePayClick` at line 146; Webpay branch at line 163 (ANA-03)
- `apps/website/app/pages/anunciar/gracias.vue` — `watchEffect` at line 126; purchase push at line 172 (ANA-04)
- `apps/website/app/composables/useAdAnalytics.ts` — `DataLayerEvent` interface at line 37, currently local (ANA-05)
- `apps/website/app/types/window.d.ts` — `window.dataLayer: unknown[]` at line 5 (ANA-05)

ANA-02 clarification: `CreateAd.vue` is the component that reads `?step=` from URL in its `onMounted`. The `watch(adStore.step)` that overcounts is in `index.vue` (the parent page). Removing `immediate: true` from `index.vue` and firing step 1 explicitly via a new `onMounted` call in `index.vue` (after `CreateAd.vue` mounts and applies the URL param) is the correct fix. However, since `index.vue` mounts before `CreateAd.vue` processes the URL param, the explicit step 1 call in `index.vue` `onMounted` must happen after `nextTick` to allow `CreateAd.vue`'s `onMounted` to run first. Alternative: fire step 1 in `CreateAd.vue`'s `onMounted` directly after the URL param logic, when `stepFromUrl` is NaN (meaning no URL param → fresh flow starting at step 1).

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07
Stopped at: REQUIREMENTS.md defined — ready for Phase 32 plan
Resume with: Create `.planning/phases/32-01-PLAN.md` covering ANA-01 through ANA-05
