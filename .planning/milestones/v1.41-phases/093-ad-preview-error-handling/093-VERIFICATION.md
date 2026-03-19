---
phase: 093-ad-preview-error-handling
verified: 2026-03-18T18:30:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
---

# Phase 093: Ad Preview Error Handling — Verification Report

**Phase Goal:** The website never returns 500 on `/anuncios/[slug]` — errors propagate cleanly as 404/5xx Nuxt error pages
**Verified:** 2026-03-18T18:30:00Z
**Status:** ✅ PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visiting `/anuncios/[slug]` with a non-existent slug renders Nuxt's 404 error page, never a 500 | ✓ VERIFIED | `createError({ statusCode: 404, fatal: true })` thrown inside `useAsyncData` at line 92; `error.vue` handles `statusCode: 404` → "404 - Página no encontrada" (line 63); manual smoke test confirmed per SUMMARY-02 |
| 2 | Any unexpected DB error in `findBySlug` returns a clean Strapi error response without exposing a stack trace | ✓ VERIFIED | `ad.ts` lines 830–849: outer try/catch wraps entire service call; catch logs via `strapi.log.error("findBySlug error for slug %s: %o", slug, error)` and returns `ctx.internalServerError("Internal server error")` — no stack trace in response |
| 3 | `useAsyncData` in `[slug].vue` has `default: () => null` — hydration never encounters `undefined` state | ✓ VERIFIED | `[slug].vue` line 179: `default: () => null,` present in `useAsyncData` options |
| 4 | `watchEffect` and `showError()` are gone from `[slug].vue` — the error is thrown inside `useAsyncData` via `createError` | ✓ VERIFIED | `grep "watchEffect\|showError\|getErrorMessage"` returns zero matches; `createError` present at lines 92 and 169 |

**Score:** 4/4 success criteria verified

### Plan-Level Must-Have Truths

#### Plan 01 (STRP-01)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A DB error inside findBySlug returns a clean HTTP 500 response — no stack trace exposed | ✓ VERIFIED | `ad.ts` catch block returns `ctx.internalServerError("Internal server error")` (line 848); Jest test B confirms |
| 2 | The error is logged server-side via strapi.log.error with the slug and error detail | ✓ VERIFIED | Line 847: `strapi.log.error("findBySlug error for slug %s: %o", slug, error)` |
| 3 | A null result still returns ctx.notFound (behaviour unchanged) | ✓ VERIFIED | Line 835–836: `if (!result) { return ctx.notFound("Ad not found or access denied"); }` inside try block; Jest test A confirms |

#### Plan 02 (PREV-01–04)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visiting /anuncios/[slug] with a non-existent slug returns HTTP 404 (not 500) from SSR | ✓ VERIFIED | `createError({ statusCode: 404, fatal: true })` at line 92 inside `useAsyncData`; `fatal: true` ensures Nuxt SSR error boundary intercepts |
| 2 | The 404 Nuxt error page renders correctly — title shows '404 - Página no encontrada' | ✓ VERIFIED | `error.vue` line 63: `return "404 - Página no encontrada"` when `statusCode === 404`; manual smoke test confirmed |
| 3 | useAsyncData has `default: () => null` — adData.value is null (not undefined) when no ad is found | ✓ VERIFIED | `[slug].vue` line 179 |
| 4 | watchEffect and showError() are completely absent from [slug].vue | ✓ VERIFIED | Zero grep matches for `watchEffect`, `showError`, `getErrorMessage` |
| 5 | getErrorMessage() function is completely absent from [slug].vue | ✓ VERIFIED | Zero grep matches |
| 6 | The unused pending and adError destructured refs are removed from [slug].vue | ✓ VERIFIED | `pending` appears only in a code comment (line 144), not as a variable; `adError` has zero matches |

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/src/api/ad/controllers/__tests__/ad.findBySlug.test.ts` | Jest tests for findBySlug covering 4 cases | ✓ VERIFIED | 132 lines (≥60 min); 4 tests: null→notFound, throw→internalServerError, manager→send, public→sanitize |
| `apps/strapi/src/api/ad/controllers/ad.ts` | findBySlug wrapped in try/catch with strapi.log.error | ✓ VERIFIED | Lines 830–849: try/catch, `strapi.log.error`, `ctx.internalServerError` all present |
| `apps/website/app/pages/anuncios/[slug].vue` | useAsyncData with createError(fatal:true), default:()=>null, no watchEffect/showError | ✓ VERIFIED | All 6 changes applied; file is 321 lines with full implementation |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `ad.findBySlug.test.ts` | `ad.ts` (findBySlug handler) | Jest `factories` mock captures extension; `capturedExtension.findBySlug(ctx)` called directly; `internalServerError` assertion | ✓ WIRED | Lines 22–31 capture extension; lines 83, 103, 125 call handler; all 4 assertions use `capturedExtension` |
| `[slug].vue` | `error.vue` | `createError({ statusCode: 404, fatal: true })` thrown inside `useAsyncData` → Nuxt intercepts → renders `error.vue` | ✓ WIRED | `createError` at lines 92 and 169; `fatal: true` on both; `error.vue` confirmed to exist and handle 404/500 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PREV-01 | 093-02-PLAN.md | Website never returns 500 on `/anuncios/[slug]` | ✓ SATISFIED | 500 path now throws `createError({ statusCode: 500, fatal: true })` inside `useAsyncData`; catch block re-throws Nuxt errors to prevent 404→500 conversion (line 165–167) |
| PREV-02 | 093-02-PLAN.md | 404 endpoint → website shows 404 error page correctly | ✓ SATISFIED | `createError` 404 path wired to `error.vue`; manual smoke test confirmed in SUMMARY-02 |
| PREV-03 | 093-02-PLAN.md | `useAsyncData` uses `default: () => null` | ✓ SATISFIED | `[slug].vue` line 179 |
| PREV-04 | 093-02-PLAN.md | `watchEffect` + `showError()` removed; error thrown via `createError` inside `useAsyncData` | ✓ SATISFIED | Zero grep matches for both patterns; `createError` present at 2 locations |
| STRP-01 | 093-01-PLAN.md | `findBySlug` controller has try/catch — DB errors return clean HTTP 500 without stack trace | ✓ SATISFIED | `ad.ts` lines 830–849; `strapi.log.error` logs slug + error server-side; `internalServerError` sends clean message |

**Orphaned requirements:** None — all 5 requirements mapped to Phase 093 in REQUIREMENTS.md are claimed and verified.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `[slug].vue` | 87–88 | `catch { // Ad not found or access denied }` — swallows the inner fetch error silently | ℹ️ Info | The outer try/catch at line 163 re-handles this via `createError(500)`, so no 500 leaks. This was pre-existing behavior (result remains null, handled at line 91). Not introduced by this phase. |
| `[slug].vue` | 168 | `console.error("Error loading ad:", error)` in 500 path | ℹ️ Info | Uses `console.error` not `$log` / Nuxt logger. Minor — pre-existing and acceptable for client-side logging. Not a security risk (logged server-side only during SSR). |

**No blocker anti-patterns found.** Both items are informational and pre-existing.

---

## Notable Implementation Detail (Positive Deviation from Plan)

The catch block in `[slug].vue` (lines 163–167) includes a guard that was **not in the plan** but is **architecturally correct**:

```typescript
} catch (error) {
  // Re-throw Nuxt errors (e.g. the 404 from the !result path above) — do not convert to 500
  if (error && typeof error === "object" && "statusCode" in error) {
    throw error;
  }
  console.error("Error loading ad:", error);
  throw createError({ statusCode: 500, message: "Error del servidor", fatal: true });
}
```

Without this guard, the `createError({ statusCode: 404 })` thrown at line 92 would be caught by the outer catch and re-thrown as a 500. This guard ensures the 404 propagates correctly. This is a necessary and correct improvement over the plan.

---

## Human Verification Required

### 1. Non-existent slug returns HTTP 404 (not 500)

**Test:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/anuncios/este-slug-no-existe`
**Expected:** Returns `404`
**Why human:** Requires a running Nuxt SSR dev/production server with a live Strapi instance

> **Note:** Per 093-02-SUMMARY.md, this manual smoke test was already approved by the user during plan execution: "Human smoke test verified: non-existent slug returns HTTP 404 + correct error.vue; real ad page loads cleanly."

---

## Commits Verified

All commits documented in SUMMARYs confirmed to exist in git history:

| Commit | Description | Plan |
|--------|-------------|------|
| `2a0794a` | `test(093-01): add failing test for findBySlug error handling` | 093-01 |
| `bf0ee50` | `feat(093-01): wrap findBySlug service call in try/catch for clean HTTP 500` | 093-01 |
| `4f0be1e` | `fix(093-02): replace watchEffect/showError with createError inside useAsyncData` | 093-02 |

---

## Test Results

```
PASS src/api/ad/controllers/__tests__/ad.findBySlug.test.ts (5.79s)
  findBySlug controller handler
    ✓ returns notFound when service resolves null
    ✓ returns internalServerError and logs when service throws
    ✓ returns ctx.send with full ad for manager role
    ✓ calls sanitizeAdForPublic for non-manager role

Tests: 4 passed, 4 total
```

---

## Summary

Phase 093 achieved its goal. The website's `/anuncios/[slug]` route can no longer return HTTP 500:

1. **Strapi layer** (`ad.ts`): `findBySlug` is wrapped in try/catch — DB exceptions return `ctx.internalServerError("Internal server error")` with `strapi.log.error` server-side logging; no stack trace reaches the client.

2. **Nuxt layer** (`[slug].vue`): The `watchEffect`/`showError` race condition is fully removed. `createError({ statusCode: 404, fatal: true })` is thrown inside `useAsyncData` when no ad is found; `createError({ statusCode: 500, fatal: true })` is thrown for unexpected processing errors. A re-throw guard prevents the 404 path from being incorrectly converted to 500 by the outer catch. `default: () => null` ensures SSR hydration never sees `undefined` state.

3. **Error page** (`error.vue`): Already handles both 404 and 500 status codes with correct Spanish titles and descriptions.

All 5 requirements (PREV-01–04, STRP-01) are satisfied. 4 Jest tests pass. Manual smoke test was approved during execution.

---

_Verified: 2026-03-18T18:30:00Z_
_Verifier: Claude (gsd-verifier)_
