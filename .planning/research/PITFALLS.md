# Pitfalls Research

**Domain:** SEO Meta Copy Audit — Classified Ads Platform (Chile)
**Milestone:** v1.16 Website Meta Copy Audit
**Researched:** 2026-03-07
**Confidence:** HIGH (official Google docs + @nuxtjs/seo module docs + direct codebase inspection)

---

## Critical Pitfalls

### Pitfall 1: Title Too Long After `@nuxtjs/seo` Appends Site Name

**What goes wrong:**
Every title written in `$setSEO({ title: "..." })` gets the suffix `| Waldo.click®` automatically appended by the SEO Utils default title template (`'%s %separator %siteName'`). If a developer writes a title of 52 characters, the rendered `<title>` in the DOM is ~67 characters, which Google truncates in SERPs. The suffix `" | Waldo.click®"` is **15 characters** including the separator space.

**Why it happens:**
`@nuxtjs/seo` (SEO Utils v7) silently injects `useHead({ titleTemplate: '%s %separator %siteName' })` at the module level. The `site.name: "Waldo.click®"` from `nuxt.config.ts` is the `%siteName`. Developers see the short string in code and don't realize the final output is longer. The current codebase already has this issue:
- `"Compra y Venta de Equipo en Chile"` → `"Compra y Venta de Equipo en Chile | Waldo.click®"` = **48 chars** ✓ (safe)
- `"Restablecer Contraseña"` → `"Restablecer Contraseña | Waldo.click®"` = **37 chars** ✓ (safe, but noindexed)
- A title like `"Tornos CNC usados en Antofagasta | Venta de Equipo"` = 50 chars → `"Tornos CNC usados en Antofagasta | Venta de Equipo | Waldo.click®"` = **66 chars** ✗ (truncated)

**How to avoid:**
- **The budget per `title:` param is 45 characters maximum** (60 chars target − 15 for " | Waldo.click®")
- For any page that manually includes `| Waldo.click®` inside the `title:` param (e.g., `[slug].vue` currently does this: `"${name} en ${commune} | Venta de Equipo en Waldo.click"`) the suffix is added twice — remove the manual branding from the title param entirely and let the template handle it
- Run a character count check on every `title:` value before committing

**Warning signs:**
- Any `title:` param containing `| Waldo.click` → guaranteed double-suffix
- Any `title:` param longer than 45 characters
- The `[slug].vue` ad detail title: `"Tornos en Santiago | Venta de Equipo en Waldo.click"` is 50+ chars AND has manual branding → double violation

**Phase to address:** Inventory phase (Phase 36 or equivalent) — measure all titles before rewriting any.

---

### Pitfall 2: Dynamic Titles That Include Stale Counters or User Data

**What goes wrong:**
The user profile page `[slug].vue` currently builds its title as:
```
`Perfil de ${newData.user.username} | Waldo.click®`
```
and its description as:
```
`Explora los ${totalAds} anuncios publicados por ${username} en ${commune}...`
```
The counter `totalAds` is the count of ads from the current page's paginated response — it reflects only the current page, not all user ads. If a user has 47 ads but page 1 shows 12, the description says "Explora los 12 anuncios". Additionally, if the user has 0 ads, the description says "Explora los 0 anuncios", which reads as broken copy in Google SERPs.

**Why it happens:**
Developers naturally interpolate available data into copy. Page-scoped data (paginated results) gets confused with entity-level data (total count). The count looks dynamic and "relevant" but it's actually stale and variable.

**How to avoid:**
- For the profile page: use a static template like `"Vendedor de equipo industrial en [ciudad]"` — no counters, no pagination-dependent data
- For ad listing `anuncios/index.vue`: the `generateSEODescription()` embeds `${totalAds}` which changes on every filter change. For SEO (SSR render), use a static canonical description instead, not query-dependent. Dynamic descriptions are fine for OG/social, but the static description is what search engines crawl
- Rule: SSR-rendered meta must be deterministic from the canonical URL alone. If the value changes with filters/pagination, it is not safe for the `<meta name="description">` tag

**Warning signs:**
- Any `title:` or `description:` value using `${count}`, `${total}`, `${length}`, or any numeric interpolation
- Any `watch()` or `watchEffect()` that sets SEO based on reactive query params (route.query)

**Phase to address:** Rewrite phase — before writing new copy, establish a rule: no counters in meta tags.

---

### Pitfall 3: Description Too Short or Too Long — Both Fail Differently

**What goes wrong:**
Google truncates descriptions at ~155 characters on desktop (and ~120 on mobile). Descriptions under ~120 characters leave valuable SERP real estate empty. Descriptions over ~155 characters get cut mid-sentence, which can make the copy look broken.

Current examples from the codebase:
- `"Adquiere un pack de avisos en Waldo.click®."` — only 43 chars. **Too short.** Google will substitute with page content instead, which may be worse.
- `"Elige el pack de avisos que mejor se adapte a tus necesidades. Publica más anuncios y llega a más compradores en Waldo.click®."` — 127 chars. **Good length.**
- The ad detail description template: `"¡Oportunidad! ${name} en ${commune}. ${description.slice(0, 150)}... Encuentra más equipo industrial en Waldo.click"` — the slice at 150 chars + the prefix and suffix means this regularly exceeds 180+ chars.

**How to avoid:**
- Target 130–150 characters per description (safely under mobile and desktop limits)
- The ad detail page description should slice `ad.description` at **80–90 chars** maximum (not 150) to leave room for the surrounding template text
- For static pages: write descriptions that land in the 130–150 char range. Write the copy, count it, adjust.
- Never leave a description at under 50 characters — it signals low effort and Google will override it

**Warning signs:**
- `description.slice(0, 150)` in a template that also has prefix and suffix text (currently in `anuncios/[slug].vue`)
- Descriptions under 80 characters on any public indexable page

**Phase to address:** All phases — apply length validation as a quality gate on every description written.

---

### Pitfall 4: SSR Hydration Mismatch from Client-Only SEO Updates

**What goes wrong:**
When `$setSEO()` is called inside a `watch()` callback that fires **only on client** (missing `{ immediate: true }` with `server: false`, or wrapped in `if (import.meta.client)`), the SSR-rendered HTML has either no title or a stale default, while the client hydrates with the correct title. This creates:
1. A Nuxt hydration mismatch warning in the console
2. Search engines seeing an empty or wrong title (Googlebot may not execute client-side JS)
3. Social share cards showing wrong titles when the URL is shared

Current risky pattern in `[slug].vue`:
```ts
// Set SEO and structured data when ad data is available
watch(
  () => adData.value,
  (newData) => {
    if (newData) {
      $setSEO({ title: `${newData.name} en ${newData.commune?.name || 'Chile'} | ...` })
    }
  }
)
```
The `watch()` has **no `immediate: true`** and fires after hydration only when data changes. During SSR, `adData.value` is populated (because `useAsyncData` runs server-side), but the watch callback fires differently on SSR vs. client. In practice, `$setSEO` calling `useSeoMeta()` inside a `watch` in a Nuxt 4 SSR setup is safe **only if** the composable executes during the synchronous setup phase — calling `useSeoMeta()` inside an async callback (post-`await`) may not work as expected.

**Why it happens:**
Developers assume `useSeoMeta()` works anywhere. In Nuxt 4, `useSeoMeta()` must be called within the synchronous component setup context for SSR to capture it. Calling it inside a `watch` callback defers it to after setup, which may work on client but is unreliable on server.

**How to avoid:**
- For pages with dynamic data from `useAsyncData`, use a **computed getter** pattern instead of a watch:
  ```ts
  const { data: adData } = await useAsyncData(...)
  useSeoMeta({
    title: () => adData.value ? `${adData.value.name} en ...` : 'Equipo industrial en Chile',
    description: () => adData.value?.description?.slice(0, 90) || '...',
  })
  ```
  The getter `() => ...` is reactive and re-evaluates on client, but the initial string is resolved during SSR.
- Never call `$setSEO` / `useSeoMeta()` inside `watch()`, `watchEffect()`, or `onMounted()`

**Warning signs:**
- `$setSEO` called inside a `watch()` or `watchEffect()` callback
- `if (import.meta.client) { $setSEO(...) }` — client-only SEO is invisible to Googlebot
- Missing fallback title when `data.value` is `null` on first SSR render

**Phase to address:** Inventory phase — identify all `$setSEO` calls that are not in the synchronous setup context. Fix in rewrite phase.

---

### Pitfall 5: Duplicate or Near-Duplicate Titles Across Pages

**What goes wrong:**
Google's duplicate title warning fires when multiple pages share identical (or near-identical) `<title>` tags. This dilutes authority across pages and confuses Googlebot about which page to rank for a given keyword.

Current risky patterns in the codebase:
- `"Contacto"` → final title: `"Contacto | Waldo.click®"` — extremely generic, likely to be rewritten by Google
- `"Preguntas Frecuentes"` → final title: `"Preguntas Frecuentes | Waldo.click®"` — generic but unique
- `"Comprar Pack"` (noindexed) and `"Packs de Avisos"` are fine since packs/comprar is noindexed
- For `anuncios/index.vue`, the `generateSEOTitle()` can return `"Activos industriales en Chile"` as the fallback — if 80% of visits hit the unfiltered listing, that fallback is the effective title for the most important page after home

**How to avoid:**
- Every indexed page must have a unique title — no two indexable pages can share the same string after template expansion
- The most dangerous case: `anuncios/index.vue` with no filters active → its static "canonical" title must be written as if that's the only title that matters for that URL, because it is
- Audit with `grep -rn "title:" apps/website/app/pages/ | sort` after writing all copy to spot duplicates

**Warning signs:**
- Two pages with the same `title:` string before the module appends `| Waldo.click®`
- Generic words as titles: `"Contacto"`, `"Error"`, `"Gracias"` — all need more specificity

**Phase to address:** Final review phase — check all titles as a unified list before shipping.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `ad.description` directly as meta description | No work required | Ad descriptions are user-generated, can be 1,000+ chars, contain markdown/HTML, no keywords | Never — always slice + sanitize |
| Generating description from query params (filters) | Feels "relevant" | Different URL → different description = Google treats each filter combination as unique content | Never for `<meta name="description">`, OK for OG tags |
| Including counters (`${total} anuncios`) in description | Seems informative | Counter changes as ads are added/removed → stale description in Google's cache | Never — use "cientos de" or "miles de" instead |
| Skipping description on noindexed pages | Saves time | If noindex is ever removed by mistake, page surfaces with no description | Low risk, acceptable since noindex is defense-in-depth |
| Writing `title: "Tornos CNC en Chile | Waldo.click®"` manually | Feels complete | Module appends `| Waldo.click®` again → double branding | Never — remove manual branding from title param |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `@nuxtjs/seo` (SEO Utils v7) | Writing 60-char titles and assuming that's the limit | Budget is 45 chars max for the `title:` param — module adds `| Waldo.click®` (15 chars) |
| `@nuxtjs/seo` title template | Calling `useSeoMeta({ title })` — no template applied to `ogTitle` | `useSeoMeta` sets `title` (template applied) but `ogTitle` gets the raw value. `$setSEO` sets both simultaneously, so `ogTitle` is the raw title without the suffix — this is correct per platform expectations |
| `useSeoMeta()` in `watch()` | Works on client, unreliable on SSR | Call with computed getter syntax `title: () => data.value?.name` in synchronous setup |
| `$setSEO` plugin + `useSeoMeta` in same page | `$setSEO` calls `useSeoMeta` internally — calling both overrides whichever ran last | Use only `$setSEO` for consistency across all pages |
| Nuxt 4 `import.meta.client` guard | Wrapping `$setSEO` in `if (import.meta.client)` means SSR emits no meta | Always call `$setSEO` at the top level of `<script setup>` or use reactive getter |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `watch` on `adsData` + `route.query` calling `$setSEO` on every filter change | `useSeoMeta` fires on every keystroke in search box, causing unnecessary Unhead updates | Use computed getter pattern; or make the watch non-immediate with a debounce | On first SSR render (missing title in initial HTML) |
| Descriptions built from `ads.find()` on every watch cycle | O(n) scan of the ads array on every filter change just to find commune name | Store commune name separately from the ads array | When ads array is large (100+ items per page) |

---

## "Looks Done But Isn't" Checklist

- [ ] **Title length:** Counted against 45-char budget (not 60) because `| Waldo.click®` is appended — verify with `"${title} | Waldo.click®".length <= 60`
- [ ] **No manual branding in title:** Confirm `title:` param contains no `| Waldo.click` substring — module handles branding
- [ ] **Description length:** 130–150 chars, not 155+ and not under 80
- [ ] **Dynamic description slicing:** `ad.description.slice(0, N)` uses a budget that accounts for surrounding template text (prefix + suffix consume chars too)
- [ ] **SSR-safe SEO call:** `$setSEO` called in synchronous setup, not inside `watch()` / `watchEffect()` / `onMounted()` — or uses reactive getter syntax
- [ ] **No counters in descriptions:** Zero occurrences of `${total}`, `${count}`, `${length}` in any indexed page's description
- [ ] **No duplicate titles:** After writing all pages, sort all `title:` params — no two indexable pages share the same value
- [ ] **Noindexed pages excluded from SEO effort:** Don't spend effort on copy quality for the 20 pages with `useSeoMeta({ robots: "noindex, nofollow" })` — but ensure they have a minimal title for the browser tab
- [ ] **Profile page — no ad count:** `[slug].vue` description does not use `${totalAds}` or `${ads.length}`
- [ ] **Contact page — not generic:** `"Contacto | Waldo.click®"` is likely to be rewritten by Google; must be more specific (e.g., `"Contacta con Waldo.click® — Clasificados de equipo industrial"`)

---

## Chile-Specific Keyword Pitfalls

### Pitfall 6: Using Wrong Domain Vocabulary for Chilean Classified Ads

**What goes wrong:**
Writing copy that uses vocabulary from other Spanish-language markets or generic e-commerce phrasing that Chileans don't search for. The platform deals in industrial equipment, not general consumer goods.

**Key vocabulary for this domain in Chile:**
- ✅ **"avisos"** — the Chilean word for classified ads (not "anuncios" which is more generic/Spain)
- ✅ **"clasificados"** — still used, especially in compound phrases
- ✅ **"compra y venta"** — the go-to phrase (not "compraventa" as one word)
- ✅ **"equipo industrial"**, **"maquinaria"**, **"activos industriales"** — correct for this vertical
- ✅ **"segunda mano"** vs **"usado"** — both used in Chile; "usado" is more technical
- ❌ **"anuncios"** — this is the word in the URLs (`/anuncios`) which is fine, but in copy, Chileans more often say "avisos clasificados"
- ❌ **"productos"** — wrong abstraction; these are machines/assets, not consumer products
- ❌ **"marketplace"** — English; avoid in Spanish meta copy

**Regional keyword value:**
- City-level keywords are high-value for the detail/listing pages: "Santiago", "Valparaíso", "Concepción", "Antofagasta" — these appear in dynamic titles (`${commune?.name}`) which is correct
- For static pages (home, FAQ, contact), use "en Chile" without a specific city
- Avoid "todo Chile" — it sounds like ad copy, not informational

**How to avoid:**
Write all meta copy in a document first, review for Chilean vocabulary, then implement. Vocabulary review before any `title:`/`description:` strings are committed.

**Phase to address:** Rewrite phase.

---

### Pitfall 7: Keyword Stuffing Disguised as Thorough Coverage

**What goes wrong:**
Writing descriptions like: `"Avisos clasificados de equipo industrial en Chile. Compra y venta de maquinaria industrial nueva y usada. Activos industriales en Santiago, Valparaíso, Concepción."` This reads as a keyword list, not natural copy. Google's spam policies explicitly flag this and may suppress the page.

The temptation is high because the domain has many relevant terms (avisos, clasificados, equipo, maquinaria, activos, industrial, Chile, etc.) and it seems wasteful not to use them all in a single description.

**How to avoid:**
The correct balance: use 1–2 primary keywords naturally in a sentence that describes what the user gets. The description's job is click-through rate, not ranking. Natural copy converts better than keyword lists.

**Good template:** `"[What you find] [where] — [why it's valuable to you]. [Call to action]"`

Example: `"Encuentra tornos, fresadoras y equipo CNC de segunda mano en Chile. Conecta con vendedores verificados en Waldo.click®."` (121 chars — good length, natural copy)
- Primary keyword: "equipo CNC de segunda mano en Chile"
- Value prop: "vendedores verificados"
- CTA: implicit (find, connect)

**Warning signs:**
- More than 3 distinct product/category nouns in a single description sentence
- Same keyword appearing twice in one description
- Comma-separated city list in description

**Phase to address:** Rewrite phase — review all descriptions for keyword density before committing.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Titles too long (post-suffix) | LOW | Edit `title:` param, shorten to <45 chars, re-deploy |
| Double-branding (`| Waldo.click®` in param + module) | LOW | Remove manual branding from `title:` param |
| Counter in description goes stale | LOW–MEDIUM | Replace with static alternative copy; cache may persist 1–2 weeks in Google |
| `$setSEO` in `watch()` → SSR missing title | MEDIUM | Refactor to computed getter pattern; requires SSR output testing |
| Duplicate titles discovered post-deploy | MEDIUM | Google consolidates signals over ~2 weeks after fix; no penalty but lost time |
| Keyword stuffing flagged by Google | HIGH | Page may be demoted in spam update; requires rewrite + recrawl request + weeks of recovery |
| User-generated `ad.description` passed directly → 1,000-char description | LOW | Fix the slice, re-deploy; Google re-crawls within days |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Title too long (suffix not counted) | Inventory — measure all effective lengths | `"${title} | Waldo.click®".length <= 60` for every page |
| Double branding in title | Inventory — grep for `\| Waldo` in title params | Zero matches in `title:` params |
| Dynamic counter in description | Inventory — identify all interpolated descriptions | Zero `${total}`, `${count}` in indexed page descriptions |
| `$setSEO` in `watch()` → SSR unsafe | Inventory — identify non-setup-context calls | All `$setSEO` calls outside sync setup flagged for refactor |
| Description too short (<80 chars) | Rewrite — enforce length target during copy writing | `description.length >= 120 && description.length <= 155` |
| Description too long (>155 chars) | Rewrite — same | Same check |
| Dynamic ad description overflowing | Rewrite — fix slice budget | `slice(0, N)` where N = 155 − prefix.length − suffix.length − safety margin |
| Duplicate titles | Final review — unified title list check | Sort all `title:` params; no duplicates among indexed pages |
| Chilean vocabulary errors | Rewrite — vocabulary review | Vocabulary review checklist sign-off |
| Keyword stuffing | Rewrite — copy review | Max 3 distinct nouns per description sentence |
| `noindex` pages without any title | Low priority | All 20 noindex pages have at least a minimal browser-tab title |

---

## Sources

- Google Search Central — Influencing Title Links: https://developers.google.com/search/docs/appearance/title-link (updated 2025-12-10, HIGH confidence)
- Google Search Central — Control Snippets (meta descriptions): https://developers.google.com/search/docs/appearance/snippet (updated 2026-02-04, HIGH confidence)
- Nuxt SEO Utils — Enhanced Titles (titleTemplate behavior): https://nuxtseo.com/docs/seo-utils/guides/fallback-title (updated 2026-01-27, HIGH confidence)
- Nuxt SEO — Mastering Meta / Titles: https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles (updated 2026-01-04, HIGH confidence)
- Direct codebase inspection: `apps/website/nuxt.config.ts`, `apps/website/app/plugins/seo.ts`, all `apps/website/app/pages/**/*.vue` (HIGH confidence)
- Project history: `.planning/PROJECT.md` v1.15 and v1.16 milestones

---
*Pitfalls research for: SEO Meta Copy Audit — Classified Ads Platform (waldo.click, Chile)*
*Researched: 2026-03-07*
