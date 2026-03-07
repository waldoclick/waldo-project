# Phase 36: SEO Bug Fixes — Plan

**Phase:** 36
**Milestone:** v1.16 Website Meta Copy Audit
**Goal:** Eliminate double-suffix titles, fix description copy, add missing noindex on `packs/index.vue`
**Requirements:** BUG-01, BUG-02, BUG-03, BUG-04
**Parallelization:** All four tasks are independent — Wave 1 runs them in parallel

---

## Wave Structure

```
Wave 1 (parallel): Tasks 1, 2, 3, 4
```

No wave dependencies. All four files are distinct; changes do not overlap.

---

## Task 1 — BUG-01: Fix ad detail title double-suffix and description

**Requirement:** BUG-01
**File:** `apps/website/app/pages/anuncios/[slug].vue`
**Why:** Title embeds `| Venta de Equipo en Waldo.click` — `@nuxtjs/seo` appends `| Waldo.click®` automatically, producing a double-suffix. Description lacks `®` and has a double-space when ad description is null.

**Scope of changes:**
- Lines 186–196 (inside the `watch` callback, `$setSEO` call)
- Lines 206–215 (the `WebPage` structured data block — same title/description strings must match)

**Actions:**

1. In the `watch` callback (line ~186), replace the `$setSEO` call:

   **Remove** the literal ` | Venta de Equipo en Waldo.click` from the title string.

   Before:
   ```typescript
   $setSEO({
     title: `${newData.name} en ${
       newData.commune?.name || "Chile"
     } | Venta de Equipo en Waldo.click`,
     description: `¡Oportunidad! ${String(newData.name)} en ${
       newData.commune?.name || "Chile"
     }. ${
       newData.description
         ? String(newData.description).slice(0, 150) + "..."
         : ""
     } Encuentra más equipo industrial en Waldo.click`,
   ```

   After:
   ```typescript
   const commune = newData.commune?.name || "Chile";
   const descPart = newData.description
     ? ` ${String(newData.description).slice(0, 150)}...`
     : "";
   $setSEO({
     title: `${newData.name} en ${commune}`,
     description: `¡Oportunidad! ${String(newData.name)} en ${commune}.${descPart} Encuentra más activos industriales en Waldo.click®`,
   ```

2. Update the `WebPage` structured data block (lines ~206-215) to use the same clean values:

   Before:
   ```typescript
   name: `${newData.name} en ${
     newData.commune?.name || "Chile"
   } | Venta de Equipo en Waldo.click`,
   description: `¡Oportunidad! ${String(newData.name)} en ${
     newData.commune?.name || "Chile"
   }. ${
     newData.description
       ? String(newData.description).slice(0, 150) + "..."
       : ""
   } Encuentra más equipo industrial en Waldo.click`,
   ```

   After (use the variables defined above):
   ```typescript
   name: `${newData.name} en ${commune}`,
   description: `¡Oportunidad! ${String(newData.name)} en ${commune}.${descPart} Encuentra más activos industriales en Waldo.click®`,
   ```

**Verification:**
- `yarn workspace website typecheck` — no TypeScript errors
- Manual: The two string variables (`commune`, `descPart`) are defined before both the `$setSEO` call and the structured data block that follows — confirm they are in scope for both
- Confirm: title string contains no `|` character
- Confirm: description contains `Waldo.click®` (with ®)
- Confirm: when `newData.description` is null, `descPart` is `""` and description has no double-space

---

## Task 2 — BUG-02: Fix user profile title double-suffix and remove totalAds counter

**Requirement:** BUG-02
**File:** `apps/website/app/pages/[slug].vue`
**Why:** Title manually embeds `| Waldo.click®` — `@nuxtjs/seo` appends it again. Description uses `${totalAds}` which is a page-load snapshot counter and becomes stale.

**Actions:**

1. In the `watch` callback (line ~160), update the `$setSEO` call:

   Before:
   ```typescript
   $setSEO({
     title: `Perfil de ${newData.user.username} | Waldo.click®`,
     description: `Explora los ${totalAds} anuncios publicados por ${newData.user.username} ${location}. Encuentra los mejores precios en equipamiento industrial en Waldo.click®.`,
   ```

   After:
   ```typescript
   $setSEO({
     title: `Perfil de ${newData.user.username}`,
     description: `Vendedor verificado en Waldo.click®. Explora los anuncios de ${newData.user.username} ${location} y encuentra equipamiento industrial al mejor precio.`,
   ```

2. The `const totalAds = newData.ads?.length || 0;` line (line ~155) is no longer referenced after this change. Remove it to avoid the unused-variable TypeScript/ESLint warning.

**Verification:**
- `yarn workspace website typecheck` — no TypeScript errors (no `totalAds` unused variable)
- Confirm: title string contains no `|` character
- Confirm: description contains `Waldo.click®` (with ®) and no `${totalAds}` or numeric counter

---

## Task 3 — BUG-03: Make `anuncios/index.vue` SSR-safe and add `®` to description

**Requirement:** BUG-03
**File:** `apps/website/app/pages/anuncios/index.vue`
**Why:** `$setSEO` is only called inside `watch()` — the server-rendered HTML is therefore missing the correct title and description on the initial request. Also, `generateSEODescription()` returns `...Waldo.click` without `®`.

**Actions:**

1. Fix `generateSEODescription()` (line 314): change the trailing brand string.

   Before (line 314):
   ```typescript
   return `${description}. Encuentra los mejores precios en equipamiento industrial en Waldo.click`;
   ```

   After:
   ```typescript
   return `${description}. Encuentra los mejores precios en equipamiento industrial en Waldo.click®`;
   ```

2. Add a synchronous top-level `$setSEO` call immediately before the existing `watch` block (before line 318). This fires during SSR and populates the initial server-rendered HTML.

   Before the `watch` block:
   ```typescript
   // Actualizar el SEO cuando cambian los datos
   watch(
   ```

   Insert before it:
   ```typescript
   // SSR-safe initial SEO call — ensures server-rendered HTML has correct title/description
   if (adsData.value) {
     $setSEO({
       title: generateSEOTitle(),
       description: generateSEODescription(),
       imageUrl: `${config.public.baseUrl}/share.jpg`,
       url: `${config.public.baseUrl}${route.fullPath}`,
     });

     $setStructuredData({
       "@context": "https://schema.org",
       "@type": "SearchResultsPage",
       name: generateSEOTitle(),
       description: generateSEODescription(),
       url: `${config.public.baseUrl}${route.fullPath}`,
     });
   }

   // Actualizar el SEO cuando cambian los datos
   watch(
   ```

**Verification:**
- `yarn workspace website typecheck` — no TypeScript errors
- Confirm: `generateSEODescription()` now contains `Waldo.click®` in returned string
- Confirm: `$setSEO` is now called at the synchronous top-level scope (above the watch block)
- Manual smoke check: curl the page and confirm `<title>` is set in the server HTML

---

## Task 4 — BUG-04: Add missing noindex to private/technical pages

**Requirement:** BUG-04
**Files:**
- `apps/website/app/pages/packs/index.vue` — auth-gated, not indexable
- `apps/website/app/pages/login/facebook.vue` — OAuth callback, no user-facing content
- `apps/website/app/pages/login/google.vue` — OAuth callback, no user-facing content
- `apps/website/app/pages/dev.vue` — internal dev page, must not appear in Google

**Why:** These four pages are private or technical and lack `useSeoMeta({ robots: "noindex, nofollow" })`. All other private pages (all of `/cuenta`, `registro`, `recuperar-contrasena`, etc.) already have it from v1.15.

**Actions:**

1. `packs/index.vue` — add `useSeoMeta({ robots: "noindex, nofollow" })` after the `$setStructuredData` call and before `definePageMeta`.

2. `login/facebook.vue` — add `useSeoMeta({ robots: "noindex, nofollow" })` at the top-level script setup scope.

3. `login/google.vue` — add `useSeoMeta({ robots: "noindex, nofollow" })` at the top-level script setup scope.

4. `dev.vue` — add `useSeoMeta({ robots: "noindex, nofollow" })` at the top-level script setup scope.

**Verification:**
- `npx nuxt typecheck` — no TypeScript errors
- Confirm each file has `useSeoMeta({ robots: "noindex, nofollow" })`

---

## Commit Strategy

Each task is committed independently (four commits). All are in the same wave — commit order within the wave does not matter.

| Task | Files Changed | Commit Message |
|------|--------------|----------------|
| 1 | `apps/website/app/pages/anuncios/[slug].vue` | `fix(seo): remove double-suffix and fix description in ad detail page` |
| 2 | `apps/website/app/pages/[slug].vue` | `fix(seo): remove double-suffix and stale counter from user profile page` |
| 3 | `apps/website/app/pages/anuncios/index.vue` | `fix(seo): make ad listing SSR-safe and add ® to description` |
| 4 | `apps/website/app/pages/packs/index.vue`, `login/facebook.vue`, `login/google.vue`, `dev.vue` | `fix(seo): add noindex to private and technical pages` |

---

## Success Criteria Checklist

- [ ] BUG-01: `anuncios/[slug].vue` title is `{name} en {commune}` (no `| Venta…` fragment); description contains `Waldo.click®`; no double-space when description is null
- [ ] BUG-02: `[slug].vue` title is `Perfil de {username}` (no embedded `| Waldo.click®`); description contains no numeric counter
- [ ] BUG-03: `anuncios/index.vue` server-rendered HTML contains correct title/description; description ends with `Waldo.click®`
- [ ] BUG-04: `packs/index.vue`, `login/facebook.vue`, `login/google.vue`, `dev.vue` renderan `<meta name="robots" content="noindex, nofollow">`
- [ ] `yarn workspace website typecheck` passes with zero errors
