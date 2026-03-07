# Phase 37: Dynamic Page Copy — Plan

**Phase:** 37
**Milestone:** v1.16 Website Meta Copy Audit
**Goal:** Rewrite meta copy for the four highest-traffic public dynamic pages using canonical vocabulary, within character budgets, and free of stale counters
**Requirements:** COPY-01, COPY-02, COPY-03, COPY-04
**Parallelization:** All four tasks are independent — Wave 1 runs them in parallel

---

## Wave Structure

```
Wave 1 (parallel): Tasks 1, 2, 3, 4
```

No wave dependencies. All four files are distinct; changes do not overlap.

---

## Task 1 — COPY-01: Rewrite `index.vue` static SEO copy

**Requirement:** COPY-01
**File:** `apps/website/app/pages/index.vue`
**Why:** Title uses "Equipo" (not canonical) and description uses "equipo industrial" (not canonical). Both must use `anuncios`/`activos industriales`.

**Scope of changes:** Lines 72–76 (the `$setSEO` call)

**Actions:**

1. Replace the `$setSEO` call at lines 72–76:

   Before:
   ```typescript
   $setSEO({
     title: "Compra y Venta de Equipo en Chile",
     description:
       "Publica y encuentra equipo industrial en Chile. Waldo.click® conecta vendedores y compradores de equipos nuevos o usados en todo el país.",
   });
   ```

   After:
   ```typescript
   $setSEO({
     title: "Anuncios de Activos Industriales en Chile",
     description:
       "Compra y vende activos industriales en Chile. Waldo.click® conecta vendedores y compradores de equipos nuevos y usados en todo el país.",
   });
   ```

**Verification:**
- `yarn workspace website typecheck` — no TypeScript errors
- Confirm: title is `"Anuncios de Activos Industriales en Chile"` (41 chars ≤ 45 ✅)
- Confirm: title contains `anuncios` and `activos industriales`
- Confirm: title contains no `avisos`, `maquinaria industrial`, `clasificados`
- Confirm: description length is 135 chars (120–155 ✅)
- Confirm: description contains `Waldo.click®` (with ®)
- Confirm: no `| Waldo.click` in the title string

---

## Task 2 — COPY-02: Rewrite `anuncios/index.vue` SEO generator functions

**Requirement:** COPY-02
**File:** `apps/website/app/pages/anuncios/index.vue`
**Why:**
- `generateSEOTitle()` currently uses `"Activos industriales en Chile"` (lowercase "i") — correct vocabulary but inconsistent capitalization. Commune-only branch `"Activos industriales en {commune}"` already fits ≤ 45 chars. Default state needs to be updated to use `"Anuncios de Activos Industriales"` for stronger keyword targeting.
- `generateSEODescription()` uses `${totalAds}` counter (stale) and the no-filter branch produces only 116 chars (below 120 minimum after removing the counter). All branches need rewriting.

**Scope of changes:**
- `generateSEOTitle()` — lines 239–282 (the complete function body)
- `generateSEODescription()` — lines 285–315 (the complete function body)

**Actions:**

1. Replace the `generateSEOTitle()` function body (lines 239–282):

   Before (the existing function):
   ```typescript
   const generateSEOTitle = () => {
     const searchQuery = route.query.s?.toString();
     const categoryName = adsData.value?.category?.name;
     const communeId = route.query.commune?.toString();
     const communeName = adsData.value?.ads.find(
       (ad) =>
         typeof ad.commune === "object" &&
         ad.commune !== null &&
         ad.commune.id?.toString() === communeId,
     )?.commune;
     const communeNameStr =
       typeof communeName === "object" && communeName !== null
         ? communeName.name
         : undefined;

     if (searchQuery) {
       let title = `Buscando "${searchQuery}"`;
       if (categoryName && categoryName !== "Anuncios")
         title += ` en ${categoryName}`;
       if (communeNameStr) title += ` en ${communeNameStr}`;
       return `${title}`;
     }

     if (categoryName === "Anuncios") {
       return communeNameStr
         ? `Activos industriales en ${communeNameStr}`
         : "Activos industriales en Chile";
     }

     if (categoryName && communeNameStr) {
       return `Activos industriales de ${categoryName} en ${communeNameStr}`;
     }

     if (categoryName) {
       return `Activos industriales de ${categoryName}`;
     }

     if (communeNameStr) {
       return `Activos industriales en ${communeNameStr}`;
     }

     return "Activos industriales en Chile";
   };
   ```

   After:
   ```typescript
   const generateSEOTitle = () => {
     const searchQuery = route.query.s?.toString();
     const categoryName = adsData.value?.category?.name;
     const communeId = route.query.commune?.toString();
     const communeName = adsData.value?.ads.find(
       (ad) =>
         typeof ad.commune === "object" &&
         ad.commune !== null &&
         ad.commune.id?.toString() === communeId,
     )?.commune;
     const communeNameStr =
       typeof communeName === "object" && communeName !== null
         ? communeName.name
         : undefined;

     if (searchQuery) {
       let title = `Buscando "${searchQuery}"`;
       if (categoryName && categoryName !== "Anuncios")
         title += ` en ${categoryName}`;
       return title;
     }

     if (!categoryName || categoryName === "Anuncios") {
       return communeNameStr
         ? `Activos Industriales en ${communeNameStr}`
         : "Anuncios de Activos Industriales";
     }

     if (categoryName && communeNameStr) {
       return `Anuncios de ${categoryName} en ${communeNameStr}`;
     }

     if (categoryName) {
       return `Anuncios de ${categoryName} en Chile`;
     }

     return "Anuncios de Activos Industriales";
   };
   ```

2. Replace the `generateSEODescription()` function body (lines 285–315):

   Before (the existing function):
   ```typescript
   const generateSEODescription = () => {
     const searchQuery = route.query.s?.toString();
     const categoryName = adsData.value?.category?.name;
     const communeId = route.query.commune?.toString();
     const communeObj = adsData.value?.ads.find(
       (ad) =>
         typeof ad.commune === "object" &&
         ad.commune !== null &&
         ad.commune.id?.toString() === communeId,
     )?.commune;
     const communeName =
       typeof communeObj === "object" && communeObj !== null
         ? communeObj.name
         : undefined;
     const totalAds = adsData.value?.pagination?.total || 0;

     let description = "";

     if (searchQuery) {
       description = `Resultados de búsqueda para "${searchQuery}"`;
       if (categoryName) description += ` en la categoría ${categoryName}`;
       if (communeName) description += ` en ${communeName}`;
     } else {
       description = `Explora ${totalAds} anuncios de activos industriales`;
       if (categoryName) description += ` en la categoría ${categoryName}`;
       if (communeName) description += ` en ${communeName}`;
     }

     return `${description}. Encuentra los mejores precios en equipamiento industrial en Waldo.click®`;
   };
   ```

   After:
   ```typescript
   const generateSEODescription = () => {
     const searchQuery = route.query.s?.toString();
     const categoryName = adsData.value?.category?.name;
     const communeId = route.query.commune?.toString();
     const communeObj = adsData.value?.ads.find(
       (ad) =>
         typeof ad.commune === "object" &&
         ad.commune !== null &&
         ad.commune.id?.toString() === communeId,
     )?.commune;
     const communeName =
       typeof communeObj === "object" && communeObj !== null
         ? communeObj.name
         : undefined;

     if (searchQuery) {
       let desc = `Resultados para "${searchQuery}" en Waldo.click®. Activos industriales en Chile`;
       if (categoryName && categoryName !== "Anuncios")
         desc += `: ${categoryName}`;
       if (communeName) desc += `, ${communeName}`;
       return `${desc}. Equipos nuevos y usados a los mejores precios.`;
     }

     if (!categoryName || categoryName === "Anuncios") {
       if (!communeName) {
         return "Encuentra anuncios de activos industriales en todo Chile. Equipos nuevos y usados de todas las categorías disponibles en Waldo.click®.";
       }
       return `Encuentra anuncios de activos industriales en ${communeName}. Equipos industriales nuevos y usados disponibles en Waldo.click®.`;
     }

     if (categoryName && communeName) {
       return `Explora anuncios de ${categoryName} en ${communeName}. Activos industriales disponibles en Waldo.click®. Contacta al vendedor directamente.`;
     }

     return `Explora anuncios de ${categoryName} en Chile. Activos industriales nuevos y usados disponibles en Waldo.click®. Compra y vende en minutos.`;
   };
   ```

**Verification:**
- `yarn workspace website typecheck` — no TypeScript errors (no `totalAds` unused variable warnings)
- Confirm: no `${totalAds}` or any numeric counter variable in either function
- Confirm: default-state title is `"Anuncios de Activos Industriales"` (32 chars ✅)
- Confirm: commune-only branch title uses `Activos Industriales en {commune}` — test "Antofagasta" = 35 chars ✅
- Confirm: no branch description contains `equipamiento industrial` or `maquinaria industrial`
- Confirm: all description branches end with `Waldo.click®` (with ®)
- Confirm: default description is 134 chars (120–155 ✅)

---

## Task 3 — COPY-03: Rewrite `anuncios/[slug].vue` description template

**Requirement:** COPY-03
**File:** `apps/website/app/pages/anuncios/[slug].vue`
**Why:** The null-description fallback (when `adData.description` is null) currently produces only ~98 chars (below the 120-char minimum). Also, the ad description slice is not budget-aware, risking overflow for long names.

**Important:** The title template (`${newData.name} en ${commune}`) was fixed in Phase 36 and is already correct — **do not change it**.

**Scope of changes:** Lines 186–203 (inside the `watch` callback, `$setSEO` call and WebPage structured data block)

**Actions:**

1. In the `watch` callback (around line 182), replace the description template:

   Before (current post-Phase-36 code):
   ```typescript
   const commune = newData.commune?.name || "Chile";
   const descPart = newData.description
     ? ` ${String(newData.description).slice(0, 150)}...`
     : "";
   $setSEO({
     title: `${newData.name} en ${commune}`,
     description: `¡Oportunidad! ${String(newData.name)} en ${commune}.${descPart} Encuentra más activos industriales en Waldo.click®`,
   ```

   After:
   ```typescript
   const commune = newData.commune?.name || "Chile";
   const descPrefix = `¡Oportunidad! ${String(newData.name)} en ${commune}.`;
   const descSuffix = " Activo industrial en Waldo.click®.";
   const sliceBudget = 155 - descPrefix.length - descSuffix.length - 4;
   const descPart = newData.description && sliceBudget > 10
     ? ` ${String(newData.description).slice(0, sliceBudget)}...`
     : "";
   const description = newData.description
     ? `${descPrefix}${descPart}${descSuffix}`
     : `¡Oportunidad! ${String(newData.name)} en ${commune}. Activo industrial a la venta. Consulta precio, detalles y contacta al vendedor en Waldo.click®.`;
   $setSEO({
     title: `${newData.name} en ${commune}`,
     description,
   ```

2. Update the `WebPage` structured data block (lines ~206–215) to use the same `description` variable:

   Before:
   ```typescript
   name: `${newData.name} en ${commune}`,
   description: `¡Oportunidad! ${String(newData.name)} en ${commune}.${descPart} Encuentra más activos industriales en Waldo.click®`,
   ```

   After:
   ```typescript
   name: `${newData.name} en ${commune}`,
   description,
   ```

**Verification:**
- `yarn workspace website typecheck` — no TypeScript errors
- Confirm: `description` variable is declared before both `$setSEO` call and the structured data block
- Confirm: null-description case produces ≥ 120 chars — check `"¡Oportunidad! Torno CNC Haas ST-20 en Santiago. Activo industrial a la venta. Consulta precio, detalles y contacta al vendedor en Waldo.click®.".length` = 143 ✅
- Confirm: description contains `Waldo.click®` (with ®)
- Confirm: no double-space when `newData.description` is null (the `descPart` is only used when `newData.description` is truthy)
- Confirm: title unchanged — still `${newData.name} en ${commune}`

---

## Task 4 — COPY-04: Rewrite `[slug].vue` profile description

**Requirement:** COPY-04
**File:** `apps/website/app/pages/[slug].vue`
**Why:** The description uses `"equipamiento industrial"` which is not canonical vocabulary. Must be replaced with `"activos industriales"`. The title (`Perfil de ${username}`) is already correct from Phase 36.

**Scope of changes:** Lines 159–165 (the `$setSEO` call inside the `watch` callback)

**Actions:**

1. In the `watch` callback (line ~159), update only the `description` string:

   Before:
   ```typescript
   $setSEO({
     title: `Perfil de ${newData.user.username}`,
     description: `Vendedor verificado en Waldo.click®. Explora los anuncios de ${newData.user.username} ${location} y encuentra equipamiento industrial al mejor precio.`,
   ```

   After:
   ```typescript
   $setSEO({
     title: `Perfil de ${newData.user.username}`,
     description: `Vendedor verificado en Waldo.click®. Explora los anuncios de activos industriales de ${newData.user.username} ${location} y compra directo al vendedor.`,
   ```

**Verification:**
- `yarn workspace website typecheck` — no TypeScript errors
- Confirm: description contains `activos industriales` (not `equipamiento industrial`)
- Confirm: description contains `Waldo.click®` (with ®)
- Confirm: no numeric counter in description
- Confirm: description length for 20-char username + "en Chile" = `"Vendedor verificado en Waldo.click®. Explora los anuncios de activos industriales de JohnDoe2024 en Chile y compra directo al vendedor.".length` = 135 ✅ (120–155)
- Confirm: title unchanged — still `Perfil de ${newData.user.username}`

---

## Commit Strategy

Each task is committed independently (four commits). All are in the same wave — commit order within the wave does not matter.

| Task | Files Changed | Commit Message |
|------|--------------|----------------|
| 1 | `apps/website/app/pages/index.vue` | `copy(seo): rewrite home page title and description with canonical vocabulary` |
| 2 | `apps/website/app/pages/anuncios/index.vue` | `copy(seo): rewrite ad listing SEO generator functions with canonical vocabulary` |
| 3 | `apps/website/app/pages/anuncios/[slug].vue` | `copy(seo): rewrite ad detail description template with budget-aware slicing` |
| 4 | `apps/website/app/pages/[slug].vue` | `copy(seo): rewrite user profile description with canonical vocabulary` |

---

## Success Criteria Checklist

- [ ] COPY-01: `index.vue` title is `"Anuncios de Activos Industriales en Chile"` (41 chars ≤ 45); contains `anuncios` and `activos industriales`; description is 135 chars (120–155); contains `Waldo.click®`
- [ ] COPY-02: `anuncios/index.vue` default-state title is `"Anuncios de Activos Industriales"` (32 chars ≤ 45); commune-only branch `"Activos Industriales en Antofagasta"` = 35 chars ≤ 45; all description branches contain `Waldo.click®`; no `${totalAds}` in any branch; default description is 134 chars (120–155)
- [ ] COPY-03: `anuncios/[slug].vue` null-description fallback is 143 chars for "Torno CNC Haas ST-20 en Santiago" (120–155); description contains `Waldo.click®`; no double-space; title unchanged from Phase 36
- [ ] COPY-04: `[slug].vue` description contains `activos industriales`; description is 135 chars for 10-char username + "en Chile" (120–155); contains `Waldo.click®`; no numeric counter; title unchanged from Phase 36
- [ ] `yarn workspace website typecheck` passes with zero errors
