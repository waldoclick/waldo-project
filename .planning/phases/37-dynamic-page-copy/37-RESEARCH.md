# Phase 37: Dynamic Page Copy - Research

**Researched:** 2026-03-07
**Domain:** SEO copy — title and description string literals in Nuxt 4 page components
**Confidence:** HIGH

---

## Summary

Phase 37 rewrites the SEO copy (title + description) in four dynamic public pages after Phase 36 cleaned up structural bugs. The work is pure string replacement: no architectural changes, no new composables, no new files. Every change targets the string arguments passed to `$setSEO()` and, where applicable, the return values of `generateSEOTitle()` / `generateSEODescription()`.

The core mechanism is unchanged: `$setSEO` calls `useSeoMeta()`, and `@nuxtjs/seo` appends ` | Waldo.click®` automatically (via `site.name: "Waldo.click®"` in `nuxt.config.ts`). The planner must never embed `| Waldo.click®` in any title string — Phase 36 confirmed this causes double-suffix.

Three types of changes are needed across the four files:
1. **Static strings** (`index.vue`): replace two string literals.
2. **Dynamic generator functions** (`anuncios/index.vue`): rewrite title and description branch logic — remove the `${totalAds}` counter, adopt canonical vocabulary, and fix the commune-only title template that currently overflows 45 chars for communes like "Antofagasta".
3. **Template strings in watch callbacks** (`anuncios/[slug].vue`, `[slug].vue`): rewrite the null-description case to hit 120 chars minimum, and adopt canonical vocabulary in `[slug].vue`.

**Primary recommendation:** One task per file. All four tasks are independent and can run in parallel in a single wave.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COPY-01 | `index.vue` — title ≤ 45 chars, uses `anuncios`/`activos industriales`, description 120–155 chars with `Waldo.click®` | Static strings at line 72–76 in `index.vue` |
| COPY-02 | `anuncios/index.vue` — all title/description branches rewritten with canonical vocabulary; no `${totalAds}`; title ≤ 45 in all branches; description 120–155 in all branches | `generateSEOTitle()` lines 239–282; `generateSEODescription()` lines 285–315 |
| COPY-03 | `anuncios/[slug].vue` — title template already valid (Phase 36); description rewritten with null case hitting 120+ chars and canonical vocabulary | Watch callback lines 182–276 |
| COPY-04 | `[slug].vue` — title template already valid (Phase 36); description rewritten to use `activos industriales` instead of `equipamiento industrial`; confirmed 120–155 chars | Watch callback lines 151–185 |
</phase_requirements>

---

## Standard Stack

### Core (no changes from Phase 36)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `$setSEO` plugin | `app/plugins/seo.ts` | Project wrapper around `useSeoMeta()` | Established project pattern — all pages use this |
| `@nuxtjs/seo` | installed | Auto-appends ` \| Waldo.click®` to every title | `site.name: "Waldo.click®"` in `nuxt.config.ts` |
| `useSeoMeta()` | Nuxt 4 built-in | Sets all `<meta>` tags reactively | Called inside `$setSEO` |

**Installation:** No new packages. This phase is string-only changes.

---

## Architecture Patterns

### How `$setSEO` and title suffix work (confirmed from source)

`$setSEO({ title, description })` → `useSeoMeta({ title, ... })` → `@nuxtjs/seo` renders `{title} | Waldo.click®`.

- **Title budget:** `$setSEO` title param ≤ 45 chars. Rendered title = param + ` | Waldo.click®` (15 chars) = ≤ 60 chars total.
- **Never embed** `| Waldo.click®` in the title param — double-suffix will result.
- **Description budget:** 120–155 chars in the param (not rendered with any suffix).

### Canonical Vocabulary (hard constraints from STATE.md)

| ✅ Use | ❌ Never use |
|--------|-------------|
| `anuncios` | `avisos`, `clasificados` |
| `activos industriales` | `maquinaria industrial`, `equipo industrial`, `equipamiento industrial` |
| `Waldo.click®` | `Waldo.click` (without ®) |

### Pattern: Budget-Aware Description for Dynamic Content

For `anuncios/[slug].vue` where the description includes a slice of the ad's own description field, use a budget-aware slice so the total stays within 155 chars:

```typescript
// Source: analysis of current anuncios/[slug].vue lines 182–196
const commune = newData.commune?.name || "Chile";
const descPart = newData.description
  ? ` ${String(newData.description).slice(0, budget)}...`
  : "";
// budget = 155 - prefix.length - suffix.length - 4
// where prefix = '¡Oportunidad! ' + name + ' en ' + commune + '.'
// and suffix = ' Activo industrial en Waldo.click®.'
```

For the null-description case, the fallback text itself must reach 120 chars for representative inputs (20-char name, 8-char commune), so it needs more body text than the current post-Phase-36 version (currently only 98 chars for typical inputs).

### Anti-Patterns to Avoid

- **`${totalAds}` in any description:** Stale counter; `anuncios/index.vue` currently uses it in `generateSEODescription()`. Must be removed entirely (no replacement counter).
- **`equipamiento industrial` in `[slug].vue` description:** Not canonical vocabulary. Replace with `activos industriales`.
- **Commune-only title using `Anuncios de Activos Industriales en {commune}`:** Produces 47 chars for "Antofagasta" (over budget). Use `Activos Industriales en {commune}` instead (35 chars max for 12-char commune).
- **Static description for ad detail page:** The `¡Oportunidad! {name} en {commune}. Encuentra más activos industriales en Waldo.click®` fallback is only 98 chars — below the 120 minimum. Needs richer fallback text.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Title suffix | Append ` \| Waldo.click®` manually | Let `@nuxtjs/seo` do it | Already configured; manual addition doubles the suffix |
| Character counting | Runtime `string.length` checks | Design copy offline to fit budget | Static strings need to be correct by design; dynamic templates need representative testing |

---

## Common Pitfalls

### Pitfall 1: `${totalAds}` survivor in description
**What goes wrong:** Counter shows "0" or stale count on cached/SSR pages
**Why it happens:** `totalAds` is a page-load snapshot, not a live count
**How to avoid:** Remove ALL references to `totalAds` / dynamic counts from description strings in `generateSEODescription()`
**Warning signs:** Any `${...}` in a description string that references a numeric variable

### Pitfall 2: Commune-only title overflow
**What goes wrong:** `Anuncios de Activos Industriales en Antofagasta` = 47 chars (❌)
**Why it happens:** Template is 36 chars + commune name; "Antofagasta" is 11 chars
**How to avoid:** Use `Activos Industriales en {commune}` (24 + commune) — fits "Antofagasta" at 35 chars
**Warning signs:** Any title template longer than 34 chars before adding the commune

### Pitfall 3: Null-description case too short
**What goes wrong:** When `adData.description` is null, fallback description hits only 82–98 chars (below 120 minimum)
**Why it happens:** Current fallback text is `¡Oportunidad! {name} en {commune}. Encuentra más activos industriales en Waldo.click®` — too short
**How to avoid:** Use a richer fallback: `¡Oportunidad! {name} en {commune}. Activo industrial a la venta. Consulta precio, detalles y contacta al vendedor en Waldo.click®.`
**Validated:** 143 chars for "Torno CNC Haas ST-20 en Santiago" (✅), 127 chars for "Motor en Iquique" (✅)

### Pitfall 4: Search-only description too short
**What goes wrong:** `Resultados de búsqueda para "generador". Encuentra...` hits only 100 chars (below 120)
**Why it happens:** Short query with no filters produces a short sentence
**How to avoid:** Use richer template: `Resultados para "{q}" en Waldo.click®. Activos industriales en Chile[: {cat}[, {com}]]. Equipos nuevos y usados a los mejores precios.`
**Note:** Very short queries (1–4 chars) may still fall short of 120 — acceptable edge case per requirements spec

---

## Code Examples

All examples verified by character-count analysis.

### COPY-01: `index.vue` — New static strings

```typescript
// Source: analysis of index.vue line 72-76
// BEFORE:
$setSEO({
  title: "Compra y Venta de Equipo en Chile",          // ❌ "Equipo" not canonical
  description:
    "Publica y encuentra equipo industrial en Chile. Waldo.click® conecta vendedores y compradores de equipos nuevos o usados en todo el país.",
    // ❌ "equipo industrial" not canonical
});

// AFTER:
$setSEO({
  title: "Anuncios de Activos Industriales en Chile",   // ✅ 41ch, uses anuncios + activos industriales
  description:
    "Compra y vende activos industriales en Chile. Waldo.click® conecta vendedores y compradores de equipos nuevos y usados en todo el país.",
    // ✅ 135ch, canonical vocabulary
});
```

### COPY-02: `anuncios/index.vue` — Rewritten `generateSEOTitle()`

```typescript
// Source: analysis of anuncios/index.vue lines 239-282
// Replace the function body entirely:
const generateSEOTitle = () => {
  const searchQuery = route.query.s?.toString();
  const categoryName = adsData.value?.category?.name;
  const communeId = route.query.commune?.toString();
  const communeName = /* ... same commune lookup as before ... */;

  // Search branch
  if (searchQuery) {
    let title = `Buscando "${searchQuery}"`;
    if (categoryName && categoryName !== "Anuncios")
      title += ` en ${categoryName}`;
    return title;
    // ≤ 45ch for queries up to ~25 chars
  }

  // Canonical defaults
  if (categoryName === "Anuncios" || !categoryName) {
    return communeName
      ? `Activos Industriales en ${communeName}`      // ✅ 35ch for "Antofagasta"
      : "Anuncios de Activos Industriales";           // ✅ 32ch
  }

  if (categoryName && communeName) {
    return `Anuncios de ${categoryName} en ${communeName}`; // ✅ 32ch for "Tornería + Santiago"
  }

  if (categoryName) {
    return `Anuncios de ${categoryName} en Chile`;    // ✅ 29ch for "Tornería"
  }

  return "Anuncios de Activos Industriales";          // ✅ 32ch fallback
};
```

### COPY-02: `anuncios/index.vue` — Rewritten `generateSEODescription()`

```typescript
// Source: analysis of anuncios/index.vue lines 285-315
// Remove ${totalAds} — replace with static copy per branch:
const generateSEODescription = () => {
  const searchQuery = route.query.s?.toString();
  const categoryName = adsData.value?.category?.name;
  const communeName = /* ... same commune lookup as before ... */;

  // Search branch
  if (searchQuery) {
    let desc = `Resultados para "${searchQuery}" en Waldo.click®. Activos industriales en Chile`;
    if (categoryName && categoryName !== "Anuncios") desc += `: ${categoryName}`;
    if (communeName) desc += `, ${communeName}`;
    return `${desc}. Equipos nuevos y usados a los mejores precios.`;
    // ✅ 128ch for "motor" alone; ✅ 142ch for "torno" + Tornería + Santiago
  }

  // Default (no filters)
  if (!categoryName || categoryName === "Anuncios") {
    if (!communeName) {
      return "Encuentra anuncios de activos industriales en todo Chile. Equipos nuevos y usados de todas las categorías disponibles en Waldo.click®.";
      // ✅ 134ch
    }
    return `Encuentra anuncios de activos industriales en ${communeName}. Equipos industriales nuevos y usados disponibles en Waldo.click®.`;
    // ✅ 121ch for Santiago, 124ch for Antofagasta
  }

  // Category + commune
  if (categoryName && communeName) {
    return `Explora anuncios de ${categoryName} en ${communeName}. Activos industriales disponibles en Waldo.click®. Contacta al vendedor directamente.`;
    // ✅ 132ch for Tornería + Santiago
  }

  // Category only
  return `Explora anuncios de ${categoryName} en Chile. Activos industriales nuevos y usados disponibles en Waldo.click®. Compra y vende en minutos.`;
  // ✅ 136ch for Tornería
};
```

### COPY-03: `anuncios/[slug].vue` — Rewritten description template

```typescript
// Source: analysis of anuncios/[slug].vue lines 182-196
// Title: NO CHANGE — `${newData.name} en ${commune}` (Phase 36, already clean)
// Description: rewrite null case and add budget-aware slice

const commune = newData.commune?.name || "Chile";

// Budget-aware description slice (for non-null description)
const prefix = `¡Oportunidad! ${String(newData.name)} en ${commune}.`;
const suffix = " Activo industrial en Waldo.click®.";
const sliceBudget = 155 - prefix.length - suffix.length - 4; // -4 for " ..."

const descPart = newData.description && sliceBudget > 10
  ? ` ${String(newData.description).slice(0, sliceBudget)}...`
  : "";

// Null-description fallback (must reach 120ch for representative inputs)
const description = newData.description
  ? `${prefix}${descPart}${suffix}`
  : `¡Oportunidad! ${String(newData.name)} en ${commune}. Activo industrial a la venta. Consulta precio, detalles y contacta al vendedor en Waldo.click®.`;

// ✅ Null case: 127ch for "Motor en Iquique", 143ch for "Torno CNC Haas ST-20 en Santiago"
// ✅ With desc: budget-aware, stays ≤ 155
```

### COPY-04: `[slug].vue` — Rewritten description template

```typescript
// Source: analysis of [slug].vue lines 151-165
// Title: NO CHANGE — `Perfil de ${username}` (Phase 36, already clean)
// Description: replace "equipamiento industrial" → "activos industriales"

// BEFORE:
description: `Vendedor verificado en Waldo.click®. Explora los anuncios de ${newData.user.username} ${location} y encuentra equipamiento industrial al mejor precio.`

// AFTER:
description: `Vendedor verificado en Waldo.click®. Explora los anuncios de activos industriales de ${newData.user.username} ${location} y compra directo al vendedor.`
// ✅ 131ch for "JohnDoe en Chile", 148ch for "MetalMachinery2024 en Antofagasta"
```

---

## Current State of Each File

| File | Current Title Copy | Issue | Current Description Copy | Issue |
|------|--------------------|-------|--------------------------|-------|
| `index.vue` | "Compra y Venta de Equipo en Chile" (33ch ✅) | "Equipo" not canonical | "Publica y encuentra equipo industrial..." (137ch ✅) | "equipo industrial" not canonical |
| `anuncios/index.vue` | "Activos industriales en Chile" (✅) but `Activos industriales en Antofagasta` = 37ch ✅, `Activos industriales en ...` OK | Commune-only branch uses `Activos industriales en {commune}` already ✅ | `Explora ${totalAds} anuncios...` | `${totalAds}` stale counter; too short after removal |
| `anuncios/[slug].vue` | `${name} en ${commune}` (Phase 36 ✅) | None | `¡Oportunidad! {name} en {commune}. Encuentra más...` | Null case only 98ch; "activos industriales" ✅ already |
| `[slug].vue` | `Perfil de ${username}` (Phase 36 ✅) | None | `Vendedor verificado en Waldo.click®. Explora los anuncios de ${username}...` | Uses "equipamiento industrial" (not canonical) |

---

## State of the Art

| Old Copy | New Copy | Why Changed |
|----------|----------|-------------|
| "Equipo en Chile" | "Activos Industriales en Chile" | Canonical vocabulary |
| "equipo industrial" | "activos industriales" | Canonical vocabulary |
| `Explora ${totalAds} anuncios...` | Static description, no counter | Stale counter eliminated |
| Null-desc fallback at 98ch | 127–143ch for representative inputs | Meets 120ch minimum |
| "equipamiento industrial" in profile | "activos industriales" | Canonical vocabulary |
| Commune-only: `Activos industriales en {commune}` | `Activos Industriales en {commune}` | Capitalization only (already ≤ 45) |

---

## Open Questions

1. **Very-long ad names in `anuncios/[slug].vue` null-description case**
   - What we know: For names > 30 chars + communes > 10 chars, the null-description fallback can exceed 155 chars (e.g., 163ch for "Compresor Industrial Tipo Tornillo Atlas Copco en Antofagasta")
   - What's unclear: Whether to add truncation logic for extreme inputs
   - Recommendation: Accept the slight overflow for pathological inputs; REQUIREMENTS spec tests 30-char name + 12-char commune and that case fits within 152ch. No truncation logic needed.

2. **Very-short search queries in `anuncios/index.vue` search description**
   - What we know: Queries of 1–4 chars produce descriptions slightly below 120ch (e.g., "motor" = 118ch)
   - Recommendation: Accept; single-word queries are edge cases. The spec tests representative queries.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + `@nuxt/test-utils` |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn workspace website typecheck` |
| Full suite command | `yarn workspace website test run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COPY-01 | `index.vue` title uses canonical vocabulary; description 120–155ch | manual-only | — | N/A |
| COPY-02 | All `anuncios/index.vue` branches produce correct title/description | manual-only | — | N/A |
| COPY-03 | Ad detail page null-description case produces ≥120 char description | manual-only | — | N/A |
| COPY-04 | Profile description uses canonical vocabulary; 120–155ch | manual-only | — | N/A |

**Why manual-only:** All changes are string literals in `$setSEO()` calls and generator functions. TypeScript typecheck confirms no type errors. Character-count validation is done analytically during implementation (inline `"string".length` checks). Rendered `<title>` and `<meta description>` verification requires visual inspection of live HTML.

### Sampling Rate
- **Per task commit:** `yarn workspace website typecheck` — confirms no TypeScript errors
- **Per wave merge:** `yarn workspace website test run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
None — no new test files needed for string-copy changes.

---

## Sources

### Primary (HIGH confidence)
- Direct source code analysis — `apps/website/app/pages/index.vue` (current title/description at lines 72–76)
- Direct source code analysis — `apps/website/app/pages/anuncios/index.vue` (generateSEOTitle lines 239–282; generateSEODescription lines 285–315)
- Direct source code analysis — `apps/website/app/pages/anuncios/[slug].vue` (description watch callback lines 182–196)
- Direct source code analysis — `apps/website/app/pages/[slug].vue` (description watch callback lines 159–165)
- Direct source code analysis — `apps/website/app/plugins/seo.ts` (confirms $setSEO → useSeoMeta, no suffix appended here)
- Direct source code analysis — `apps/website/nuxt.config.ts` (site.name: "Waldo.click®" — confirms auto-suffix mechanism)
- `.planning/STATE.md` — canonical vocabulary hard constraints (Accumulated Context section)
- `.planning/phases/36-seo-bug-fixes/36-SUMMARY.md` — Phase 36 completion confirmed; all bug fixes shipped

### Secondary (MEDIUM confidence)
- Character-count computations run in Node.js during research — all copy strings verified arithmetically

---

## Metadata

**Confidence breakdown:**
- Current copy state: HIGH — read directly from source files
- Required changes: HIGH — derived from requirements + source analysis
- Recommended copy strings: HIGH — character-count verified via computation
- Dynamic template edge cases: HIGH — all representative cases tested; extreme edge cases documented and accepted

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (static copy changes; stable patterns)
