---
phase: quick-260619-p2i
plan: 01
subsystem: strapi/ad-view
tags: [bugfix, view-tracking, dedup, strapi]
requires:
  - "Strapi ad-view service + ad_views/ad_views_ad_lnk tables"
provides:
  - "recordView dedup scoped per visitor + ad + day (counter de-freezes per ad)"
affects:
  - "GET /api/ads/slug/:slug view tracking"
tech-stack:
  added: []
  patterns:
    - "sha256(ip|ua|adDocumentId|day) visitor hash"
    - "belt-and-suspenders dedup: hash recipe + where.ad guard"
key-files:
  created: []
  modified:
    - apps/strapi/src/api/ad-view/services/ad-view.ts
    - apps/strapi/tests/api/ad-view/ad-view.service.test.ts
decisions:
  - "Both guards kept (hash includes adDocumentId AND findMany where includes ad: ad.id) per plan belt-and-suspenders intent; either alone fixes the cross-ad bug, so Test D pins the hash recipe and Test B proves cross-ad behavior."
metrics:
  duration: "~25m"
  completed: 2026-06-19
  tasks: 3
  files: 2
---

# Phase quick-260619-p2i Plan 01: Fix recordView dedup to per-visitor/ad/day Summary

Fixed the cross-ad dedup bug in `recordView` so the views counter on `/anuncios/[slug]` increments per ad instead of freezing after the first ad a visitor sees in a day. Root cause: `visitor_hash` was `sha256(ip|ua|day)` (no ad) and the dedup `findMany` filtered only by `visitor_hash` + `viewed_at`, so once a visitor viewed any ad in a day, every other ad's view was deduped away. Fix: include `adDocumentId` in the hash AND add `ad: ad.id` to the dedup where clause.

## What Changed

### Task 1 — Source fix (commit 56cd357b)
`apps/strapi/src/api/ad-view/services/ad-view.ts`:
- Hash recipe: `sha256(`${ip}|${ua}|${adDocumentId}|${day}`)` (was `${ip}|${ua}|${day}`).
- Dedup `findMany` where now includes `ad: ad.id` alongside `visitor_hash` + `viewed_at`.
- All four docstrings/comments updated to "per-visitor/ad/day".
- Fire-and-forget structure unchanged (try/catch swallow, `strapi.log?.warn`, return void, `if (!ad) return`, create payload unchanged). getAdStats / getViewCountsByAdIds / getUserTotalViews / cache middleware / cache exclusion / recordContact untouched.

### Task 2 — Stateful unit tests (commit f6617a32)
`apps/strapi/tests/api/ad-view/ad-view.service.test.ts`:
- `buildStatefulMockStrapi` now keeps an in-memory `rows[]`; `create` pushes, `findMany` filters by the `where` it receives (visitor_hash AND ad), `findOne` resolves a multi-ad map (`ad-A`→{id:10}, `ad-B`→{id:20}).
- Test A: same visitor/ad/day → one row. Test B (the bug fix): same visitor, different ad → two rows. Test C: different visitor, same ad → two rows. Test D: pins `visitor_hash === sha256(ip|ua|adDocumentId|day)`. Test E: DB error swallowed.
- Deleted the stale owner-exclusion test (owner exclusion was removed in 854f48d8).

### Task 3 — Live end-to-end verification (MANDATORY)
Strapi was confirmed running in `develop` (watch) mode; saving Task 1 triggered an auto-reload (health briefly 000, back to 204 in ~2s). Verified the fix is live in the compiled `dist`:
- `apps/strapi/dist/src/api/ad-view/services/ad-view.js` (timestamp 18:12, after edit) line 40 `${ip}|${ua}|${adDocumentId}|${day}` and line 54 `ad: ad.id`.

Slug → id confirmed: `florence-leblanc-1772885185462`→33, `latifah-butler-1772892297094`→34 (both active + published).

## Live Test Output (real)

```
UA=P2iVerify/1.0-1781907198
MAXID before = 13
===== TEST 1: same UA, same ad, twice =====
A1 200
A2 200
--- rows after TEST 1 (expect ONE for ad_id 33) ---
17|33|34c556cb822946338c797a6b8931704c7a5bd5a5ca06d904472154b8cc4a9534
===== TEST 2: same UA, DIFFERENT ad =====
B1 200
--- rows after TEST 2 (expect TWO: ad_id 33 AND ad_id 34) ---
17|33|34c556cb822946338c797a6b8931704c7a5bd5a5ca06d904472154b8cc4a9534
18|34|939b2987e6b94f727a393f58445d20bba7e0b235cd1920e382b0dec79aabe33f
===== CLEANUP =====
ad_views leftover: 0
ad_views_ad_lnk leftover: 0
```

- TEST 1: two identical requests to ad 33 → exactly ONE row (id 17). Second call deduped.
- TEST 2: same UA on ad 34 → a NEW row (id 18, ad_id 34, distinct visitor_hash). Proves cross-ad de-freeze — under the old hash this row would never have been created.
- All HTTP codes 200.
- Cleanup left both COUNT queries at 0; DB restored to baseline (MAX id back to 13, 13 rows in both `ad_views` and `ad_views_ad_lnk`).

## Jest Output (real)

```
PASS tests/api/ad-view/ad-view.service.test.ts (10.376 s)
PASS tests/api/ad-view/ad-view.stats.test.ts (10.415 s)

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
```

Regression-proof checks (run, then source restored):
- Test D FAILS when `adDocumentId` is dropped from the hash (pins the hash recipe).
- Test B continues to pass via the `where.ad` guard (belt-and-suspenders — the behavioral cross-ad proof holds through either guard).

## Deviations from Plan

None - plan executed exactly as written. (Note: the dev-server auto-reload temporarily took :1337 offline for ~2s right after the Task 1 save; waited for health to return 204 before the e2e — not a deviation, just the watch-mode reload the plan anticipated.)

## Self-Check: PASSED
- apps/strapi/src/api/ad-view/services/ad-view.ts — FOUND (hash + where.ad present)
- apps/strapi/tests/api/ad-view/ad-view.service.test.ts — FOUND
- Commit 56cd357b — FOUND
- Commit f6617a32 — FOUND
- DB restored to baseline (MAX id 13, 13/13 rows) — CONFIRMED
