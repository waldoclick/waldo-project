---
phase: 26-data-fetching-cleanup
plan: "01"
subsystem: ui
tags: [nuxt, vue, useAsyncData, ssr, onMounted, pinia]

requires:
  - phase: 25-critical-correctness-bugs
    provides: "correct useAsyncData key pattern and stable baseline to add lang=ts without mid-refactor breakage"

provides:
  - "perfil/editar.vue pre-loads regions + communes via useAsyncData('perfil-editar-regions-communes')"
  - "anunciar/index.vue pre-loads me + categories + packs via useAsyncData('anunciar-init')"
  - "packs/comprar.vue pre-loads packs via useAsyncData('packs-comprar')"
  - "anuncios/index.vue existing useAsyncData extended to include filterCommunes"
  - "ResumeDefault.vue uses watch({ immediate: true }) instead of onMounted for prop-driven data load"
  - "All 33 onMounted calls in website documented with inline classification comments"

affects: [27-typescript-migration, 28-typescript-strict-store-audit]

tech-stack:
  added: []
  patterns:
    - "useAsyncData at page level pre-hydrates stores before child components mount — eliminates client-side flash"
    - "watch({ immediate: true }) for prop-driven async resolution in multi-parent components (v1.2 dashboard pattern applied to website)"
    - "onMounted classification comments: UI-only | analytics-only | client-only fetch — documents intent for future maintainers"

key-files:
  created: []
  modified:
    - "apps/website/app/pages/cuenta/perfil/editar.vue"
    - "apps/website/app/components/FormProfile.vue"
    - "apps/website/app/pages/anunciar/index.vue"
    - "apps/website/app/components/CreateAd.vue"
    - "apps/website/app/components/FormCreateTwo.vue"
    - "apps/website/app/components/PaymentMethod.vue"
    - "apps/website/app/pages/anuncios/index.vue"
    - "apps/website/app/components/FilterResults.vue"
    - "apps/website/app/pages/packs/comprar.vue"
    - "apps/website/app/components/PackMethod.vue"
    - "apps/website/app/components/ResumeDefault.vue"
    - "apps/website/app/components/AccordionDefault.vue"
    - "apps/website/app/components/BarAnnouncement.vue"
    - "apps/website/app/components/BuyPack.vue"
    - "apps/website/app/components/CardAnnouncement.vue"
    - "apps/website/app/components/CardCategory.vue"
    - "apps/website/app/components/FooterDefault.vue"
    - "apps/website/app/components/FormContact.vue"
    - "apps/website/app/components/FormCreateFour.vue"
    - "apps/website/app/components/FormCreateThree.vue"
    - "apps/website/app/components/FormResetPassword.vue"
    - "apps/website/app/components/HeroAnnouncement.vue"
    - "apps/website/app/components/HeroResults.vue"
    - "apps/website/app/components/LightboxAdblock.vue"
    - "apps/website/app/components/LightboxCookies.vue"
    - "apps/website/app/components/LightboxLogin.vue"
    - "apps/website/app/components/LightboxRegister.vue"
    - "apps/website/app/components/LightboxSearch.vue"
    - "apps/website/app/components/MenuUser.vue"
    - "apps/website/app/components/PackInvoice.vue"
    - "apps/website/app/components/PaymentFeatured.vue"
    - "apps/website/app/components/PaymentInvoice.vue"
    - "apps/website/app/components/UploadAvatar.vue"
    - "apps/website/app/components/UploadCover.vue"
    - "apps/website/app/pages/anunciar/error.vue"
    - "apps/website/app/pages/anunciar/resumen.vue"

key-decisions:
  - "Consolidated FETCH-02+04+05 (categories, packs, me) into single useAsyncData('anunciar-init') in anunciar/index.vue — single waterfall beat 3 separate calls"
  - "ResumeDefault.vue uses watch({ immediate: true }) not page-level useAsyncData — component used in both resumen.vue and gracias.vue; moving logic would duplicate it in both parents"
  - "FooterDefault.vue economic indicator fetch intentionally remains onMounted(async) — non-critical footer content, explicitly client-only by design"
  - "CreateAd.vue retains onMounted(async) for meStore.isProfileComplete() — not a data fetch; reads pre-loaded store state with async guard that never fires post-SSR hydration"
  - "CardCategory.vue retains onMounted(async) for await nextTick() — purely UI/CSS timing, not a data fetch"

patterns-established:
  - "Parent-page preload pattern: page uses useAsyncData to fill stores before child components mount — child components read stores synchronously in onMounted"
  - "watch({ immediate: true }) for multi-parent components — when a component is used across multiple pages, replace onMounted with watch on the prop so logic isn't duplicated in each parent"
  - "onMounted classification comment format: // onMounted: [UI-only|analytics-only|client-only fetch] — [reason] — standardized across all 33 website onMounted calls"

requirements-completed: [FETCH-01, FETCH-02, FETCH-03, FETCH-04, FETCH-05, FETCH-06, FETCH-07, FETCH-08]

duration: 35min
completed: "2026-03-07"
---

# Phase 26: Data Fetching Cleanup Summary

**7 components migrated from onMounted(async) to useAsyncData at parent page level; all 33 onMounted calls documented with inline classification comments eliminating SSR content flashes**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-07T02:50:00Z
- **Completed:** 2026-03-07T03:12:00Z
- **Tasks:** 6 auto (human-verify checkpoint bypassed — approved by user)
- **Files modified:** 36

## Accomplishments

- Moved regions/communes load from `FormProfile.vue` to `perfil/editar.vue` via `useAsyncData("perfil-editar-regions-communes")` — profile edit form now SSR-hydrated
- Consolidated me + categories + packs loading into single `useAsyncData("anunciar-init")` in `anunciar/index.vue` — entire ad creation wizard is SSR-compatible
- Replaced `onMounted(async)` in `ResumeDefault.vue` with `watch(() => props.summary, ..., { immediate: true })` — handles both immediate and reactive prop updates
- Extended `anuncios/index.vue` existing `useAsyncData` to include `filterStore.loadFilterCommunes()` — commune filter dropdown renders server-side
- Added `useAsyncData("packs-comprar")` to `packs/comprar.vue` — pack selection page no longer flashes on direct URL access
- Documented all 33 `onMounted` calls with `// onMounted: UI-only|analytics-only|client-only fetch — [reason]` classification comments

## Task Commits

Each task was committed atomically:

1. **Task 1: FETCH-01** — `f72e8a2` (feat) — Move regions/communes loading to perfil/editar page
2. **Task 2: FETCH-02+04+05** — `e9cd8c2` (feat) — Consolidate creation flow data loading in anunciar/index.vue
3. **Task 3: FETCH-03** — `979c74b` (feat) — Replace onMounted with watch({ immediate: true }) in ResumeDefault
4. **Task 4: FETCH-06** — `e8affac` (feat) — Move filterCommunes loading into anuncios/index.vue useAsyncData
5. **Task 5: FETCH-07** — `8c608fb` (feat) — Move packs loading to packs/comprar.vue
6. **Task 6: FETCH-08** — `4cd8402` (chore) — Audit all remaining onMounted calls with classification comments

## Files Created/Modified

**Pages modified (data loading added):**
- `apps/website/app/pages/cuenta/perfil/editar.vue` — Added useAsyncData for regions + communes
- `apps/website/app/pages/anunciar/index.vue` — Added useAsyncData for me + categories + packs; onMounted converted to analytics-only
- `apps/website/app/pages/packs/comprar.vue` — Added useAsyncData for packs
- `apps/website/app/pages/anuncios/index.vue` — Extended existing useAsyncData with filterCommunes load

**Components migrated (onMounted fetch removed):**
- `apps/website/app/components/FormProfile.vue` — onMounted now sync (derives region from pre-loaded commune data)
- `apps/website/app/components/CreateAd.vue` — Removed loadMe() from onMounted; async retained for isProfileComplete() store read
- `apps/website/app/components/FormCreateTwo.vue` — onMounted now sync (form init from adStore)
- `apps/website/app/components/PaymentMethod.vue` — onMounted now sync (payment init from adStore)
- `apps/website/app/components/ResumeDefault.vue` — onMounted replaced with watch({ immediate: true })
- `apps/website/app/components/FilterResults.vue` — onMounted now sync (sets isClient flag only)
- `apps/website/app/components/PackMethod.vue` — onMounted now sync (selectedPack init from store)

**Components documented (classification comments added):**
- 22 UI-only + analytics-only onMounted calls across AccordionDefault, BarAnnouncement, BuyPack, CardAnnouncement, CardCategory, FooterDefault, FormContact, FormCreateFour, FormCreateThree, FormResetPassword, HeroAnnouncement, HeroResults, LightboxAdblock, LightboxCookies, LightboxLogin, LightboxRegister, LightboxSearch, MenuUser, PackInvoice, PaymentFeatured, PaymentInvoice, UploadAvatar, UploadCover, anunciar/error.vue, anunciar/resumen.vue

## Decisions Made

- **Consolidation in anunciar/index.vue:** FETCH-02, FETCH-04, FETCH-05 (categories, packs, me) combined into a single `useAsyncData("anunciar-init")` with `Promise.all` — reduces waterfall latency and keeps all wizard dependencies co-located in the page
- **watch({ immediate: true }) for ResumeDefault:** Component is used in both `anunciar/resumen.vue` and `anunciar/gracias.vue` — moving fetch to both parents would duplicate logic; the watch pattern (established in v1.2) is the correct solution for multi-parent components
- **FooterDefault intentionally client-only:** Economic indicators (UF, UTM, etc.) are non-critical footer content; SSR would delay the initial response for negligible value. Documented as `client-only fetch` classification
- **CreateAd retains async onMounted:** `meStore.isProfileComplete()` has an async API guard but in practice reads already-loaded store state; keeping async avoids refactoring the store function signature

## Deviations from Plan

None — plan executed exactly as written. All code was already in the committed state when execution was reviewed; the human approved the checkpoint and confirmed the work was correct.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 7 components now SSR-compatible — pages no longer have empty content on first server render
- All 33 onMounted calls documented — future developers can identify intent without reading full component logic
- Phase 27 (TypeScript Migration) can now safely add `lang="ts"` to the 17 pages, including `anunciar/index.vue` and `packs/comprar.vue` which were modified in this phase
- No blockers for Phase 27

---
*Phase: 26-data-fetching-cleanup*
*Completed: 2026-03-07*
