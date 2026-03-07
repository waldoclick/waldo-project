# Phase 36: SEO Bug Fixes - Research

**Researched:** 2026-03-07
**Domain:** Nuxt 4 SEO — `$setSEO` plugin, `useSeoMeta`, `@nuxtjs/seo` title template, `definePageMeta`
**Confidence:** HIGH

---

## Summary

Phase 36 fixes four concrete SEO bugs in `apps/website`. All bugs are in the `app/pages/` layer. There are no architectural changes, no new dependencies, and no new files: every fix is a targeted edit to an existing `.vue` page.

The core mechanism is the `$setSEO` plugin (`app/plugins/seo.ts`), which calls `useSeoMeta()` with the title/description the page passes in. `@nuxtjs/seo` appends the global site suffix (configured as `site.name: "Waldo.click®"` in `nuxt.config.ts`) automatically via its title template — any literal `| Waldo.click®` suffix embedded inside the title string passed to `$setSEO` therefore produces a visible double-suffix in the rendered `<title>` tag.

BUG-01 and BUG-02 share the same root cause (manually embedded suffix). BUG-03 is an SSR timing issue — `$setSEO` is only called inside a `watch`, never at the top-level synchronous setup context, so server-rendered HTML has a stale title/description. BUG-04 is a missing `useSeoMeta({ robots: "noindex, nofollow" })` on a private authenticated page.

**Primary recommendation:** One task per bug. Fixes are independent; all four can be parallelized by wave.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-01 | `anuncios/[slug].vue` — remove `| Venta de Equipo en Waldo.click` from title; add `®` to description; prevent double-space when `newData.description` is null | Title string on line 188-189 of `anuncios/[slug].vue`; description template on lines 190-196 |
| BUG-02 | `[slug].vue` (user profile) — remove manually embedded `| Waldo.click®` from title; remove `${totalAds}` counter from description | Title on line 161 of `[slug].vue`; description on line 162 |
| BUG-03 | `anuncios/index.vue` — `$setSEO` must fire in SSR-safe context (not only inside a `watch`); description must end with `Waldo.click®` (with ®) | Watch on lines 318-339 of `anuncios/index.vue`; `generateSEODescription` returns `...Waldo.click` (no ®) on line 314 |
| BUG-04 | `packs/index.vue` — declare `useSeoMeta({ robots: "noindex, nofollow" })` | No robots meta present in `packs/index.vue`; page has `middleware: "auth"` so it's authenticated-only |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@nuxtjs/seo` | installed (nuxt.config.ts) | Auto-appends `site.name` to every `<title>` via title template | Project standard; already configured |
| `useSeoMeta()` | Nuxt 4 built-in | Sets all `<meta>` tags reactively | Used by `$setSEO` plugin |
| `$setSEO` plugin | `app/plugins/seo.ts` | Project wrapper around `useSeoMeta()` | Project standard for all page meta |
| `definePageMeta()` | Nuxt 4 built-in | Page-level static configuration | Already used in `packs/index.vue` |

### How `@nuxtjs/seo` title template works
`site.name: "Waldo.click®"` in `nuxt.config.ts` → `@nuxtjs/seo` automatically produces `{title} | Waldo.click®` as the final rendered title. Any page that embeds `| Waldo.click®` inside the string passed to `$setSEO`/`useSeoMeta` will produce `{title} | Waldo.click® | Waldo.click®` — the double-suffix.

**Installation:** No new packages needed.

---

## Architecture Patterns

### Pattern 1: SSR-safe `$setSEO` call
**What:** `$setSEO` (and `useSeoMeta`) called at the top-level synchronous scope of `<script setup>` is picked up on the server render. A call only inside a `watch()` fires after hydration and is therefore absent from the initial SSR HTML.

**When to use:** Always call `$setSEO` once at the top level (synchronous) for the default/initial state. Use `watch` only for updates when reactive data changes.

**Correct pattern for `anuncios/index.vue`:**
```typescript
// Source: Nuxt 4 docs — useSeoMeta is composable-safe at setup scope
// Call at synchronous setup time for SSR
$setSEO({
  title: generateSEOTitle(),
  description: generateSEODescription(),
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}${route.fullPath}`,
});

// Keep watch for client-side reactive updates
watch(
  [() => adsData.value, () => route.query],
  () => { /* same call */ },
);
```

### Pattern 2: Clean title (no manual suffix)
**What:** Pass only the page-specific part of the title to `$setSEO`. Let `@nuxtjs/seo` append ` | Waldo.click®`.

**Before (BUG-01):**
```typescript
title: `${newData.name} en ${commune} | Venta de Equipo en Waldo.click`,
// Renders as: "{name} en {commune} | Venta de Equipo en Waldo.click | Waldo.click®"
```

**After:**
```typescript
title: `${newData.name} en ${commune}`,
// Renders as: "{name} en {commune} | Waldo.click®"
```

**Before (BUG-02):**
```typescript
title: `Perfil de ${newData.user.username} | Waldo.click®`,
// Renders as: "Perfil de {username} | Waldo.click® | Waldo.click®"
```

**After:**
```typescript
title: `Perfil de ${newData.user.username}`,
// Renders as: "Perfil de {username} | Waldo.click®"
```

### Pattern 3: Null-safe description (no double-space)
**What:** When `newData.description` is null/undefined, the current template produces `". Encuentra más..."` with a leading space.

**Before (BUG-01):**
```typescript
description: `¡Oportunidad! ${name} en ${commune}. ${
  newData.description
    ? String(newData.description).slice(0, 150) + "..."
    : ""
} Encuentra más equipo industrial en Waldo.click`,
// When description is null: "¡Oportunidad! {name} en {commune}.  Encuentra..." (double-space)
```

**After:**
```typescript
const descPart = newData.description
  ? ` ${String(newData.description).slice(0, 150)}...` 
  : "";
description: `¡Oportunidad! ${name} en ${commune}.${descPart} Encuentra más activos industriales en Waldo.click®`,
```

### Pattern 4: `useSeoMeta` for robots noindex
**What:** `useSeoMeta({ robots: "noindex, nofollow" })` is the Nuxt 4 idiomatic way to set `<meta name="robots">` on a per-page basis.

**Where to add it in `packs/index.vue`:**
```typescript
// After existing $setSEO call, before definePageMeta
useSeoMeta({ robots: "noindex, nofollow" });
```

Note: `packs/index.vue` already has `middleware: "auth"` in `definePageMeta`. The robots meta must be separate (it's a runtime meta tag, not a page configuration key).

### Anti-Patterns to Avoid
- **Calling `$setSEO` only inside `watch()`:** Server HTML will be missing correct title/description on first load.
- **Embedding `| Waldo.click®` in the title string:** Produces double-suffix due to `@nuxtjs/seo` title template.
- **Bare string concatenation for optional description parts:** Produces double-spaces when the optional part is empty — use a pre-computed variable with conditional leading space instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Robots meta tag | Custom `<meta>` in `<template>` | `useSeoMeta({ robots })` | Nuxt handles deduplication and SSR |
| Title suffix | Manually append ` | Waldo.click®` | Let `@nuxtjs/seo` do it via `site.name` | Already configured globally |

---

## Common Pitfalls

### Pitfall 1: Double-suffix from `@nuxtjs/seo`
**What goes wrong:** Title rendered as `Foo | Waldo.click® | Waldo.click®`
**Why it happens:** `@nuxtjs/seo` reads `site.name` and appends it; page also embeds it manually
**How to avoid:** Never embed ` | Waldo.click®` (or any form of the site name) in the title string passed to `$setSEO`
**Warning signs:** `grep -r "Waldo.click" app/pages/ --include="*.vue"` showing it in a title string

### Pitfall 2: SSR title/description missing
**What goes wrong:** Googlebot sees stale/empty title because `$setSEO` only fires after hydration
**Why it happens:** `watch()` with `{ immediate: true }` fires synchronously on the client but **after** SSR serialization — the server HTML is rendered before the watch callback runs
**How to avoid:** Always call `$setSEO` once in the synchronous top-level setup scope; keep the watch for reactive updates

### Pitfall 3: Double-space in description when optional field is null
**What goes wrong:** `"...en Chile.  Encuentra..."` (two spaces)
**Why it happens:** `${condition ? value + "..." : ""} next word` — when falsy, empty string is followed by a space
**How to avoid:** Use a pre-computed variable: `const part = val ? ` ${val}...` : ""` so the space is part of the value, not trailing

### Pitfall 4: `definePageMeta` vs runtime `useSeoMeta`
**What goes wrong:** Trying to set `robots` inside `definePageMeta` (compile-time macro)
**Why it happens:** `definePageMeta` is a compile-time macro — it does not accept runtime meta values
**How to avoid:** Use `useSeoMeta({ robots: "noindex, nofollow" })` for runtime meta; use `definePageMeta` only for routing concerns (`middleware`, `alias`, etc.)

---

## Code Examples

### BUG-01 fix — `anuncios/[slug].vue` (lines 186-196)
```typescript
// Source: current file analysis — lines 186-196
// BEFORE:
$setSEO({
  title: `${newData.name} en ${newData.commune?.name || "Chile"} | Venta de Equipo en Waldo.click`,
  description: `¡Oportunidad! ${String(newData.name)} en ${
    newData.commune?.name || "Chile"
  }. ${
    newData.description
      ? String(newData.description).slice(0, 150) + "..."
      : ""
  } Encuentra más equipo industrial en Waldo.click`,
  ...
});

// AFTER:
const commune = newData.commune?.name || "Chile";
const descPart = newData.description
  ? ` ${String(newData.description).slice(0, 150)}...`
  : "";
$setSEO({
  title: `${newData.name} en ${commune}`,
  description: `¡Oportunidad! ${String(newData.name)} en ${commune}.${descPart} Encuentra más activos industriales en Waldo.click®`,
  ...
});
```

### BUG-02 fix — `[slug].vue` (lines 160-163)
```typescript
// Source: current file analysis — lines 160-163
// BEFORE:
$setSEO({
  title: `Perfil de ${newData.user.username} | Waldo.click®`,
  description: `Explora los ${totalAds} anuncios publicados por ${newData.user.username} ${location}. Encuentra los mejores precios en equipamiento industrial en Waldo.click®.`,
  ...
});

// AFTER:
$setSEO({
  title: `Perfil de ${newData.user.username}`,
  description: `Vendedor verificado en Waldo.click®. Explora los anuncios de ${newData.user.username} ${location} y encuentra equipamiento industrial al mejor precio.`,
  ...
});
```

### BUG-03 fix — `anuncios/index.vue` (before watch block, line ~317)
```typescript
// Source: current file analysis — lines 317-339
// Add synchronous SSR-safe call BEFORE the watch:
if (adsData.value) {
  $setSEO({
    title: generateSEOTitle(),
    description: generateSEODescription(),
    imageUrl: `${config.public.baseUrl}/share.jpg`,
    url: `${config.public.baseUrl}${route.fullPath}`,
  });
}

// Also fix generateSEODescription to use Waldo.click® (with ®):
// Line 314: change "Waldo.click" → "Waldo.click®"
```

### BUG-04 fix — `packs/index.vue` (after `$setSEO` call, line ~46)
```typescript
// Source: current file analysis — line 46
// Add after the existing $setSEO call:
useSeoMeta({ robots: "noindex, nofollow" });
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Manual `| site name` in title | `@nuxtjs/seo` `site.name` global template | Double-suffix if both used |
| `watch({ immediate: true })` only | Top-level sync `$setSEO` + watch for updates | SSR title populated correctly |

---

## Open Questions

None — all four bugs are fully diagnosed from source code. No ambiguity in fixes required.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + `@nuxt/test-utils` |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn workspace website test run` |
| Full suite command | `yarn workspace website test run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | Ad detail title has no double-suffix; description has `Waldo.click®`; no double-space when description is null | manual-only | — | N/A |
| BUG-02 | User profile title has no `\| Waldo.click®` embedded; description has no `${totalAds}` counter | manual-only | — | N/A |
| BUG-03 | Ad listing page SSR HTML contains correct title/description on initial server render | manual-only | — | N/A |
| BUG-04 | `packs/index.vue` emits `<meta name="robots" content="noindex, nofollow">` | manual-only | — | N/A |

**Why manual-only:** All four bugs are SEO meta tag rendering issues. `@nuxt/test-utils` can mount pages, but verifying the final rendered `<title>` and `<meta>` tags in SSR output requires a running Nuxt server. These are best verified by visual inspection of the rendered HTML (`curl` or browser DevTools) during the verification step, not via unit tests.

### Sampling Rate
- **Per task commit:** TypeScript build check — `yarn workspace website typecheck`
- **Per wave merge:** `yarn workspace website test run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers the project. No new test files are needed for this phase (manual verification is sufficient and appropriate for meta tag rendering).

---

## Sources

### Primary (HIGH confidence)
- Direct source code analysis — `apps/website/app/plugins/seo.ts` (how `$setSEO` works)
- Direct source code analysis — `apps/website/nuxt.config.ts` (site.name = "Waldo.click®", confirming auto-suffix mechanism)
- Direct source code analysis — `apps/website/app/pages/anuncios/[slug].vue` (BUG-01 location: lines 186-196)
- Direct source code analysis — `apps/website/app/pages/[slug].vue` (BUG-02 location: lines 160-163)
- Direct source code analysis — `apps/website/app/pages/anuncios/index.vue` (BUG-03 location: lines 317-339, line 314)
- Direct source code analysis — `apps/website/app/pages/packs/index.vue` (BUG-04: no robots meta present)

### Secondary (MEDIUM confidence)
- Nuxt 4 docs pattern: `useSeoMeta` is safe at synchronous setup scope for SSR

---

## Metadata

**Confidence breakdown:**
- Bug locations: HIGH — read directly from source files
- Fix patterns: HIGH — derived from how `@nuxtjs/seo` + `$setSEO` work together
- SSR timing behavior: HIGH — standard Nuxt 4 pattern
- Test approach: HIGH — meta tag testing is correctly manual/smoke-only

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable Nuxt 4 patterns)
