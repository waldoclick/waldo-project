---
phase: 28-typescript-strict-store-audit
plan: phase
subsystem: typescript, store
tags: [typescript, pinia, persist, typecheck, nuxt]

# Dependency graph
requires:
  - phase: 27-typescript-migration
    provides: "All 18 pages migrated to lang=ts; any eliminated from 3 stores and 3 composables"
provides:
  - "14 stores with inline persist audit comments (CORRECT/REVIEW/RISK classification)"
  - "TS-04 scoped — 183 typecheck errors catalogued across 55 files, deferred to Phase 29"
affects:
  - phase-29-typescript-strict-errors

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "persist audit comment format: // persist: CORRECT|REVIEW|RISK — <rationale>"
    - "typeCheck: true deferred until 183 pre-existing errors are resolved in Phase 29"

key-files:
  created: []
  modified:
    - apps/website/app/stores/ads.store.ts
    - apps/website/app/stores/ad.store.ts
    - apps/website/app/stores/app.store.ts
    - apps/website/app/stores/categories.store.ts
    - apps/website/app/stores/communes.store.ts
    - apps/website/app/stores/conditions.store.ts
    - apps/website/app/stores/faqs.store.ts
    - apps/website/app/stores/filter.store.ts
    - apps/website/app/stores/history.store.ts
    - apps/website/app/stores/indicator.store.ts
    - apps/website/app/stores/packs.store.ts
    - apps/website/app/stores/pack.store.ts
    - apps/website/app/stores/regions.store.ts
    - apps/website/app/stores/related.store.ts

key-decisions:
  - "TS-04 deferred to Phase 29 — running typeCheck revealed 183 errors across 55 files (18x scope increase from the 10 known pre-existing errors), making this a Phase 29 body of work, not a quick fix"
  - "STORE-01 completed independently — persist audit comments do not depend on typeCheck passing"
  - "persist audit comment classification: 9 CORRECT (static reference data with TTL or intentional wizard state), 3 REVIEW (volatile UI state or missing TTL), 2 RISK (query results or view-specific data that survives reload)"

patterns-established:
  - "persist audit comment format: // persist: CORRECT|REVIEW|RISK — <one-line rationale> (immediately above persist: key)"

requirements-completed: [STORE-01]

# Metrics
duration: partial
completed: 2026-03-07
---

# Phase 28: TypeScript Strict + Store Audit Summary

**STORE-01 complete — all 14 stores have inline persist audit comments; TS-04 deferred after typeCheck revealed 183 errors across 55 files (moved to Phase 29)**

## Performance

- **Duration:** partial (STORE-01 complete, TS-04 deferred)
- **Completed:** 2026-03-07
- **Tasks completed:** 1/2 (28-02 complete; 28-01 partial — Strapi SDK casts done, typeCheck not enabled)
- **Files modified:** 14 stores

## Accomplishments

- Added `// persist: CORRECT|REVIEW|RISK — <rationale>` comments to all 14 stores (STORE-01)
- Classification breakdown: 9 CORRECT, 3 REVIEW, 2 RISK
- Ran `nuxt typecheck` and fully catalogued the error surface: 183 errors across 55 files
- Strapi SDK filter type casts (`as unknown as Record<string, unknown>`) applied in 4 stores as planned

## Task Commits

1. **28-01 — Strapi SDK filter type casts** - `5e18e6a` (fix)
2. **28-02 — Persist audit comments to all 14 stores** - `123447b` (feat)

## Files Modified

- `apps/website/app/stores/ads.store.ts` — Strapi SDK cast + persist: RISK comment
- `apps/website/app/stores/ad.store.ts` — persist: CORRECT comment
- `apps/website/app/stores/app.store.ts` — persist: REVIEW comment
- `apps/website/app/stores/categories.store.ts` — Strapi SDK cast + persist: CORRECT comment
- `apps/website/app/stores/communes.store.ts` — Strapi SDK cast + persist: REVIEW comment
- `apps/website/app/stores/conditions.store.ts` — persist: CORRECT comment
- `apps/website/app/stores/faqs.store.ts` — persist: CORRECT comment
- `apps/website/app/stores/filter.store.ts` — persist: CORRECT comment
- `apps/website/app/stores/history.store.ts` — persist: CORRECT comment
- `apps/website/app/stores/indicator.store.ts` — persist: CORRECT comment
- `apps/website/app/stores/packs.store.ts` — Strapi SDK cast + persist: CORRECT comment
- `apps/website/app/stores/pack.store.ts` — persist: REVIEW comment
- `apps/website/app/stores/regions.store.ts` — persist: CORRECT comment
- `apps/website/app/stores/related.store.ts` — persist: RISK comment

## Decisions Made

**TS-04 deferred to Phase 29 (scope increase discovered)**

The plan assumed 10 pre-existing Strapi SDK filter type errors. Running `nuxt typecheck` after applying those casts revealed 183 errors across 55 files — an 18x scope increase. Error categories discovered:

- **Window globals** (`window.$crisp`, `window.dataLayer`, `window.google`) — no type declarations
- **Plugin type augmentation** (`$strapi`, `$setStructuredData`, `$sentry`, `$reCaptcha`) — NuxtApp interface not augmented
- **User type mismatches** — `useAuth()` / `useStrapiUser()` return type incompatible with local `User` interface
- **API response mismatches** — Strapi SDK return shapes differ from manually-typed store interfaces
- **Vue component prop types** — implicit `any` on props in migrated pages
- **Composable return type gaps** — inferred types incompatible with explicit annotations added in Phase 27

Enabling `typeCheck: true` with 183 errors would break every build immediately. The correct path is to fix all errors first in Phase 29, then enable `typeCheck: true` as the final step.

**STORE-01 completed independently** — The persist audit is pure documentation (comments only) and does not depend on TypeScript being clean. Completed as planned.

## Deviations from Plan

### Scope Discovery (not a rule violation)

**28-01 partial — typeCheck blocked by 183 errors (18x scope increase)**
- **Found during:** 28-01 Task 1 (running `nuxt typecheck` after SDK casts)
- **Expected:** 10 pre-existing errors → zero after casts → enable `typeCheck: true`
- **Actual:** 183 errors across 55 files after casts were applied
- **Decision:** Defer `typeCheck: true` enablement to Phase 29 (architectural scope — Rule 4)
- **Impact:** STORE-01 complete; TS-04 deferred; phase closed as partial

## Issues Encountered

Running `nuxt typecheck` post-cast revealed the full TypeScript error surface for the first time. The 183 errors fall into distinct, addressable categories that Phase 29 will resolve systematically before enabling `typeCheck: true`.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- **Phase 29 is ready to plan**: Fix all 183 typecheck errors across 55 files, then enable `typeCheck: true`
- Error categories are fully catalogued (see Decisions Made above) — Phase 29 planner has full scope
- STORE-01 is complete and does not need revisiting
- Strapi SDK filter casts from 28-01 are committed and stable

---
*Phase: 28-typescript-strict-store-audit*
*Completed: 2026-03-07 (partial — STORE-01 done, TS-04 deferred to Phase 29)*
