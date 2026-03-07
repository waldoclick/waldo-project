---
phase: 31-gtm-plugin-consent-mode-v2
plan: "01"
subsystem: ui
tags: [gtm, ga4, consent-mode-v2, dataLayer, nuxt-plugin]

# Dependency graph
requires: []
provides:
  - GTM plugin with Consent Mode v2 default denial before script injection
  - SPA page_view tracking via direct window.dataLayer.push
  - LightboxCookies Consent Mode v2 update push on user acceptance
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Consent Mode v2 pattern: push { 'consent': 'default', analytics_storage: 'denied', ad_storage: 'denied' } before GTM script injects"
    - "Direct window.dataLayer.push({...}) — no gtag() shim anywhere in codebase"
    - "Consent update pattern: { 'consent': 'update', analytics_storage: 'granted', ad_storage: 'granted' } flat object"

key-files:
  created: []
  modified:
    - apps/website/app/plugins/gtm.client.ts
    - apps/website/app/components/LightboxCookies.vue

key-decisions:
  - "Removed gtag() shim entirely — all dataLayer interactions use direct window.dataLayer.push({}) with plain objects"
  - "Consent Mode v2 default denial placed immediately after dataLayer init and before script.async injection (GTM spec requirement)"
  - "to.meta.title cast as string | undefined per project documented cast patterns — no any introduced"

patterns-established:
  - "No gtag() helper in codebase — direct window.dataLayer.push() is the sole push mechanism"
  - "Consent Mode v2 command structure: quoted 'consent' key as first key, flat storage keys as siblings"

requirements-completed:
  - GTM-01
  - GTM-02

# Metrics
duration: 2min
completed: 2026-03-07
---

# Phase 31 Plan 01: GTM Plugin + Consent Mode v2 Summary

**Removed broken gtag() array-push shim from GTM plugin; added Consent Mode v2 default denial before script injection; fixed SPA page_view and LightboxCookies consent update**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-07T13:32:32Z
- **Completed:** 2026-03-07T13:34:20Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Deleted the local `gtag()` shim that was pushing JavaScript arrays (not objects) into `window.dataLayer` — GTM silently ignored all these pushes
- Added Consent Mode v2 default denial (`analytics_storage: "denied"`, `ad_storage: "denied"`) before GTM script injection — required for EU/EEA GA4 data collection under Google's Consent Mode requirements
- Fixed `router.afterEach` to push `{ event: "page_view", page_path, page_title }` as a plain object — SPA navigation events now actually reach GA4
- Updated `LightboxCookies.vue` `acceptCookies()` to push the correct Consent Mode v2 update command (`{ "consent": "update", analytics_storage: "granted", ad_storage: "granted" }`) instead of a custom `accept_cookies` event object with a nested consent sub-object

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix gtm.client.ts — remove gtag shim, add Consent Mode v2 default, fix page_view push** - `ef48488` (feat)
2. **Task 2: Fix LightboxCookies.vue — replace acceptCookies dataLayer push with Consent Mode v2 update** - `d28ac4b` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `apps/website/app/plugins/gtm.client.ts` — GTM plugin rewritten: removed gtag() shim, added Consent Mode v2 default denial before script, direct page_view push in router.afterEach (65 → 52 lines, 0 `any` types)
- `apps/website/app/components/LightboxCookies.vue` — acceptCookies() updated: replaced custom event push with Consent Mode v2 update command

## Decisions Made

- **No gtag() shim** — the broken shim was the root cause of all dataLayer push failures; it was deleted entirely rather than fixed, since `window.dataLayer.push()` is simpler and unambiguous
- **Consent Mode v2 placement** — default denial push must occur after `window.dataLayer = window.dataLayer || []` but before `script.async = true` per Google's Consent Mode v2 spec
- **`to.meta.title as string | undefined`** — Vue Router types `meta.title` as `unknown`; the documented project cast pattern was applied (no `any`)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- GTM Consent Mode v2 is fully implemented across both files
- GA4 page_view events will now be pushed correctly on every SPA navigation
- Consent Mode default denial satisfies Google's EU/EEA requirements
- Phase 31 is complete — v1.11 milestone is ready for release

---
*Phase: 31-gtm-plugin-consent-mode-v2*
*Completed: 2026-03-07*

## Self-Check: PASSED

- ✅ `apps/website/app/plugins/gtm.client.ts` — exists on disk
- ✅ `apps/website/app/components/LightboxCookies.vue` — exists on disk
- ✅ `.planning/phases/31-gtm-plugin-consent-mode-v2/31-01-SUMMARY.md` — exists on disk
- ✅ Commit `ef48488` (Task 1) — verified in git log
- ✅ Commit `d28ac4b` (Task 2) — verified in git log
