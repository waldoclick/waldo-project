# Phase 38: Static Page Copy — Research

**Researched:** 2026-03-07
**Domain:** Nuxt 4 SEO meta copy — static pages
**Confidence:** HIGH

---

## Summary

Phase 38 is a pure copy-rewrite task: four static public pages need their `$setSEO()` title and description strings updated to use canonical vocabulary and hit the character budgets established in v1.16. No new libraries, no structural changes, no new patterns are required. The `$setSEO` plugin and `$setStructuredData` calls already exist in every file; only the string arguments change.

All four pages have identical issues: descriptions are below the 120-char minimum (by 10–29 chars depending on the page), and `sitemap.vue` additionally uses bare `Waldo.click` (without `®`) in its description. Three of four pages also lack the canonical vocabulary keywords (`anuncios`, `activos industriales`) that Phase 37 established as the standard.

The work is straightforward: craft new title and description strings, verify character counts, and edit exactly one `$setSEO()` call per file (plus the matching `$setStructuredData` description where relevant). `npx nuxt typecheck` (run from `apps/website/`) serves as the automated gate — it catches any string type errors and confirms zero TypeScript regressions.

**Primary recommendation:** Edit the `$setSEO()` call in each of the four files, replacing only the `title:` and `description:` string arguments. Keep all other call-site arguments (`imageUrl`, `url`) unchanged. Mirror the description into `$setStructuredData` where it already appears.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COPY-05 | `preguntas-frecuentes.vue` — vocabulary revised to canonical terms; title ≤ 45 chars; description 120–155 chars | Current title is 20 chars (compliant); description is 110 chars (10 short); no `anuncios` keyword; proposed copy validated at 35 / 143 chars |
| COPY-06 | `contacto/index.vue` — title expanded beyond single word "Contacto"; title ≤ 45 chars; description 120–155 chars | Current title is "Contacto" (8 chars, must change); description is 113 chars (7 short); proposed copy validated at 18 / 137 chars |
| COPY-07 | `sitemap.vue` — replace bare `Waldo.click` with `Waldo.click®`; title ≤ 45 chars; description 120–155 chars | Current description has bare `Waldo.click` (no ®) and is 91 chars (29 short); proposed copy validated at 14 / 132 chars |
| COPY-08 | `politicas-de-privacidad.vue` — vocabulary revised; title ≤ 45 chars; description 120–155 chars | Current description is 102 chars (18 short); lacks `anuncios` and `activos industriales`; proposed copy validated at 23 / 134 chars |
</phase_requirements>

---

## Current State Audit

### COPY-05: `apps/website/app/pages/preguntas-frecuentes.vue`

**`$setSEO()` location:** Lines 38–44

```vue
$setSEO({
  title: "Preguntas Frecuentes",
  description:
    "Resuelve tus dudas sobre cómo funciona Waldo.click®, la plataforma para comprar y vender activos industriales.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/preguntas-frecuentes`,
});
```

**Issues found:**
| Check | Current | Status |
|-------|---------|--------|
| Title length | 20 chars | ✅ ≤ 45 |
| Title has `\| Waldo.click` embedded | No | ✅ |
| Description length | 110 chars | ❌ TOO SHORT — needs ≥ 10 more chars |
| `anuncios` in copy | No | ❌ Missing keyword |
| `activos industriales` in copy | Yes (description) | ✅ |
| `Waldo.click®` (with ®) | Yes | ✅ |
| Forbidden terms | None | ✅ |

**Also note:** `$setStructuredData` on lines 46–61 reuses the same description string (line 51). Must be updated in sync.

---

### COPY-06: `apps/website/app/pages/contacto/index.vue`

**`$setSEO()` location:** Lines 17–23

```vue
$setSEO({
  title: "Contacto",
  description:
    "¿Tienes preguntas o necesitas ayuda? Contáctanos en Waldo.click® y nuestro equipo te responderá lo antes posible.",
  imageUrl: `${config.public.baseUrl}/contact-share.jpg`,
  url: `${config.public.baseUrl}/contacto`,
});
```

**Issues found:**
| Check | Current | Status |
|-------|---------|--------|
| Title length | 8 chars | ✅ ≤ 45 (but fails acceptance criteria) |
| Title is more than bare "Contacto" | No | ❌ MUST CHANGE per COPY-06 acceptance criteria |
| Description length | 113 chars | ❌ TOO SHORT — needs ≥ 7 more chars |
| `anuncios` in copy | No | ❌ Missing keyword |
| `activos industriales` in copy | No | ❌ Missing keyword |
| `Waldo.click®` (with ®) | Yes (description) | ✅ |
| Forbidden terms | None | ✅ |

**Also note:** `$setStructuredData` on lines 25–32 uses a different description — `"¿Tienes preguntas o necesitas ayuda? Contáctanos en Waldo.click® y nuestro equipo te responderá lo antes posible."` — same as `$setSEO`, should also be updated.

---

### COPY-07: `apps/website/app/pages/sitemap.vue`

**`$setSEO()` location:** Lines 102–107

```vue
$setSEO({
  title: "Mapa del Sitio",
  description:
    "Explora la estructura de nuestro sitio y encuentra fácilmente lo que buscas en Waldo.click.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
});
```

**Issues found:**
| Check | Current | Status |
|-------|---------|--------|
| Title length | 14 chars | ✅ ≤ 45 |
| Title has `\| Waldo.click` embedded | No | ✅ |
| Description length | 91 chars | ❌ TOO SHORT — needs ≥ 29 more chars |
| `anuncios` in copy | No | ❌ Missing keyword |
| `activos industriales` in copy | No | ❌ Missing keyword |
| `Waldo.click®` (with ®) | **NO — bare `Waldo.click`** | ❌ MISSING ® — this is the primary bug |
| Forbidden terms | None | ✅ |

**Note:** The `$setSEO()` call does NOT pass a `url:` parameter (unlike the other three pages). This is the existing pattern — do not add one.

**Also note:** `$setStructuredData` on lines 109–116 also uses the bare `Waldo.click` description (line 113–114). Must be updated in sync.

---

### COPY-08: `apps/website/app/pages/politicas-de-privacidad.vue`

**`$setSEO()` location:** Lines 18–24

```vue
$setSEO({
  title: "Políticas de Privacidad",
  description:
    "Conoce cómo Waldo.click® protege tu información personal y asegura la privacidad en tus transacciones.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/politicas-de-privacidad`,
});
```

**Issues found:**
| Check | Current | Status |
|-------|---------|--------|
| Title length | 23 chars | ✅ ≤ 45 |
| Title has `\| Waldo.click` embedded | No | ✅ |
| Description length | 102 chars | ❌ TOO SHORT — needs ≥ 18 more chars |
| `anuncios` in copy | No | ❌ Missing keyword |
| `activos industriales` in copy | No | ❌ Missing keyword |
| `Waldo.click®` (with ®) | Yes | ✅ |
| Forbidden terms | None | ✅ |

**Also note:** `$setStructuredData` on lines 26–33 reuses the same description (line 30–31). Must be updated in sync.

---

## Issues Summary

| Page | Req | Title OK? | Desc Length | Desc OK? | Missing ® | No `anuncios` kw |
|------|-----|-----------|-------------|----------|-----------|------------------|
| preguntas-frecuentes | COPY-05 | ✅ | 110 | ❌ short | ✅ | ❌ |
| contacto | COPY-06 | ❌ bare "Contacto" | 113 | ❌ short | ✅ | ❌ |
| sitemap | COPY-07 | ✅ | 91 | ❌ short | ❌ **BARE** | ❌ |
| politicas-de-privacidad | COPY-08 | ✅ | 102 | ❌ short | ✅ | ❌ |

---

## Standard Stack

This phase uses zero new libraries. The existing plugin handles everything:

| Component | Location | Purpose |
|-----------|----------|---------|
| `$setSEO()` plugin | `apps/website/app/plugins/seo.ts` | Sets `useSeoMeta()` for title, description, og:*, twitter:* |
| `$setStructuredData()` plugin | `apps/website/app/plugins/microdata.ts` | Sets structured data JSON-LD |
| `@nuxtjs/seo` module | `nuxt.config.ts` | Automatically appends `| Waldo.click®` to every title |

**Key plugin behaviour (confirmed from `seo.ts`):**
- `$setSEO({ title, description })` calls `useSeoMeta({ title, description, ogTitle, ogDescription, twitterTitle, twitterDescription, ... })`
- The `title` string passed to `$setSEO` is the raw title WITHOUT the brand suffix — `@nuxtjs/seo` appends `| Waldo.click®` automatically
- Passing `| Waldo.click®` inside the title string causes a double-suffix — **never do this**

---

## Architecture Patterns

### Pattern: Static page `$setSEO()` call

All four target files follow the same pattern. No `watch()`, no reactive variables — a single synchronous call at the top level of `<script setup>`:

```typescript
// Source: apps/website/app/pages/politicas-de-privacidad.vue (representative example)
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

$setSEO({
  title: "Static Page Title",          // ≤ 45 chars, NO | Waldo.click® suffix
  description: "120–155 char description with anuncios, activos industriales, Waldo.click®.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/page-slug`,
});
```

### Pattern: `$setStructuredData` description sync

When a page has `$setStructuredData()`, its `description:` field should match `$setSEO`'s description exactly. All four pages have this pairing — the description must be updated in both calls.

**Exception:** `sitemap.vue` `$setStructuredData` does not pass a `description` field separately — it inlines the string directly. Both the `$setSEO` and `$setStructuredData` description strings must be changed independently.

### Anti-patterns to avoid

- **Never embed `| Waldo.click®` in the title string** — `@nuxtjs/seo` appends it automatically; manual inclusion creates double-suffix
- **Never embed `Waldo.click®` in the `$setSEO` title for contacto** — renders as `Contacta con Waldo.click® | Waldo.click®` (double brand); use a brand-free expanded title instead
- **Never leave `$setStructuredData` description stale** — if `$setSEO` description changes, the structured data description must match

---

## Proposed Copy — Validated

All strings below have been verified for character counts, vocabulary, and uniqueness against the Phase 37 completed pages.

### COPY-05: `preguntas-frecuentes.vue`

```
title:       "Preguntas Frecuentes sobre Anuncios"
             → 35 chars ✅ (≤ 45)
             → rendered: "Preguntas Frecuentes sobre Anuncios | Waldo.click®" (50 chars)

description: "Resuelve tus dudas sobre cómo publicar y comprar anuncios de activos industriales en Waldo.click®. Respuestas rápidas sobre packs, pagos y más."
             → 143 chars ✅ (120–155)
             → contains: anuncios ✅, activos industriales ✅, Waldo.click® ✅
             → no forbidden terms ✅
```

### COPY-06: `contacto/index.vue`

```
title:       "Contacto y Soporte"
             → 18 chars ✅ (≤ 45) — expands beyond bare "Contacto" ✅
             → rendered: "Contacto y Soporte | Waldo.click®" (33 chars)
             → unique across all indexed pages ✅

description: "¿Tienes dudas sobre anuncios de activos industriales o necesitas ayuda? Escríbenos en Waldo.click® y nuestro equipo te responderá pronto."
             → 137 chars ✅ (120–155)
             → contains: anuncios ✅, activos industriales ✅, Waldo.click® ✅
             → no forbidden terms ✅
```

### COPY-07: `sitemap.vue`

```
title:       "Mapa del Sitio"
             → 14 chars ✅ (no change needed — title was already compliant)
             → rendered: "Mapa del Sitio | Waldo.click®" (29 chars)

description: "Navega fácilmente por Waldo.click®. Encuentra anuncios de activos industriales, categorías, comunas y todas las secciones del sitio."
             → 132 chars ✅ (120–155) — replaces 91-char bare-Waldo.click string
             → contains: anuncios ✅, activos industriales ✅, Waldo.click® ✅ (® added)
             → no forbidden terms ✅
```

### COPY-08: `politicas-de-privacidad.vue`

```
title:       "Políticas de Privacidad"
             → 23 chars ✅ (no change needed — title was already compliant)
             → rendered: "Políticas de Privacidad | Waldo.click®" (38 chars)

description: "Conoce cómo Waldo.click® protege tu información personal al publicar y comprar anuncios de activos industriales en nuestra plataforma."
             → 134 chars ✅ (120–155) — expands existing description
             → contains: anuncios ✅, activos industriales ✅, Waldo.click® ✅
             → no forbidden terms ✅
```

### Rendered Title Uniqueness (all indexed pages)

| Page | Rendered title | Chars |
|------|---------------|-------|
| `index.vue` (COPY-01) | Anuncios de Activos Industriales en Chile \| Waldo.click® | 56 |
| `anuncios/index.vue` (COPY-02) | Anuncios de Activos Industriales \| Waldo.click® | 47 |
| `anuncios/[slug].vue` (COPY-03) | {ad name} en {commune} \| Waldo.click® | dynamic |
| `[slug].vue` (COPY-04) | Perfil de {username} \| Waldo.click® | dynamic |
| `preguntas-frecuentes.vue` (COPY-05) | **Preguntas Frecuentes sobre Anuncios \| Waldo.click®** | 50 |
| `contacto/index.vue` (COPY-06) | **Contacto y Soporte \| Waldo.click®** | 33 |
| `sitemap.vue` (COPY-07) | **Mapa del Sitio \| Waldo.click®** | 29 |
| `politicas-de-privacidad.vue` (COPY-08) | **Políticas de Privacidad \| Waldo.click®** | 38 |

**No duplicates.** ✅

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Character counting | Custom runtime counter | Verify at edit time (count chars manually/via script) | Strings are static — no runtime counting needed |
| Title suffix appending | Manually add `\| Waldo.click®` to `$setSEO` title | Let `@nuxtjs/seo` append it | Module appends automatically; manual addition causes double-suffix |
| SEO tag setting | Direct `useHead()` / `useSeoMeta()` calls | `$setSEO()` plugin | Plugin handles og:*, twitter:*, and all derivatives in one call |

---

## Common Pitfalls

### Pitfall 1: Title double-suffix
**What goes wrong:** Developer adds `| Waldo.click®` to the title string in `$setSEO()`, resulting in `"Mapa del Sitio | Waldo.click® | Waldo.click®"` in the browser.
**Why it happens:** `@nuxtjs/seo` appends the site name separator automatically. The `$setSEO` plugin does not strip it.
**How to avoid:** The `title:` argument to `$setSEO()` must be the bare page title, no separator, no brand name.
**Warning signs:** Rendered `<title>` contains `| Waldo.click® | Waldo.click®`.

### Pitfall 2: Description below 120-char minimum
**What goes wrong:** Description is checked visually and "looks long enough" but is actually below 120 chars — causing SERP truncation or Google generating its own snippet.
**How to avoid:** Count characters precisely. All four current descriptions are below minimum (91–113 chars). The new strings must be verified to be 120–155 chars inclusive.

### Pitfall 3: Stale `$setStructuredData` description
**What goes wrong:** `$setSEO` description is updated but the matching `$setStructuredData` description is left at the old string, creating inconsistency between meta tags and structured data.
**How to avoid:** For every page in scope, update `$setStructuredData` description to match the new `$setSEO` description. Check each file's structured data block after updating the SEO call.

### Pitfall 4: Missing `®` symbol in sitemap
**What goes wrong:** Developer copies the old description and only extends it, preserving the bare `Waldo.click` without `®`.
**Warning signs:** Description contains `Waldo.click` not immediately followed by `®`.

### Pitfall 5: Brand name in contacto title creates double brand in rendered output
**What goes wrong:** Using `"Contacta con Waldo.click®"` as the title produces the rendered title `"Contacta con Waldo.click® | Waldo.click®"` — visually redundant in SERPs.
**How to avoid:** The contacto title must expand beyond "Contacto" without including the brand name. Use `"Contacto y Soporte"` or equivalent.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Nuxt typecheck (vue-tsc under the hood) |
| Config file | `apps/website/nuxt.config.ts` (`typescript: { typeCheck: true }`) |
| Quick run command | `cd apps/website && npx nuxt typecheck 2>&1 \| tail -10` |
| Full suite command | `cd apps/website && npx nuxt typecheck` |

### Why typecheck is the right gate

Phase 38 makes only string literal changes inside `$setSEO()` and `$setStructuredData()` calls. Both accept `string` typed parameters — TypeScript verifies the argument types at compile time. There are no unit tests for copy strings (they would need to be maintained in sync with the copy, adding overhead with no benefit). The `nuxt typecheck` command:

1. Confirms the edited files still compile with `typeCheck: true` enabled
2. Detects any accidental syntax errors introduced during editing (e.g. unclosed template literal)
3. Is the same gate used and verified in Phase 36 and Phase 37

No new test files are needed.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Infrastructure Exists? |
|--------|----------|-----------|-------------------|----------------------|
| COPY-05 | `preguntas-frecuentes.vue` compiles without TS errors | typecheck | `cd apps/website && npx nuxt typecheck` | ✅ |
| COPY-06 | `contacto/index.vue` compiles without TS errors | typecheck | `cd apps/website && npx nuxt typecheck` | ✅ |
| COPY-07 | `sitemap.vue` compiles without TS errors | typecheck | `cd apps/website && npx nuxt typecheck` | ✅ |
| COPY-08 | `politicas-de-privacidad.vue` compiles without TS errors | typecheck | `cd apps/website && npx nuxt typecheck` | ✅ |

> Character budget compliance and vocabulary correctness are **static copy properties** — they are verified by reading the edited file, not by automated test. The plan's self-check step should include explicit length assertions (e.g. `node -e "console.log('COPY-05 desc:'.length)"`) to make this concrete.

### Sampling Rate

- **Per task commit:** `cd apps/website && npx nuxt typecheck 2>&1 | tail -10`
- **Per wave merge:** `cd apps/website && npx nuxt typecheck`
- **Phase gate:** Full typecheck green before `/gsd-verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers all phase requirements. No new test files needed.

---

## Code Examples

### Editing `$setSEO()` — representative pattern (COPY-07)

```typescript
// BEFORE (sitemap.vue lines 102–107)
$setSEO({
  title: "Mapa del Sitio",
  description:
    "Explora la estructura de nuestro sitio y encuentra fácilmente lo que buscas en Waldo.click.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
});

// AFTER
$setSEO({
  title: "Mapa del Sitio",
  description:
    "Navega fácilmente por Waldo.click®. Encuentra anuncios de activos industriales, categorías, comunas y todas las secciones del sitio.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
});
```

### Syncing `$setStructuredData()` description (COPY-07)

```typescript
// BEFORE (sitemap.vue lines 109–116)
$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mapa del Sitio",
  description:
    "Explora la estructura de nuestro sitio y encuentra fácilmente lo que buscas en Waldo.click.",
  url: `${config.public.baseUrl}/sitemap`,
});

// AFTER
$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mapa del Sitio",
  description:
    "Navega fácilmente por Waldo.click®. Encuentra anuncios de activos industriales, categorías, comunas y todas las secciones del sitio.",
  url: `${config.public.baseUrl}/sitemap`,
});
```

---

## State of the Art

| Old Approach | Current Approach | Since | Impact |
|--------------|------------------|-------|--------|
| Hardcoded short descriptions (91–113 chars) | 120–155 char descriptions with canonical vocabulary | Phase 37 established the convention | Descriptions now long enough for full SERP snippet display |
| `Waldo.click` (no ®) | `Waldo.click®` (with ®) | Phase 36 required it everywhere | Consistent brand identity, avoids bare trademark in public copy |
| Generic page descriptions | Keyword-rich descriptions with `anuncios` + `activos industriales` | Phase 37 pattern | Supports v1.16 SEO vocabulary hard constraints |

**No deprecated patterns in this phase.** The `$setSEO` plugin API is stable and unchanged since v1.15.

---

## Open Questions

None. All four files have been read. All current copy strings are known. All proposed strings are validated. The editing approach is clear and simple.

---

## Sources

### Primary (HIGH confidence)
- Direct file reads — `apps/website/app/pages/preguntas-frecuentes.vue`, `contacto/index.vue`, `sitemap.vue`, `politicas-de-privacidad.vue` — current copy extracted and character-counted
- Direct file read — `apps/website/app/plugins/seo.ts` — confirmed `$setSEO` plugin API and behaviour
- `.planning/STATE.md` — canonical vocabulary constraints verified
- Phase 36 SUMMARY.md — confirmed `nuxt typecheck` as the validation gate
- Phase 37 SUMMARY.md — confirmed copy pattern and accepted copy for all dynamic pages

### Secondary (MEDIUM confidence)
- Phase 37 SUMMARY.md character counts — cross-validated against direct file reads

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Current state: HIGH — files read directly, character counts computed by script
- Proposed copy: HIGH — validated by script for all budget/vocabulary constraints
- Architecture: HIGH — same pattern used and verified in Phase 37
- Pitfalls: HIGH — derived from Phase 36/37 experience and direct code inspection

**Research date:** 2026-03-07
**Valid until:** Stable (static copy only — no external dependencies)
