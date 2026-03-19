---
phase: 084-ad-discovery-tracking
verified: 2026-03-14T13:53:00Z
status: human_needed
score: 9/9 must-haves verified
human_verification:
  - test: "Visit /anuncios in GA4 Realtime and confirm view_item_list fires with an items array"
    expected: "GA4 Realtime shows view_item_list event with flow=ad_discovery and ecommerce.items containing visible ads"
    why_human: "Watcher fires client-side against live dataLayer; cannot run Nuxt in test environment to assert browser-level GA4 push"
  - test: "Type a keyword in the search box on /anuncios and submit"
    expected: "GA4 Realtime shows a search event with search_term equal to the keyword typed"
    why_human: "Search watcher fires only on explicit route.query change — no immediate:true — cannot simulate user action without browser"
  - test: "Select a commune from the filter dropdown on /anuncios"
    expected: "GA4 Realtime shows a search event with search_term equal to the commune NAME (not the numeric ID)"
    why_human: "resolveSearchTerm() maps commune ID via filterStore.filterCommunes at runtime — needs live store data"
  - test: "Navigate to /anuncios/[slug] for any active ad"
    expected: "GA4 Realtime shows view_item event with item_id, item_name, price, item_category"
    why_human: "Watcher fires client-side with { immediate: true } — needs browser + live adData to assert GA4 push"
  - test: "Navigate back from /anuncios/[slug] then click a different ad"
    expected: "GA4 Realtime shows a second distinct view_item event (not suppressed by the fired guard)"
    why_human: "Slug-change reset guard (viewItemFired = false) works at component runtime — requires two sequential navigations in browser"
  - test: "Navigate to /anuncios with no filters active"
    expected: "No search event fires on initial page load (search watcher has no immediate:true)"
    why_human: "Negative assertion on browser events — only verifiable via GA4 Realtime absence check"
  - test: "Navigate to /anuncios when no ads match the current filters"
    expected: "No view_item_list event fires (empty guard: ads.length > 0)"
    why_human: "Negative assertion on browser event — must confirm absence in GA4 Realtime with a zero-results filter"
---

# Phase 084: Ad Discovery Tracking — Verification Report

**Phase Goal:** Users browsing ads generate GA4 discovery events — every listing view, detail view, and search is captured
**Verified:** 2026-03-14T13:53:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `viewItemListPublic()` pushes `view_item_list` with `flow='ad_discovery'` and items mapped from `Ad[]` | ✓ VERIFIED | `useAdAnalytics.ts` L211–233: implementation exact + test coverage L381–445 (3 tests, all pass) |
| 2 | `viewItem()` pushes `view_item` with a single item containing `item_id`, `item_name`, `item_category`, `price` | ✓ VERIFIED | `useAdAnalytics.ts` L235–261: single-item array + test coverage L448–495 (2 tests, all pass) |
| 3 | `search()` pushes `search` event with `search_term` in `extraData` and no ecommerce block | ✓ VERIFIED | `useAdAnalytics.ts` L263–265: `pushEvent("search", [], { search_term: searchTerm }, "ad_discovery")` + test L498–512 (1 test, passes) |
| 4 | All three new functions are exported from `useAdAnalytics()` return object | ✓ VERIFIED | `useAdAnalytics.ts` L267–281: `viewItemListPublic`, `viewItem`, `search` in return; test exports check L373–377 |
| 5 | Existing 17 tests remain green after additions | ✓ VERIFIED | `yarn vitest run useAdAnalytics.test.ts` → **23/23 tests pass** (17 pre-existing + 6 new) |
| 6 | `/anuncios` fires `view_item_list` when ads load (DISC-01) | ✓ VERIFIED | `anuncios/index.vue` L340–352: `watch(() => adsData.value, ..., { immediate: true })` → `adAnalytics.viewItemListPublic(data.ads)` with `ads.length > 0` guard |
| 7 | `/anuncios/[slug]` fires `view_item` when ad detail loads (DISC-02) | ✓ VERIFIED | `anuncios/[slug].vue` L292–314: `watch(() => adData.value, ..., { immediate: true })` → `adAnalytics.viewItem(ad)` with `viewItemFired` guard + slug-reset watcher |
| 8 | `/anuncios` fires `search` on keyword/commune filter change (DISC-03) | ✓ VERIFIED | `anuncios/index.vue` L354–377: `watch([() => route.query.s, () => route.query.commune], ...)` → `resolveSearchTerm()` + `lastSearchTerm` dedup + `adAnalytics.search(term)` — no `immediate: true` |
| 9 | Empty guard: `viewItemListPublic([])` does NOT push an event | ✓ VERIFIED | `useAdAnalytics.ts` L220: `if (ads.length === 0) return;` + index.vue L347: `if (data && data.ads.length > 0)` guard |

**Score:** 9/9 truths verified (automated). 7 items require human verification for live GA4 confirmation.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/website/app/composables/useAdAnalytics.ts` | viewItemListPublic, viewItem, search functions | ✓ VERIFIED | 282 lines, substantive. All three functions at L211–265. All exported L267–281. |
| `apps/website/app/composables/useAdAnalytics.test.ts` | Unit tests for all 3 new functions | ✓ VERIFIED | 513 lines. 4 describe blocks for new functions (L380–512): viewItemListPublic×3, viewItem×2, search×1. All 23 tests pass. |
| `apps/website/app/pages/anuncios/index.vue` | DISC-01 view_item_list watcher + DISC-03 search watcher | ✓ VERIFIED | 378 lines. Import L61, instantiation L340, DISC-01 watcher L344–352, DISC-03 watcher L368–377. |
| `apps/website/app/pages/anuncios/[slug].vue` | DISC-02 view_item watcher + slug reset guard | ✓ VERIFIED | 315 lines. Import L37, instantiation L293, viewItemFired L294, slug-reset watcher L297–302, view_item watcher L305–314. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `viewItemListPublic` | `pushEvent` | `pushEvent("view_item_list", items, {}, "ad_discovery")` | ✓ WIRED | L232 — confirmed exact pattern match `pushEvent.*ad_discovery` |
| `viewItem` | `pushEvent` | `pushEvent("view_item", [item], {}, "ad_discovery")` | ✓ WIRED | L246–260 — confirmed single-item array pattern |
| `search` | `pushEvent` | `pushEvent("search", [], { search_term: searchTerm }, "ad_discovery")` | ✓ WIRED | L264 — confirmed, empty items array (no ecommerce block emitted) |
| `anuncios/index.vue` | `useAdAnalytics().viewItemListPublic` | `watch(adsData.value, ...) guard: ads.length > 0` | ✓ WIRED | Import L61, call L348, guard L347, `{ immediate: true }` L351 |
| `anuncios/index.vue` | `useAdAnalytics().search` | `watch([route.query.s, route.query.commune], ...) with lastSearchTerm dedup` | ✓ WIRED | `resolveSearchTerm()` L357–366, dedup guard L372, call L374 — no `immediate: true` confirmed |
| `anuncios/[slug].vue` | `useAdAnalytics().viewItem` | `watch(adData.value, ...) with viewItemFired guard + slug change reset` | ✓ WIRED | Slug-reset watcher L297–302, viewItemFired guard L308, call L310, `{ immediate: true }` L313 |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DISC-01 | 084-01, 084-02 | GA4 receives `view_item_list` when user views `/anuncios` — includes item array with visible ads | ✓ SATISFIED | `viewItemListPublic()` implemented + exported (Plan 01); wired via `watch(adsData, ..., { immediate: true })` in `anuncios/index.vue` (Plan 02); 3 unit tests pass |
| DISC-02 | 084-01, 084-02 | GA4 receives `view_item` when user views `/anuncios/[slug]` — includes `item_id`, `item_name`, `price`, `item_category` | ✓ SATISFIED | `viewItem()` implemented + exported (Plan 01); wired via `watch(adData, ..., { immediate: true })` with `viewItemFired` guard and slug-reset watcher in `anuncios/[slug].vue` (Plan 02); 2 unit tests pass |
| DISC-03 | 084-01, 084-02 | GA4 receives `search` when user submits query or applies commune filter — includes `search_term` | ✓ SATISFIED | `search()` implemented + exported (Plan 01); wired via `watch([route.query.s, route.query.commune])` with `resolveSearchTerm()` commune-ID→name resolution and `lastSearchTerm` dedup in `anuncios/index.vue` (Plan 02); 1 unit test passes |

**Orphaned requirements check:** REQUIREMENTS.md maps DISC-01, DISC-02, DISC-03 to Phase 084 — all three are claimed by plans 084-01 and 084-02. No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `anuncios/index.vue` | 108, 365 | `return null` | ℹ️ Info | Legitimate data-handling (category not found, no commune match) — not stubs |
| `anuncios/[slug].vue` | 87, 147 | `return null` | ℹ️ Info | Legitimate data-handling (ad not found, load error) — not stubs |

**No blockers. No warnings.**

---

### Human Verification Required

All 7 items below require a live browser session against GA4 Realtime. Automated checks cannot simulate client-side `window.dataLayer.push()` through Nuxt's SSR hydration lifecycle.

#### 1. view_item_list fires on /anuncios with results

**Test:** Open GA4 Realtime → visit `https://waldo.click/anuncios` (or local dev with ads loaded)
**Expected:** GA4 Realtime shows a `view_item_list` event with `flow=ad_discovery` and an `ecommerce.items` array containing the visible ads
**Why human:** `watch({ immediate: true })` fires on client-side hydration — cannot assert `window.dataLayer` push without a browser runtime

#### 2. search event fires on keyword submission

**Test:** On `/anuncios`, type a keyword in the search box and submit
**Expected:** GA4 Realtime shows a `search` event with `search_term` equal to the keyword typed
**Why human:** Search watcher has no `immediate: true` — only fires on explicit `route.query.s` change; requires browser interaction

#### 3. search event fires on commune filter with human-readable name

**Test:** On `/anuncios`, select a commune from the filter dropdown
**Expected:** GA4 Realtime shows a `search` event with `search_term` equal to the commune NAME (e.g. "Santiago"), not the numeric ID
**Why human:** `resolveSearchTerm()` resolves commune ID via `filterStore.filterCommunes` at runtime — requires live store populated by `loadFilterCommunes()`

#### 4. view_item fires on ad detail page

**Test:** Click any ad on `/anuncios` to open its detail page at `/anuncios/[slug]`
**Expected:** GA4 Realtime shows a `view_item` event with `item_id`, `item_name`, `price`, `item_category` matching the ad
**Why human:** `watch({ immediate: true })` fires on client hydration — needs browser + live `adData`

#### 5. Navigating between two ad detail pages produces two distinct view_item events

**Test:** Open ad A → navigate back → open ad B
**Expected:** GA4 Realtime shows two separate `view_item` events — one for each ad (slug-change watcher resets `viewItemFired`)
**Why human:** Requires sequential navigation in browser; slug-reset guard (setting `viewItemFired = false`) is only verifiable through live component re-use

#### 6. No search event fires on initial /anuncios page load

**Test:** Navigate to `/anuncios` with no query parameters active, observe GA4 Realtime for ~5 seconds
**Expected:** No `search` event fires — only `view_item_list` may appear (if ads are present)
**Why human:** Negative browser assertion — must confirm absence of an event in GA4 Realtime

#### 7. No view_item_list fires when /anuncios has zero results

**Test:** Apply a filter combination that produces zero results on `/anuncios`
**Expected:** No `view_item_list` event fires (empty guard: `data.ads.length > 0`)
**Why human:** Negative browser assertion — must confirm absence of event in GA4 Realtime with a zero-results page state

---

## Gaps Summary

None. All automated truths are verified. The phase goal is structurally achieved: the composable functions exist, are substantive (not stubs), are correctly wired into both pages with appropriate guards, and 23/23 unit tests pass. The 7 human verification items are confirmatory checks of live GA4 event delivery — the code path is correct, but GA4 Realtime confirmation cannot be automated.

**Per the SUMMARY:** Human checkpoint Task 3 in Plan 02 was already approved by the user ("All 7 GA4 Realtime checks passed — events confirmed working in production on waldo.click"). This verification confirms the code matches the approved implementation.

---

_Verified: 2026-03-14T13:53:00Z_
_Verifier: Claude (gsd-verifier)_
