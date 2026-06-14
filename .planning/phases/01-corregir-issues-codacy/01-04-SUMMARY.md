---
phase: 01-corregir-issues-codacy
plan: 04
subsystem: testing
tags: [typescript, codacy, eslint, no-explicit-any, strapi, nuxt]

# Dependency graph
requires: []
provides:
  - "All no-explicit-any ESLint violations in the 4 flagged files resolved (any -> unknown + cast-at-use)"
  - "Local-verifiable Codacy bucket (no-explicit-any) closed for these files"
affects: [01-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "any -> unknown + minimal-shape cast at use site (CLAUDE.md bans any)"
    - "extractGroups<T>() helper centralizes the unknown GraphQL response navigation in cloudflare.service"

key-files:
  created: []
  modified:
    - apps/strapi/src/types/koa.d.ts
    - apps/website/tests/stubs/nitro-globals.ts
    - apps/strapi/src/services/better-stack/services/better-stack.service.ts
    - apps/strapi/src/services/cloudflare/services/cloudflare.service.ts

key-decisions:
  - "Replaced 13 any occurrences (not 9) — plan under-enumerated nitro-globals (6 sites, not 4) and omitted cloudflare's 3 'groups: any[]'; Task 2 verify grep explicitly demands any[]==0, so all 13 were resolved"
  - "better-stack: typed each map callback's attributes shape concretely (not Record<string, unknown>) so ?? defaults satisfy the BetterStackMonitor/Incident return interfaces under strict tsc"
  - "cloudflare: added private extractGroups<T>() helper to navigate the now-unknown GraphQL response, replacing 3 duplicated 'data?.data?.viewer?.zones?.[0]?.<key>' casts"

patterns-established:
  - "When widening a global type from any to unknown (koa.d.ts body), verify cross-file fallout with a full app tsc, not just the per-file grep"

requirements-completed: [CODACY-FIX]

# Metrics
duration: 12min
completed: 2026-06-14
---

# Phase 01 Plan 04: no-explicit-any cleanup Summary

**Replaced all 13 `any` occurrences across koa.d.ts, the nitro-globals test stub, and the better-stack + cloudflare Strapi services with `unknown` + cast-at-use; Strapi tsc green, website server tests pass.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-14T16:43:00Z
- **Completed:** 2026-06-14T16:55:26Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `koa.d.ts` `body: any` -> `body: unknown` with zero cross-file fallout (full Strapi tsc exit 0; all consumers already cast).
- `nitro-globals.ts` test stub: all 6 `(globalThis as any)` -> `(globalThis as typeof globalThis & Record<string, unknown>)`; 17 website server tests pass at runtime.
- `better-stack.service.ts`: `{ data: any[] }` -> `unknown[]`; both map callbacks cast `raw` to concrete attribute shapes (no `any`).
- `cloudflare.service.ts`: `graphql()` `Promise<any>` -> `Promise<unknown>`; `response.json()` typed to a minimal `{ errors?; data? }` shape; the 3 `groups: any[]` navigations replaced by a typed `extractGroups<T>()` helper.

## Task Commits

1. **Task 1: koa.d.ts + nitro-globals.ts (5 of 9, actually 7 sites)** - `c41ef056` (fix)
2. **Task 2: better-stack.service.ts + cloudflare.service.ts (4 of 9, actually 6 sites)** - `7fa462dc` (fix)

**Plan metadata:** see final docs commit.

## Files Created/Modified
- `apps/strapi/src/types/koa.d.ts` - `Request.body` typed `unknown` (global koa augmentation)
- `apps/website/tests/stubs/nitro-globals.ts` - Nitro/h3 global stub, typed `globalThis` augmentation
- `apps/strapi/src/services/better-stack/services/better-stack.service.ts` - Better Stack API client; `unknown[]` + concrete per-callback attribute casts
- `apps/strapi/src/services/cloudflare/services/cloudflare.service.ts` - Cloudflare GraphQL analytics client; `unknown` return + `extractGroups<T>()` helper

## Decisions Made
- **Scope was 13 sites, not 9.** The grep was treated as authoritative over the plan's prose count. The plan folded nitro-globals' `readBody`/`setCookie`/`getHeader` into one bullet (6 real sites) and omitted cloudflare's `groups: any[]` at lines 90/122/150 — but Task 2's own verify grep includes `any[]` and demands 0. All 13 resolved.
- **better-stack attribute typing:** casting `attr` to `Record<string, unknown>` left `attr.status ?? "pending"` as `unknown`, failing the strict return-type check. Typed each callback's `attributes` to the concrete field shapes (status as `MonitorStatus`, etc.) instead, importing `MonitorStatus`.
- **cloudflare helper:** rather than repeat the `data?.data?.viewer?.zones?.[0]?.<key>` cast in three getters, added one `private extractGroups<T>(data, groupKey): T[]` — purely subtractive of duplication, no `any`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Resolved cloudflare `groups: any[]` (3 sites) omitted from plan interfaces**
- **Found during:** Task 2 (cloudflare.service.ts)
- **Issue:** Plan's `<interfaces>` listed only cloudflare:24 and :43, but lines 90/122/150 each had `const groups: any[]`. Task 2's verify grep includes `any[]` and requires 0 — leaving them would fail the task's own done criteria.
- **Fix:** Introduced `extractGroups<T>()` typed helper; each getter passes its concrete group shape.
- **Files modified:** apps/strapi/src/services/cloudflare/services/cloudflare.service.ts
- **Verification:** grep `: any|as any|any[]` == 0; Strapi tsc exit 0.
- **Committed in:** `7fa462dc`

**2. [Rule 1 - Bug] better-stack `unknown` attributes broke return-type check**
- **Found during:** Task 2 (better-stack.service.ts)
- **Issue:** First pass cast `attr` to `Record<string, unknown>`; tsc TS2322 — `unknown` not assignable to `MonitorStatus`/`string` on the returned objects.
- **Fix:** Typed each map callback's `attributes` to concrete optional field shapes; imported `MonitorStatus`.
- **Files modified:** apps/strapi/src/services/better-stack/services/better-stack.service.ts
- **Verification:** Strapi tsc exit 0 after the fix.
- **Committed in:** `7fa462dc`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug). Both confined to this plan's `files_modified`.
**Impact on plan:** Necessary to satisfy the plan's own verify grep and keep tsc green. No scope creep beyond the 4 owned files.

## Issues Encountered
- None beyond the deviations above; both resolved within Task 2 (under the 3-attempt limit).

## Verification

- `grep -rn ': any\|as any\|any\[\]'` across all 4 files == **0**.
- `grep -rnw any` across all 4 files == **0** (whole-word check catches generic-position `any` such as `Promise<any>`/`Array<any>` that the punctuation pattern misses — provably closes the no-explicit-any bucket).
- Strapi `npx tsc --noEmit -p tsconfig.json` == **exit 0, zero errors** (confirms `body: unknown` produces no cross-file koa-consumer fallout).
- Website `vitest run tests/server/` == **17 passed** (exercises the nitro-globals stub at runtime; tests are not in the vue-tsc path).
- `pnpm codacy` (ESLint bucket) is confirmatory only — grep==0 already proves no-explicit-any==0 for these files; not re-run repo-wide to avoid noise from concurrent parallel-wave edits.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- This is the only Codacy bucket fully verifiable locally (RESEARCH F1). The remaining security buckets require the remote re-scan in plan 01-06.
- nitro-globals.ts is also remote-path-excluded in plan 01-06 (belt-and-suspenders; resolved here per CLAUDE.md's ban on `any` even in test stubs).

## Self-Check: PASSED

All 4 modified files present; both task commits (`c41ef056`, `7fa462dc`) exist in git history.

---
*Phase: 01-corregir-issues-codacy*
*Completed: 2026-06-14*
