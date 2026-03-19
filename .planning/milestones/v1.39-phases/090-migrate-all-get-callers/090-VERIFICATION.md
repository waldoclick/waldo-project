---
phase: 090-migrate-all-get-callers
verified: 2026-03-15T16:00:00Z
status: passed
score: 6/6 must-haves verified
gaps: []
human_verification:
  - test: "All key pages load correctly in browser with zero console errors"
    expected: "/, /packs, /anuncios, /cuenta (with login), /anunciar — all load without API errors or response-shape warnings"
    why_human: "Runtime response shape mismatches (e.g. missing .data wrapper) cannot be caught by TypeScript or grep; only browser execution confirms end-to-end correctness"
---

# Phase 090: Migrate All GET Callers Verification Report

**Phase Goal:** Every `strapi.find()` and `strapi.findOne()` call in `apps/website` is replaced by `useApiClient`; the Strapi SDK is no longer used for data fetching

**Verified:** 2026-03-15T16:00:00Z
**Status:** ✅ PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Zero `strapi.find()` or `strapi.findOne()` calls remain in stores, composables, pages, components | ✓ VERIFIED | `grep -rn "strapi\.find\|strapi\.findOne"` across all website source → exit 1 (no matches) |
| 2 | `useApiClient` is used for all data-fetching GET calls in `apps/website` | ✓ VERIFIED | 12 stores + 3 composables + 5 pages confirmed via direct file read |
| 3 | `useStrapi()` is no longer called for data fetching (only auth helpers remain) | ✓ VERIFIED | `grep "useStrapi()" apps/website/app/{stores,composables,pages,components}` → no matches; only `useStrapiUser()` and `useStrapiAuth()` remain (auth, out of scope) |
| 4 | All composables (`useStrapi.ts`, `useOrderById.ts`, `usePacksList.ts`) use `useApiClient` | ✓ VERIFIED | All 3 files read — each instantiates `client = useApiClient()` and makes calls via `client('/api/...')` |
| 5 | Pages with direct Strapi calls migrated (`index.vue`, `anunciar/gracias.vue`, `anunciar/index.vue`, `packs/index.vue`) | ✓ VERIFIED | All 4 pages read — `const client = useApiClient()` at script setup root; no `strapi` references |
| 6 | `nuxt typecheck` passed with zero new TypeScript errors after migration | ✓ VERIFIED | 090-06-SUMMARY documents typecheck exit 0 after fixing 2 TS2339 errors in `user.store.ts` (added explicit return types to `loadUserAds`/`loadUserOrders`); commit `9c59dfd` |

**Score:** 6/6 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/website/app/stores/filter.store.ts` | `loadFilterCommunes` + `loadFilterCategories` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at setup root; `/api/filter/communes` and `/api/filter/categories` |
| `apps/website/app/stores/regions.store.ts` | `loadRegions` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` inside action (Options API); `/api/regions` with pagination |
| `apps/website/app/stores/communes.store.ts` | `loadCommunes` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` inside action; `/api/communes` with pagination/populate/sort |
| `apps/website/app/stores/conditions.store.ts` | `loadConditions` + `loadConditionById` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` inside each action; `/api/conditions` |
| `apps/website/app/stores/faqs.store.ts` | `loadFaqs` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at setup root; `/api/faqs` with pagination/populate/sort |
| `apps/website/app/stores/ads.store.ts` | `loadAds`, `loadAdBySlug`, `loadAdById` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at setup root; all 3 actions use `/api/ads` |
| `apps/website/app/stores/related.store.ts` | `loadRelatedAds` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at setup root; `/api/related/ads/${id}` |
| `apps/website/app/stores/articles.store.ts` | `loadArticles` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at setup root; `/api/articles` |
| `apps/website/app/stores/categories.store.ts` | `loadCategories`, `loadCategory`, `loadCategoryById` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at setup root; all 3 actions use `/api/categories` |
| `apps/website/app/stores/me.store.ts` | `loadMe` via `useApiClient` | ✓ VERIFIED | `const apiClient = useApiClient()` at setup root; `apiClient('/api/users/me')` |
| `apps/website/app/stores/user.store.ts` | `loadUsers`, `loadUser`, `loadUserAds`, `loadUserOrders`, `loadUserAdCounts` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at setup root (reused from phase 088); all 5 GET actions migrated |
| `apps/website/app/stores/indicator.store.ts` | `fetchIndicators`, `fetchIndicator`, `convertCurrency` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at setup root; `/api/indicators`, `/api/indicators/${code}`, `/api/indicators/convert` |
| `apps/website/app/composables/useStrapi.ts` | `useStrapiData` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` inside function; `client('/api/ads', { method: 'GET' })` |
| `apps/website/app/composables/useOrderById.ts` | `useOrderById` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` inside function; `client('/api/orders/${documentId}', { method: 'GET', params })` |
| `apps/website/app/composables/usePacksList.ts` | `loadPacks` via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` inside `usePacksList()` factory; `client('/api/ad-packs', { method: 'GET', params })` |
| `apps/website/app/pages/index.vue` | Packs loaded via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at script setup root; `client('/api/ad-packs')` inside `useAsyncData` |
| `apps/website/app/pages/packs/index.vue` | Packs loaded via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at script setup root; `client('/api/ad-packs')` inside `useAsyncData` |
| `apps/website/app/pages/anunciar/gracias.vue` | Ad fetched via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at script setup root; `client('/api/ads/${documentId}')` inside `useAsyncData` |
| `apps/website/app/pages/anunciar/index.vue` | Packs in Promise.all via `useApiClient` | ✓ VERIFIED | `const client = useApiClient()` at script setup root; `client('/api/ad-packs')` as 3rd element of `Promise.all` |
| `apps/website/app/components/FormProfile.vue` | Dead `strapi` import removed | ✓ VERIFIED | File read: `useStrapiUser()` and `useStrapiAuth()` remain (auth, out of scope); no `strapi.find`/`useStrapi()` calls |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `filter.store.ts` | `useApiClient` | `client('/api/filter/communes')` + `client('/api/filter/categories')` | ✓ WIRED | Lines 48, 82 confirmed |
| `ads.store.ts loadAds/BySlug/ById` | `useApiClient` | `client('/api/ads', { method: 'GET', params })` | ✓ WIRED | Lines 44, 64, 106 confirmed |
| `categories.store.ts loadCategories` | `useApiClient` | `client('/api/categories', { method: 'GET', params })` | ✓ WIRED | Lines 59, 109, 152 confirmed |
| `me.store.ts loadMe` | `useApiClient` | `apiClient('/api/users/me', { method: 'GET', params })` | ✓ WIRED | Line 12 confirmed |
| `indicator.store.ts fetchIndicator` | `useApiClient` | `client('/api/indicators/${code}', { method: 'GET' })` | ✓ WIRED | Line 53 confirmed |
| `useOrderById(documentId)` | `useApiClient` | `client('/api/orders/${documentId}', { method: 'GET', params })` | ✓ WIRED | Line 10 confirmed |
| `usePacksList loadPacks` | `useApiClient` | `client('/api/ad-packs', { method: 'GET', params })` | ✓ WIRED | Line 14 confirmed |
| `pages/index.vue home-packs useAsyncData` | `useApiClient` | `client('/api/ad-packs', { method: 'GET', params })` | ✓ WIRED | Line 53 confirmed |
| `pages/anunciar/gracias.vue anunciar-gracias useAsyncData` | `useApiClient` | `client('/api/ads/${documentId}', { method: 'GET', params })` | ✓ WIRED | Line 54 confirmed |
| `pages/anunciar/index.vue anunciar-init Promise.all` | `useApiClient` | `client('/api/ad-packs', { method: 'GET', params })` | ✓ WIRED | Line 43 confirmed |

---

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|----------------|-------------|--------|----------|
| API-01 | 090-01, 090-02, 090-03 | All `strapi.find()` in website stores migrated to `useApiClient` | ✓ SATISFIED | 12 stores confirmed clean; global grep exit 1 |
| API-02 | 090-02, 090-03, 090-04 | All `strapi.findOne()` in website stores migrated to `useApiClient` | ✓ SATISFIED | `indicator.store.ts` (fetchIndicator), `useOrderById.ts`, `anunciar/gracias.vue` — all migrated |
| API-03 | 090-04 | Composables `useStrapi.ts`, `useOrderById.ts`, `usePacksList.ts` migrated | ✓ SATISFIED | All 3 composable files read and confirmed |
| API-04 | 090-05 | Pages and components with direct `strapi.find()/findOne()` migrated | ✓ SATISFIED | 4 pages confirmed; `FormProfile.vue` dead import removed |
| API-06 | 090-06 | `typeCheck: true` passes with zero errors after migration | ✓ SATISFIED | `nuxt typecheck` exits 0 (commit `9c59dfd` added return types to fix 2 TS2339 errors) |

**Note on API-05:** This requirement (GET support in `useApiClient`) was satisfied in Phase 089, not Phase 090. No plan in phase 090 claims API-05, and REQUIREMENTS.md correctly maps it to Phase 089. No orphaned requirements.

**Coverage:** 5/5 phase-090 requirements satisfied. API-05 correctly attributed to Phase 089.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `FormProfile.vue` | 96 | `placeholder="5694269xxxx"` | ℹ️ Info | HTML input placeholder attribute — not a code stub; no impact on migration goal |

No code anti-patterns found. The HTML `placeholder` attribute is UI guidance text, not a code issue.

---

### Human Verification Required

#### 1. Browser Smoke Test — Key Pages Load Correctly

**Test:** Start dev server (`yarn workspace waldo-website dev`) and visit:
1. `http://localhost:3000/` — home page: categories, packs, and FAQs all render
2. `http://localhost:3000/packs` — packs page loads (requires auth)
3. `http://localhost:3000/anuncios` — ads listing loads (filter, categories, regions stores)
4. Log in → `http://localhost:3000/cuenta/perfil/editar` — profile form loads (me.store, FormProfile)
5. `http://localhost:3000/anunciar` — ad creation init loads (me.store, categories, packs)

**Expected:** Zero console errors, zero "strapi SDK" warnings, no "Cannot read property .data of undefined" errors.

**Why human:** TypeScript confirms type soundness, but the correct `.data` wrapper access (raw Strapi body vs SDK-wrapped body) can only fail at runtime. A single miscasted response returns `undefined` silently unless the page renders visibly broken.

---

### Gaps Summary

**No gaps found.** All 6 observable truths are verified. All 20 artifacts exist, are substantive, and are wired. All 5 phase-090 requirements (API-01 through API-04, API-06) are satisfied. Zero `strapi.find()`/`strapi.findOne()` calls remain in the website codebase.

The migration is complete and correct. The only open item is human browser smoke testing to confirm end-to-end runtime behavior, which cannot be automated.

---

## Summary

Phase 090 achieved its goal. Across 6 plans:

- **12 stores** migrated: filter, regions, communes, conditions, faqs, ads, related, articles, categories, me, user, indicator
- **3 composables** migrated: useStrapi.ts, useOrderById.ts, usePacksList.ts
- **4 pages** migrated: index.vue, packs/index.vue, anunciar/gracias.vue, anunciar/index.vue
- **1 component** cleaned: FormProfile.vue (dead import removed)
- **TypeScript typecheck** passes with zero errors (2 return-type annotations added in user.store.ts)
- **Zero legacy SDK data-fetch calls** remain in `apps/website`

---

_Verified: 2026-03-15T16:00:00Z_
_Verifier: Claude (gsd-verifier)_
