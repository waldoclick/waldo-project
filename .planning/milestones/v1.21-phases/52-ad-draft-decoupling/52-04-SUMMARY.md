---
phase: 52-ad-draft-decoupling
plan: "04"
subsystem: ui
tags: [nuxt, vue, strapi, draft, payments, dashboard]

# Dependency graph
requires:
  - phase: 52-ad-draft-decoupling
    provides: POST /api/payments/ad-draft endpoint (Plan 02) and adsDraft Strapi query (Plan 03)
provides:
  - resumen.vue calls draft endpoint before payment for non-free packs
  - dashboard abandoned.vue renamed/repurposed as Borradores showing ads/drafts
affects:
  - 52-ad-draft-decoupling

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pre-payment draft save: call payments/ad-draft before payments/ad, guard with pack !== 'free'"
    - "Strapi SDK v5 double-cast: payload as unknown as Parameters<typeof create>[1]"
    - "Typed unknown narrowing in catch: (error as { response?: { data?: { message?: string } } })"

key-files:
  created: []
  modified:
    - apps/website/app/pages/anunciar/resumen.vue
    - apps/dashboard/app/pages/ads/abandoned.vue
    - apps/dashboard/app/components/AdsTable.vue
    - apps/dashboard/app/stores/settings.store.ts

key-decisions:
  - "Free ad flow (pack=free) skips draft call entirely — straight to payments/ad"
  - "adsDraft added to SettingsSection type and settings.store.ts to support the new section key"
  - "abandoned.vue filename kept as-is — no route/file rename to avoid breadcrumb/router side effects"

patterns-established:
  - "Draft-before-payment: guard on pack !== 'free', call payments/ad-draft, propagate ad_id into allData before payments/ad"

requirements-completed: [FRONT-01, FRONT-02, FRONT-03, DASH-01]

# Metrics
duration: 4min
completed: 2026-03-08
---

# Phase 52 Plan 04: Ad Draft Decoupling — Frontend Wiring Summary

**Pre-payment draft save wired into resumen.vue with free-ad guard, and dashboard Borradores page switched to GET /ads/drafts endpoint**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T18:30:44Z
- **Completed:** 2026-03-08T18:34:32Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- `handlePayClick` in `resumen.vue` now calls `POST /api/payments/ad-draft` before `POST /api/payments/ad` for all paid packs — draft id propagated into `allData.ad.ad_id`
- Free ad flow (`pack === "free"`) bypasses draft call entirely, preserving existing behavior
- `error as any` casts in catch block replaced with typed `unknown` narrowing (Strapi SDK v5 cast patterns)
- Dashboard `abandoned.vue` page now shows "Borradores" and fetches from `GET /api/ads/drafts`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add pre-payment draft save to handlePayClick in resumen.vue** - `95a009a` (feat)
2. **Task 2: Update dashboard abandoned.vue to show Borradores** - `addb105` (feat)

**Plan metadata:** `a424e4a` (docs: complete plan)

## Files Created/Modified

- `apps/website/app/pages/anunciar/resumen.vue` — Updated `handlePayClick`: draft call before payment, free-pack guard, typed catch block
- `apps/dashboard/app/pages/ads/abandoned.vue` — Title, breadcrumb, AdsTable endpoint/section updated to Borradores/drafts
- `apps/dashboard/app/components/AdsTable.vue` — Added `"adsDraft"` to `SettingsSection` union type
- `apps/dashboard/app/stores/settings.store.ts` — Added `adsDraft` to `SettingsState` interface, ref, computed getter, switch case, and return

## Decisions Made

- Free ad flow skips draft call: `adStore.pack !== "free"` guard — free packs go straight to `payments/ad` as before
- `abandoned.vue` file not renamed: avoids updating router references and breadcrumb navigation throughout the dashboard
- `adsDraft` section added to settings store: required by AdsTable's type-safe section prop system

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `adsDraft` to SettingsSection type and settings.store.ts**
- **Found during:** Task 2 (abandoned.vue update)
- **Issue:** `section="adsDraft"` failed TypeScript check — `"adsDraft"` not in `SettingsSection` union type, and settings store had no `adsDraft` section ref/getter/case
- **Fix:** Added `adsDraft` to `SettingsState` interface, state ref, computed getter, switch case, return object in `settings.store.ts`; added `"adsDraft"` to `SettingsSection` union in `AdsTable.vue`
- **Files modified:** `apps/dashboard/app/stores/settings.store.ts`, `apps/dashboard/app/components/AdsTable.vue`
- **Verification:** `nuxt typecheck` clean after fix
- **Committed in:** `addb105` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required to make `section="adsDraft"` type-safe — directly implied by the plan's intent. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All frontend wiring complete: draft endpoint called before payment, dashboard shows Borradores from `/ads/drafts`
- Phase 52 (Ad Draft Decoupling) is complete — all 4 plans executed
- Ready for phase transition

---
*Phase: 52-ad-draft-decoupling*
*Completed: 2026-03-08*

## Self-Check: PASSED

- `apps/website/app/pages/anunciar/resumen.vue` — FOUND ✓
- `apps/dashboard/app/pages/ads/abandoned.vue` — FOUND ✓
- `.planning/phases/52-ad-draft-decoupling/52-04-SUMMARY.md` — FOUND ✓
- Commit `95a009a` (Task 1) — FOUND ✓
- Commit `addb105` (Task 2) — FOUND ✓
- Commit `a424e4a` (docs metadata) — FOUND ✓
