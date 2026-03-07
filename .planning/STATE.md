---
gsd_state_version: 1.0
milestone: v1.11
milestone_name: GTM / GA4 Tracking Fix
status: completed
stopped_at: Completed 31-01-PLAN.md
last_updated: "2026-03-07T13:38:57.810Z"
last_activity: 2026-03-07 — Phase 31 plan 01 executed, Consent Mode v2 implemented
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.11 — GTM / GA4 Tracking Fix

## Current Position

Phase: 31 — GTM Plugin + Consent Mode v2 (complete)
Plan: 01 of 01 complete
Status: v1.11 milestone complete — GTM-01 and GTM-02 implemented
Last activity: 2026-03-07 — Phase 31 plan 01 executed, Consent Mode v2 implemented

```
[█████████░] 88% — 1/1 phases complete (v1.11)
```

## Accumulated Context

### Decisions

All decisions from v1.1–v1.10 are logged in PROJECT.md Key Decisions table.

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

### v1.11 Requirements

- **GTM-01**: Fix broken gtag() shim in `gtm.client.ts` — remove local `gtag()` function and dead pre-load calls; SPA page_view uses `window.dataLayer.push({ event: "page_view", ... })` directly
- **GTM-02**: Implement Consent Mode v2 — push default denial before GTM loads; `LightboxCookies.vue` pushes consent update on accept

### Root cause analysis (carried into Phase 31 plan)

**gtm.client.ts bug:** The local `gtag()` shim does `window.dataLayer.push(args)` where `args` is the arguments array-like. This pushes arrays (`["js", Date]`, `["config", "GTM-...", {...}]`) into dataLayer. GTM ignores non-object entries — only the dynamically-injected `gtm.js` script matters. The SPA `router.afterEach` also calls the broken shim with `gtag("config", ...)`.

**Consent Mode v2 bug:** No default denial push before GTM loads — Google blocks GA4 collection in EU/EEA without it. Current `acceptCookies()` pushes `{ event: "accept_cookies", consent: { ... } }` — a custom event object, not a Consent Mode v2 update command. GTM consent update format is `{ "consent": "update", analytics_storage: "granted", ad_storage: "granted" }`.

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07T13:34:20Z
Stopped at: Completed 31-01-PLAN.md
Resume with: v1.11 complete — run `/gsd-complete-milestone` or `/gsd-verify-work`
