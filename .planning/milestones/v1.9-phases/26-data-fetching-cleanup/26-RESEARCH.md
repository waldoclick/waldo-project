# Phase 26 Research: Data Fetching Cleanup

**Date:** 2026-03-07
**Phase:** 26 — Data Fetching Cleanup
**Requirements:** FETCH-01..08

## Objective

Audit all `onMounted` calls in the website, move async data-fetching patterns to SSR-compatible
alternatives (`useAsyncData` or pre-hydrated stores), and document each usage.

## Full onMounted Audit (33 calls total)

### Category A: Data-Fetching onMounted → Must be fixed (FETCH-01..07)

These are `onMounted(async ...)` calls that perform actual API/store data loads.
They cause SSR skips — content is empty on first load, then hydrates on client.

| # | File | Line | What it loads | Requirement | Fix approach |
|---|------|------|---------------|-------------|--------------|
| 1 | `components/FormProfile.vue` | 633 | `regionsStore.loadRegions()` + `communesStore.loadCommunes()` | FETCH-01 | Move to parent page `cuenta/perfil/editar.vue` via `useAsyncData` |
| 2 | `components/FormCreateTwo.vue` | 203 | `categoriesStore.loadCategories()` | FETCH-02 | Move to parent `CreateAd.vue` → page `anunciar/index.vue` |
| 3 | `components/ResumeDefault.vue` | 294 | `adCategory.getCategoryById()`, `communesStore.getCommuneById()`, `conditionsStore.getConditionById()` | FETCH-03 | Move to parent pages `anunciar/resumen.vue` and `anunciar/gracias.vue` |
| 4 | `components/PaymentMethod.vue` | 107 | `packsStore.loadPacks()` | FETCH-04 | Move to parent `CreateAd.vue` → page `anunciar/index.vue` |
| 5 | `components/CreateAd.vue` | 74 | `meStore.loadMe()` | FETCH-05 | Move to parent page `anunciar/index.vue` via `useAsyncData` |
| 6 | `components/FilterResults.vue` | 67 | `filterStore.loadFilterCommunes()` | FETCH-06 | Move to parent page `anuncios/index.vue` (already has `useAsyncData`) |
| 7 | `components/PackMethod.vue` | 51 | `packsStore.loadPacks()` | FETCH-07 | Move to parent `FormPack.vue` → `BuyPack.vue` → page `packs/comprar.vue` |

**Note on FormCreateFour.vue (line 312):** `onMounted(() => { conditionsStore.loadConditions(); })` — this is sync fire-and-forget without await. It's part of the ad creation flow. Will be moved to `anunciar/index.vue` with others. Counted in FETCH-02 scope (creation flow).

### Category B: Already-correct patterns (no fix needed)

These are `onMounted` calls in **pages** (not components) where `useAsyncData` isn't applicable,
or in components where the pattern is correct.

| # | File | Line | What it does | Classification |
|---|------|------|-------------|----------------|
| 8 | `pages/anunciar/index.vue` | 27 | Analytics + packs conditional load | Semi-fetch — analytics must be client-only; packs load is a guard not primary data |
| 9 | `pages/anunciar/resumen.vue` | 127 | `adAnalytics.beginCheckout()` | UI-only — analytics event, not data fetch |
| 10 | `pages/anunciar/error.vue` | 51 | `adAnalytics.sendErrorEvent()` | UI-only — analytics event |
| 11 | `components/FooterDefault.vue` | 106 | `indicatorStore.fetchIndicators()` | Fetch — low priority, footer content is non-critical; already client-only by design |

### Category C: UI-only onMounted (no data fetch — allowed, no fix needed)

| # | File | What it does | Why allowed |
|---|------|-------------|-------------|
| 12 | `AccordionDefault.vue` | Sets `activeIndex = 0` | DOM init — client-only |
| 13 | `BarAnnouncement.vue` | `updateProgress()` — reads DOM | DOM/CSS update — client-only |
| 14 | `BuyPack.vue` | Reads URL `?step` to set wizard step | URL reading — client-only |
| 15 | `CardAnnouncement.vue` | Sets CSS custom property on DOM element | CSS — client-only |
| 16 | `CardCategory.vue` | `await nextTick(); applyColor()` | CSS — client-only |
| 17 | `FormContact.vue` | Pre-fills email/name from `user.value` (no await) | Form init from already-loaded auth user |
| 18 | `FormCreateFour.vue` | `conditionsStore.loadConditions()` (no await) | Fire-and-forget store warm-up; will document as part of FETCH-08 audit |
| 19 | `FormCreateThree.vue` | Reads `adStore` values into form | Local store read — no API call |
| 20 | `FormResetPassword.vue` | Token validation redirect | Route param check — client-only |
| 21 | `HeroAnnouncement.vue` | `updateBackgroundColor()` — CSS update | CSS — client-only |
| 22 | `HeroResults.vue` | Sets CSS custom property | CSS — client-only |
| 23 | `LightboxAdblock.vue` | `checkAdBlock()` — adblock detection | Client-only detection |
| 24 | `LightboxCookies.vue` | Reads cookie state | Cookie — client-only |
| 25 | `LightboxLogin.vue` | Event listener + redirect if already logged in | Auth state + DOM event |
| 26 | `LightboxRegister.vue` | Reads cookie, shows if not dismissed | Cookie — client-only |
| 27 | `LightboxSearch.vue` | `document.addEventListener('keydown')` | DOM event — client-only |
| 28 | `MenuUser.vue` | `document.addEventListener('click')` | DOM event — client-only |
| 29 | `PackInvoice.vue` | Reads `packStore.is_invoice` into local ref | Local store read — no API call |
| 30 | `PaymentFeatured.vue` | Reads `adStore.featured` into local ref | Local store read — no API call |
| 31 | `PaymentInvoice.vue` | Reads `adStore.is_invoice` into local ref | Local store read — no API call |
| 32 | `UploadAvatar.vue` | Reads `user.value?.avatar.url` into local ref | Auth user — client-only |
| 33 | `UploadCover.vue` | Reads `user.value?.cover.url` into local ref | Auth user — client-only |

## Fix Strategy per Requirement

### FETCH-01: FormProfile.vue — regions + communes loading

**Current:** `onMounted(async () => { await regionsStore.loadRegions(); await communesStore.loadCommunes(); })`

**Parent chain:** FormProfile → AccountEdit → `pages/cuenta/perfil/editar.vue`

**Fix:** In `cuenta/perfil/editar.vue`, add:
```typescript
await useAsyncData("perfil-editar-regions-communes", async () => {
  await regionsStore.loadRegions();
  await communesStore.loadCommunes();
});
```
Remove `onMounted` from FormProfile.vue. The post-load region derivation logic (lines 637-656)
remains but now runs after SSR hydration.

**Note:** `regionsStore` and `communesStore` are store-based — the data will be in pinia state 
after SSR, so the component reads them via `computed(() => regionsStore.regions.data)` without
re-fetching.

### FETCH-02: FormCreateTwo.vue — categories loading

**Current:** `onMounted(async () => { await categoriesStore.loadCategories(); })`

**Parent chain:** FormCreateTwo → CreateAd.vue → `pages/anunciar/index.vue`

**Fix:** In `anunciar/index.vue`, add `useAsyncData("anunciar-init", ...)` to load categories,
me, and packs together (consolidating FETCH-02, FETCH-04, FETCH-05).

### FETCH-03: ResumeDefault.vue — category/commune/condition lookups

**Current:** `onMounted(async () => { /* getCategoryById, getCommuneById, getConditionById */ })`

**Parent chain:** ResumeDefault → `pages/anunciar/resumen.vue` and `pages/anunciar/gracias.vue`

**Challenge:** ResumeDefault receives `summary` as a prop — it needs `summary.category`,
`summary.commune`, `summary.condition` to exist before fetching.

**Fix options:**
1. Move fetching to parent pages (`resumen.vue`, `gracias.vue`) which know the summary data
2. Use `watch(() => props.summary, ..., { immediate: true })` in the component

**Decision:** Use `watch({ immediate: true })` pattern — already established in v1.2 for 
dashboard components. Avoids duplicating fetch logic in multiple parent pages.
Replace `onMounted(async)` with `watchEffect` or `watch(summaryProps, fetch, { immediate: true })`.

### FETCH-04: PaymentMethod.vue — packs loading

**Current:** `onMounted(async () => { await packsStore.loadPacks(); })`

**Parent chain:** PaymentMethod → FormCreateOne.vue → CreateAd.vue → `pages/anunciar/index.vue`

**Fix:** Consolidate into `anunciar/index.vue` useAsyncData call (same as FETCH-02/FETCH-05).
`packsStore` already has 30-min cache guard, so calling `loadPacks()` multiple times is idempotent.

### FETCH-05: CreateAd.vue — meStore.loadMe()

**Current:** `onMounted(async () => { await meStore.loadMe(); })`

**Parent chain:** CreateAd → `pages/anunciar/index.vue`

**Fix:** Move to `anunciar/index.vue` useAsyncData block. `meStore.me` read via `computed`.

### FETCH-06: FilterResults.vue — filterStore.loadFilterCommunes()

**Current:** `onMounted(async () => { isClient.value = true; await filterStore.loadFilterCommunes(); })`

**Parent chain:** FilterResults → `pages/anuncios/index.vue`

**`anuncios/index.vue` already has `useAsyncData`** — simply add `filterStore.loadFilterCommunes()` 
to the existing data-loading block. The `isClient.value = true` line needs to move elsewhere 
(e.g., to a `onMounted(() => { isClient.value = true; })` that's genuinely UI-only).

### FETCH-07: PackMethod.vue — packs loading  

**Current:** `onMounted(async () => { await packsStore.loadPacks(); })`

**Parent chain:** PackMethod → FormPack → BuyPack → `pages/packs/comprar.vue`

**Note:** `packs/comprar.vue` has no `useAsyncData` currently.

**Fix:** Add `useAsyncData("packs-comprar", async () => { await packsStore.loadPacks(); })` to
`packs/comprar.vue`. Remove `onMounted` from `PackMethod.vue`.

## Key architectural decisions

1. **Consolidation in `anunciar/index.vue`:** FETCH-02, FETCH-04, FETCH-05 all involve data needed
   by the ad creation wizard. Consolidate into a single `useAsyncData("anunciar-init", ...)` in the
   parent page rather than three separate calls. The stores have cache guards so repeated calls 
   are safe.

2. **ResumeDefault uses `watch({ immediate: true })`** not page-level useAsyncData — the component
   receives `summary` as a prop containing IDs; it needs to resolve those IDs to names. Moving this
   to pages would require duplicating logic in both `resumen.vue` and `gracias.vue`.

3. **`isClient` flag in FilterResults:** The `isClient.value = true` in onMounted serves as a
   client-side rendering gate. After moving the fetch to the parent, the component still needs
   `isClient` for certain conditional rendering. This becomes a standalone `onMounted(() => { 
   isClient.value = true; })` (UI-only — no fetch).

4. **`anunciar/index.vue` has its own onMounted:** The existing `onMounted(async () => ...)` in
   `anunciar/index.vue` sends analytics and conditionally loads packs. Analytics must be 
   client-only (GA4/GTM, no server-side). The pack load will be moved to useAsyncData; the 
   analytics portion stays in onMounted.

## Files to modify per task

**Task 1 (FETCH-01):**
- `apps/website/app/pages/cuenta/perfil/editar.vue` — add useAsyncData
- `apps/website/app/components/FormProfile.vue` — remove onMounted, keep post-load logic

**Task 2 (FETCH-02 + FETCH-04 + FETCH-05):**
- `apps/website/app/pages/anunciar/index.vue` — add useAsyncData("anunciar-init") consolidating categories, packs, me
- `apps/website/app/components/FormCreateTwo.vue` — remove onMounted
- `apps/website/app/components/PaymentMethod.vue` — remove onMounted  
- `apps/website/app/components/CreateAd.vue` — remove onMounted
- (Optional bonus) `apps/website/app/components/FormCreateFour.vue` — remove fire-and-forget (add to consolidated call)

**Task 3 (FETCH-03):**
- `apps/website/app/components/ResumeDefault.vue` — replace onMounted with watch({ immediate: true })

**Task 4 (FETCH-06):**
- `apps/website/app/pages/anuncios/index.vue` — add filterStore.loadFilterCommunes() to existing useAsyncData block
- `apps/website/app/components/FilterResults.vue` — remove onMounted fetch; keep isClient flag as UI-only onMounted

**Task 5 (FETCH-07):**
- `apps/website/app/pages/packs/comprar.vue` — add useAsyncData("packs-comprar")
- `apps/website/app/components/PackMethod.vue` — remove onMounted

**Task 6 (FETCH-08 — audit documentation):**
- Add inline `// onMounted: UI-only — [reason]` comments to all 22 Category C calls
- Add `// onMounted: analytics-only — client-side event` to Category B analytics calls
- Document FooterDefault as explicitly client-only
- Commit message serves as audit record

## Wave structure recommendation

All 6 tasks are independent — FETCH-01 (profile page) touches different files from FETCH-02..05
(creation flow). FETCH-06 and FETCH-07 touch separate pages.

However FETCH-02+04+05 share the same parent page (`anunciar/index.vue`) and should be one task.
FETCH-03 is component-internal (no page changes needed).

**Recommended plan:** 1 wave, 6 tasks, all auto (no blocking checkpoints until human verify at end).
