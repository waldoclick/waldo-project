# Project Research Summary

**Project:** Waldo — `apps/website` Meta Copy Audit (v1.16)
**Domain:** SEO copy audit — classified ads platform (industrial equipment, Chile)
**Researched:** 2026-03-07
**Confidence:** HIGH (all findings from direct source inspection)

---

## Executive Summary

v1.16 is a **copy-only milestone** — zero new packages, zero architectural changes. The work is to audit and rewrite all `<title>` and `<meta description>` strings across 31 pages of `apps/website`. The delivery mechanism is already wired: a `$setSEO({ title, description })` plugin call on every page feeds `useSeoMeta`, which `@nuxtjs/seo`'s `nuxt-seo-utils` sub-module then wraps with a `titleTemplate` of `%s | Waldo.click®`. The final browser title is always `{title param} | Waldo.click®`. Writers must never include the suffix in the title string — the template adds it automatically.

There is **one critical bug already in production**: two high-traffic indexed public pages (`anuncios/[slug].vue` and `[slug].vue`) manually embed `| Waldo.click` in their title strings, producing doubled suffixes in SERP snippets (e.g., `…| Waldo.click | Waldo.click®`). Both pages also carry dynamic ad counters in their descriptions that reflect only the current page slice (up to 12 items), not actual user totals, and must be replaced with static copy. These are the highest-priority fixes in the milestone.

The recommended approach is: (1) fix the two double-suffix bugs first as a standalone patch, (2) audit and rewrite the 5–6 indexed public pages where SEO quality matters most, (3) bring the 19 private/noindex pages up to brand-voice standard. The work is low-risk (string changes only, fully type-safe), but requires careful character budgeting: each `title:` param must stay under 45 characters because the `| Waldo.click®` suffix consumes 15 characters of the 60-character SERP limit.

> ⚠️ **Research conflict resolved:** ARCHITECTURE.md (written from `nuxt.config.ts` inspection alone) concluded there is no auto-suffix and titles must be written in full. STACK.md (written from installed `node_modules` inspection) confirmed that `nuxt-seo-utils` silently injects `titleTemplate` at runtime. **STACK.md is correct.** The suffix IS applied automatically. Requirements must be written assuming the `title:` param is `%s` and the final output is `{title} | Waldo.click®`. The code examples in ARCHITECTURE.md that include `| Waldo.click®` in the `title:` param are **wrong** and would produce double-suffixes.

---

## Key Findings

### Recommended Stack

No stack changes for this milestone. All tooling is already in place in `apps/website`.

**Core technologies relevant to this work:**

- **`$setSEO` plugin** (`app/plugins/seo.ts`): The single call site for all SEO metadata on every page. Wraps `useSeoMeta` and sets title, description, OG, and Twitter tags atomically. Always use `$setSEO` — never call `useSeoMeta({ title, description })` directly on pages.
- **`@nuxtjs/seo` v3.4.0** (via `nuxt-seo-utils` sub-module): Silently registers `titleTemplate: "%s %separator %siteName"` at low priority. Confirmed in `node_modules/nuxt-seo-utils/dist/runtime/app/logic/applyDefaults.js:52`. The `%siteName` resolves to `"Waldo.click®"` from `nuxt.config.ts` (`site.name`). Default separator is `|` (confirmed in `unhead` source).
- **`site.name: "Waldo.click®"`** (`nuxt.config.ts:136`): The only site-wide title variable. Not configurable per-page.

**Character budget rule:** `title:` param ≤ 45 characters. Final browser title = `{title} | Waldo.click®` ≤ 60 characters.

### Expected Features (Audit Scope)

FEATURES.md is a verbatim page-by-page inventory of all current title/description values across all 31 pages. Key findings grouped by priority:

**Must fix — critical bugs (affects live indexed pages):**
- `anuncios/[slug].vue` — ⚠️ double-suffix: title param embeds `| Venta de Equipo en Waldo.click`; description slice at 150 chars exceeds budget when prefix/suffix are added; double-space when `ad.description` is empty/null
- `[slug].vue` (user profile) — ⚠️ double-suffix: title param embeds `| Waldo.click®`; `totalAds` counter reflects page slice (up to 12 items), not user's real total

**Should fix — indexed public pages (direct SEO impact):**
- `index.vue` (homepage) — current copy functional; review keyword strategy for Chilean market
- `anuncios/index.vue` — `generateSEODescription()` embeds `${totalAds}` counter; trailing brand string uses `"Waldo.click"` (no `®`)
- `contacto/index.vue` — title is a single generic word (`"Contacto"`) — too generic for SERP
- `preguntas-frecuentes.vue` — functional; polish only
- `sitemap.vue` — description uses `"Waldo.click"` without `®`

**Lower priority — private/noindex pages (brand voice):**
- `login/index.vue` — `"Iniciar sesión"` lowercase `s` (all other pages use Title Case)
- `packs/comprar.vue` — description is only 44 chars (target: 120–150)
- `cuenta/mis-ordenes.vue` — description is only 54 chars
- All other `cuenta/**`, `anunciar/**`, `packs/**` pages — currently acceptable; polish optional

**Non-copy fix (missing `noindex`):**
- `packs/index.vue` — auth-gated but missing `useSeoMeta({ robots: "noindex, nofollow" })`; `robots.txt` disallows subpaths but not the root path

**No action needed:**
- `login/facebook.vue`, `login/google.vue` — redirect-only OAuth callbacks; no UI; correctly excluded from robots

### Architecture Approach

All pages share a single, well-established SEO pattern. **No architectural changes are in scope for v1.16** — only the string values inside existing `$setSEO(...)` calls change.

**Major components:**

1. **`$setSEO` plugin** (`app/plugins/seo.ts`) — Unchanged. Accepts `{ title, description, imageUrl?, url?, ogType?, twitterCard? }` and sets all 9 meta tags atomically via `useSeoMeta`.
2. **Static pages (27 pages)** — Call `$setSEO` synchronously in `<script setup>` before any `await`. Hardcoded string values. SSR-safe.
3. **Dynamic pages (3 pages: `anuncios/[slug].vue`, `[slug].vue`, `anuncios/index.vue`)** — Call `$setSEO` inside `watch(data, handler, { immediate: true })` after `useAsyncData({ server: true, lazy: false })`. SSR-safe because `immediate: true` fires synchronously with already-resolved data.
4. **`packs/gracias.vue`** (edge case) — `watch` without `{ immediate: true }`: no title set on SSR. Acceptable as-is (`noindex`), but trivial to fix.

**Title rendering pipeline (confirmed via `node_modules` inspection):**
```
$setSEO({ title: "Foo" })
  → useSeoMeta({ title: "Foo", ogTitle: "Foo", ... })
    → nuxt-seo-utils injects titleTemplate: "%s | Waldo.click®"
      → final <title>: "Foo | Waldo.click®"
```

### Critical Pitfalls

1. **Double-suffix bug** — Any `title:` param containing `| Waldo.click` already has the suffix embedded; the template adds it again. Two production pages are currently affected. **Fix:** Remove all `| Waldo.click` substrings from the raw title params and let the template handle branding.

2. **Title length budget is 45 chars, not 60** — The `| Waldo.click®` suffix consumes 15 of the 60-char SERP limit. Any title param longer than 45 characters will be truncated in Google SERPs. The current codebase is mostly within budget, but dynamic titles like ad detail pages are at risk.

3. **Dynamic counters in descriptions** — `${totalAds}`, `${total}`, `${ads.length}` produce stale, inaccurate descriptions. The profile page `[slug].vue` describes a user with 50 ads as having "12 anuncios" (page-1 slice). Rule: no numeric interpolation in any indexed page description. Use "cientos de" or remove the count entirely.

4. **SSR-unsafe `$setSEO` placement** — `$setSEO` must be called in the synchronous `<script setup>` context (or via `watch` with `{ immediate: true }` on a server-resolved `useAsyncData` ref). Calling it in `onMounted` or a non-immediate watcher means the `<title>` is absent from the SSR HTML that Googlebot crawls. Current `packs/gracias.vue` has this issue (noindex so low risk).

5. **Chilean vocabulary** — Use `"avisos"` (not `"anuncios"`) for classified ads in copy; `"equipo industrial"` / `"maquinaria"` / `"activos industriales"` (not `"productos"`); `"compra y venta"` (not `"compraventa"`). City-level keywords (`Santiago`, `Valparaíso`, etc.) are high-value in dynamic page titles — the current pattern of `${commune?.name}` is correct.

---

## Implications for Roadmap

This milestone has a clear linear dependency chain. The roadmap should reflect three phases of increasing scope and decreasing SEO impact.

### Phase 1: Bug Fixes (Critical — do this first)
**Rationale:** The double-suffix bug affects two of the highest-traffic indexed pages and is actively degrading SERP snippets today. It is a standalone fix with zero regression risk: remove 2 substrings from 2 template strings. This must ship before any copy quality work, because evaluating copy against a broken rendering pipeline is meaningless.
**Delivers:** Correct `<title>` rendering for ad detail page and user profile page; elimination of misleading `totalAds` counters in descriptions; fix for empty-description double-space bug
**Files:** `apps/website/app/pages/anuncios/[slug].vue` (line 187), `apps/website/app/pages/[slug].vue` (line 161)
**Avoids:** Double-suffix pitfall; dynamic counter pitfall; empty-description formatting bug

### Phase 2: Indexed Public Pages (High SEO Impact)
**Rationale:** These are the only pages that rank in Google. There are 5–6 pages in this group, bounded effort with direct traffic impact. All changes are static string replacements with no logic changes.
**Delivers:** Keyword-rich, properly sized titles and descriptions for all indexable pages
**Addresses:** `index.vue`, `anuncios/index.vue` (static description replacement), `contacto/index.vue` (expand generic title), `preguntas-frecuentes.vue` (polish), `sitemap.vue` (add `®`)
**Constraints to enforce:** 45-char title budget; 130–150 char description target; Chilean vocabulary standards; zero numeric counters; no brand suffix in title params
**Avoids:** Generic title pitfall; description length pitfalls; vocabulary errors; keyword stuffing

### Phase 3: Private/Noindex Pages (Brand Voice)
**Rationale:** These 19 pages are not indexed but are seen by logged-in users in browser tabs and social share previews. Coherent, professional copy matters for UX even when SEO rank is irrelevant.
**Delivers:** Consistent brand voice across all `cuenta/**`, `anunciar/**`, `packs/**`, `login/**`, and auth pages; missing `noindex` added to `packs/index.vue`
**Addresses:** `login/index.vue` casing fix; `packs/comprar.vue` and `cuenta/mis-ordenes.vue` description padding; `packs/index.vue` noindex gap; opportunistic `packs/gracias.vue` watch fix
**Avoids:** Sub-50-char descriptions on transactional pages; brand inconsistency

### Phase Ordering Rationale

- **Phase 1 before Phase 2:** The double-suffix rendering bug must be fixed before any copy quality review. Writing copy targeted at a broken title output is wasted effort.
- **Phase 2 before Phase 3:** Public indexed pages have direct revenue impact; private pages are polish. If only Phases 1 and 2 ship, the milestone is successful.
- **No architectural work in any phase:** All changes are string replacements inside existing `$setSEO(...)` calls. TypeScript `typeCheck: true` passes automatically since `title` and `description` remain `string` types throughout.

### Research Flags

No phase requires additional research during planning. This is an unusually well-mapped milestone — every file, every current value, and every required change is fully documented in the research files.

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1:** Two targeted string edits in two known files (exact line numbers in STACK.md lines 289-292)
- **Phase 2:** Standard SEO copy writing + character budget validation — patterns fully documented in PITFALLS.md
- **Phase 3:** Simple string replacements — all 31 page files inventoried verbatim in FEATURES.md

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | `nuxt-seo-utils` source inspected directly in `node_modules`; `$setSEO` plugin read from source; `nuxt.config.ts` verified |
| Features | HIGH | Every page file in `apps/website/app/pages/` read directly; all values extracted verbatim from source |
| Architecture | MEDIUM | ARCHITECTURE.md drew an **incorrect conclusion** (no auto-suffix) by reading `nuxt.config.ts` without checking the module's runtime behaviour. Correct conclusion confirmed by STACK.md. All other architectural patterns and diagrams in ARCHITECTURE.md are accurate. |
| Pitfalls | HIGH | Cross-referenced with Google Search Central docs (2025-12 and 2026-02 updates) + `nuxtseo.com` docs (2026-01 updates) + direct codebase inspection |

**Overall confidence:** HIGH

### Gaps to Address

- **ARCHITECTURE.md conflict (resolved):** Requirements must be written using STACK.md's finding — the title suffix IS applied automatically by `nuxt-seo-utils`. The `title:` param must NOT include `| Waldo.click®`. Code examples in ARCHITECTURE.md's "Correct Pattern" sections that include the suffix in the title string would produce double-suffixes and must not be used as implementation references.

- **`packs/gracias.vue` SSR gap:** `watch` without `{ immediate: true }` means no `<title>` on SSR. The page is `noindex` so there is no ranking risk, but the fix is one line. Requirements should decide whether this is in scope for Phase 3.

- **OG image path inconsistency (out of scope):** Some pages pass `config.public.baseUrl + "/share.jpg"` while the plugin default is `/images/share.jpg`. Not a v1.16 concern, but worth a future ticket.

---

## Sources

### Primary (HIGH confidence)

- `apps/website/app/plugins/seo.ts` — `$setSEO` plugin signature and implementation
- `apps/website/nuxt.config.ts` — `site.name: "Waldo.click®"`, `@nuxtjs/seo` config
- `apps/website/app/app.vue` — global `blockSearchEngines` noindex guard
- All 31 files in `apps/website/app/pages/` — verbatim title/description values
- `node_modules/nuxt-seo-utils/dist/runtime/app/logic/applyDefaults.js:52` — confirms `titleTemplate: "%s %separator %siteName"` is injected at runtime
- `node_modules/unhead/dist/shared/unhead.ckV6dpEQ.mjs:131` — confirms default separator is `|`
- `node_modules/@nuxtjs/seo/package.json` — confirms version 3.4.0
- Google Search Central — Title Links: https://developers.google.com/search/docs/appearance/title-link (updated 2025-12-10)
- Google Search Central — Meta Descriptions: https://developers.google.com/search/docs/appearance/snippet (updated 2026-02-04)
- Nuxt SEO Utils — Enhanced Titles: https://nuxtseo.com/docs/seo-utils/guides/fallback-title (updated 2026-01-27)
- Nuxt SEO — Mastering Meta / Titles: https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles (updated 2026-01-04)

### Secondary (MEDIUM confidence)

- `.planning/PROJECT.md` v1.16 milestone — confirmed scope and milestone intent

---
*Research completed: 2026-03-07*
*Ready for roadmap: yes*
