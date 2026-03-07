# Architecture Research

**Domain:** Meta copy (title + description) audit — apps/website (Nuxt 4)
**Researched:** 2026-03-07
**Confidence:** HIGH — based on direct source inspection of all 33 pages

---

## Standard Architecture

### SEO Meta Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                         Page (.vue)                              │
│                                                                  │
│  Static page              │   Dynamic page                       │
│  ─────────────────        │   ─────────────────────────────      │
│  $setSEO({ ... })         │   useAsyncData() ──► data ref        │
│  (called inline,          │       │                              │
│   before template)        │   watch(data, (newData) => {         │
│                           │     $setSEO({ ... })                 │
│                           │   }, { immediate: true })            │
│                           │                                      │
│  + useSeoMeta({           │   + useSeoMeta({                     │
│      robots: "noindex"    │       robots: "noindex"              │
│    })  ← separate call    │     }) ← separate call               │
└──────────────┬────────────┴──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  $setSEO plugin (seo.ts)                         │
│                                                                  │
│  calls useSeoMeta({                                              │
│    title, description,                                           │
│    ogTitle, ogDescription, ogImage, ogUrl, ogType,              │
│    twitterCard, twitterTitle, twitterDescription                 │
│  })                                                              │
└──────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│             @nuxtjs/seo module + site config                     │
│                                                                  │
│  site.name = "Waldo.click®"  (nuxt.config.ts line 136)          │
│  No titleTemplate defined — NO automatic suffix appended         │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `seo.ts` plugin | Set all meta tags (title, description, OG, Twitter) atomically | `nuxtApp.provide("setSEO", ...)` wrapping `useSeoMeta` |
| Individual page | Own its title string + description string | Call `$setSEO` inline (static) or inside `watch` (dynamic) |
| `nuxt.config.ts` `site` block | `@nuxtjs/seo` site identity (`site.name`, `site.url`) | NOT a title template — does not auto-append to every page |
| `useSeoMeta` (direct) | `robots` meta only — used on top of `$setSEO` for noindex pages | Called separately; does not conflict with `$setSEO` output |

---

## $setSEO Plugin — Exact Signature

```typescript
// apps/website/app/plugins/seo.ts

$setSEO(params: {
  title: string;         // required — sets <title>, og:title, twitter:title
  description: string;   // required — sets meta description, og:description, twitter:description
  imageUrl?: string;     // optional — sets og:image; falls back to /images/share.jpg
  url?: string;          // optional — sets og:url
  ogType?: string;       // optional — defaults to "website"
  twitterCard?: string;  // optional — defaults to "summary_large_image"
}) => void
```

Internally calls `useSeoMeta` with 9 fields. Does **not** call `useHead`. Does **not** append
`site.name` or any suffix — the title string passed in is used verbatim.

**DEFAULT_IMAGE fallback:** `process.env.BASE_URL + "/images/share.jpg"` (note: path is
`/images/share.jpg` in the plugin, but some pages pass `config.public.baseUrl + "/share.jpg"`
— there is an inconsistency; the plugin default is `/images/share.jpg`).

---

## Title Template / Suffix

**No `titleTemplate` is configured.** `nuxt.config.ts` has:

```typescript
site: {
  name: "Waldo.click®",
  url: process.env.BASE_URL,
}
```

`@nuxtjs/seo`'s `site.name` can enable an auto-suffix through `useSeoMeta` defaults in some
configurations, but **no `titleTemplate` key is present** in this project. All existing page
titles that include "Waldo.click®" do so by embedding it manually in the string passed to
`$setSEO`. **Every title is fully self-contained.**

> ⚠️ Implication for requirements: The requirements writer must specify the full title string
> including any suffix for each page. There is no template that auto-appends " | Waldo.click®".

---

## Page Inventory by SEO Pattern

### Pattern A — Static inline call (most pages)
`$setSEO` called directly in `<script setup>`, synchronously, before any `await`.
Title is a hardcoded string. Runs on SSR and client identically.

| Page | Has title | Has description |
|------|-----------|----------------|
| `index.vue` | ✅ | ✅ |
| `preguntas-frecuentes.vue` | ✅ | ✅ |
| `politicas-de-privacidad.vue` | ✅ | ✅ |
| `contacto/index.vue` | ✅ | ✅ |
| `contacto/gracias.vue` | ✅ | ✅ |
| `packs/index.vue` | ✅ | ✅ |
| `sitemap.vue` | ✅ | ✅ |
| `dev.vue` | ✅ | ✅ |
| `login/index.vue` | ✅ | ✅ |
| `registro.vue` | ✅ | ✅ |
| `recuperar-contrasena.vue` | ✅ | ✅ |
| `restablecer-contrasena.vue` | ✅ | ✅ |
| `cuenta/index.vue` | ✅ | ✅ |
| `cuenta/perfil/index.vue` | ✅ | ✅ |
| `cuenta/perfil/editar.vue` | ✅ | ✅ |
| `cuenta/mis-anuncios.vue` | ✅ | ✅ |
| `cuenta/mis-ordenes.vue` | ✅ | ✅ |
| `cuenta/cambiar-contrasena.vue` | ✅ | ✅ |
| `cuenta/username.vue` | ✅ | ✅ |
| `cuenta/cover.vue` | ✅ | ✅ |
| `cuenta/avatar.vue` | ✅ | ✅ |
| `anunciar/index.vue` | ✅ | ✅ |
| `anunciar/resumen.vue` | ✅ | ✅ |
| `anunciar/gracias.vue` | ✅ | ✅ |
| `anunciar/error.vue` | ✅ | ✅ |
| `packs/comprar.vue` | ✅ | ✅ |
| `packs/error.vue` | ✅ | ✅ |

### Pattern B — Dynamic watch call (data-dependent)
`$setSEO` called inside `watch(data, handler, { immediate: true })` — title depends on API data.

| Page | When SEO is set | SSR risk? |
|------|----------------|-----------|
| `anuncios/[slug].vue` | After `useAsyncData` resolves (`{ server: true, lazy: false }`) | ✅ Safe — `immediate: true` fires synchronously on SSR because `useAsyncData` awaits before watch runs |
| `[slug].vue` (profile) | After `useAsyncData` resolves (`{ server: true, lazy: false }`) | ✅ Safe — same reason |
| `anuncios/index.vue` | After `useAsyncData` resolves (watch on `[adsData, route.query]`) | ✅ Safe — `immediate: true` |
| `packs/gracias.vue` | After `useAsyncData` resolves (plain `watch`, no `immediate`) | ⚠️ See SSR gap note below |

### Pattern C — No $setSEO at all
Pages that do NOT call `$setSEO`:

| Page | Reason |
|------|--------|
| `login/facebook.vue` | Redirect-only page, no visible content |
| `login/google.vue` | Redirect-only page, no visible content |

These pages are excluded from robots (`/login/facebook`, `/login/google` in `robots.disallow`).
No SEO copy needed.

---

## SSR Timing Analysis

### Key fact: `useAsyncData` with `{ server: true, lazy: false }` + `watch({ immediate: true })`

For `anuncios/[slug].vue` and `[slug].vue`:

```
SSR execution order:
1. await useAsyncData(...) — resolves on server before rendering
2. watch(data, handler, { immediate: true }) — fires synchronously with resolved data
3. $setSEO(...) — called with real data before HTML is rendered
4. <title> and <meta> are present in SSR HTML output ✅
```

**There is NO window of missing title during SSR** for these pages, because:
- `server: true` — the fetch runs on the server
- `lazy: false` — the page `await`s the fetch before proceeding
- `immediate: true` — the watcher fires immediately with the already-resolved ref value

### ⚠️ `packs/gracias.vue` — SSR gap

```typescript
useSeoMeta({ robots: "noindex, nofollow" });  // line 97 — fires on SSR

watch(data, (newData) => {                     // line 99 — NO { immediate: true }
  $setSEO({ title: ..., description: ... });   // only fires on subsequent data change
});
```

This page **does NOT set title/description on SSR** — the `watch` without `immediate: true`
only fires when `data` changes after mount. The `robots: noindex` is set, so search engines
won't index it, but the `<title>` will be empty/undefined on first SSR render.

This is an **existing bug** acceptable as-is (page is noindex), but requirements should note
whether to fix it (add `{ immediate: true }`) or leave it.

---

## Correct Pattern for Static Copy

Based on the dominant pattern across 28 pages:

```typescript
// In <script setup> — synchronous, before any await
const { $setSEO } = useNuxtApp();

$setSEO({
  title: "Page Title | Waldo.click®",      // full title, suffix is manual
  description: "Page description here.",
});

// If the page must also be noindex:
useSeoMeta({ robots: "noindex, nofollow" });
```

**Rules:**
1. Call `$setSEO` **synchronously in `<script setup>`**, not inside lifecycle hooks or watchers
2. The title must include the " | Waldo.click®" suffix **manually** — there is no template
3. `robots` is set separately via `useSeoMeta` — `$setSEO` does not accept a `robots` param
4. Do NOT use `useHead` or `useSeoMeta` directly for `title`/`description` — use `$setSEO`
5. Do NOT use `definePageMeta` for SEO meta — it only supports route-level config

**Do NOT do this:**
```typescript
// ❌ Wrong — bypasses $setSEO and misses OG/Twitter tags
useHead({ title: "My Page" });
useSeoMeta({ title: "My Page", description: "..." });

// ❌ Wrong — $setSEO inside onMounted (misses SSR)
onMounted(() => { $setSEO({ ... }); });
```

---

## Architectural Patterns

### Pattern 1: Synchronous Static SEO

**What:** Call `$setSEO` directly in `<script setup>` body before any `await`.
**When to use:** Any page where title and description are known at compile time (no API data needed).
**Trade-offs:** Simplest, always safe for SSR. Title cannot reference live data.

```typescript
const { $setSEO } = useNuxtApp();

$setSEO({
  title: "Compra y Venta de Equipo en Chile | Waldo.click®",
  description: "Publica y encuentra equipo industrial en Chile...",
});
```

### Pattern 2: Watch with `immediate: true` (Dynamic SEO)

**What:** Set SEO inside a `watch` on the `useAsyncData` ref with `{ immediate: true }`.
**When to use:** Pages where title/description include API data (ad name, username, category).
**Trade-offs:** Safe for SSR when `useAsyncData` uses `{ server: true, lazy: false }`.
The `immediate: true` fires synchronously with the already-resolved data on server.

```typescript
const { $setSEO } = useNuxtApp();

const { data } = await useAsyncData("key", fetchFn, { server: true, lazy: false });

watch(
  () => data.value,
  (newData) => {
    if (!newData) return;
    $setSEO({
      title: `${newData.name} | Waldo.click®`,
      description: `Descripción de ${newData.name}...`,
    });
  },
  { immediate: true },
);
```

### Pattern 3: Noindex + SEO combined

**What:** Call `$setSEO` for title/description, then `useSeoMeta` separately for `robots`.
**When to use:** All `cuenta/`, `anunciar/`, `packs/` pages (private/transactional flows).
**Trade-offs:** Two composable calls, but clean separation of concerns.

```typescript
$setSEO({ title: "Mi Cuenta | Waldo.click®", description: "..." });
useSeoMeta({ robots: "noindex, nofollow" });
```

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| `@nuxtjs/seo` module | `site.name` + `site.url` config only | Does not auto-append title suffix in this config |
| Strapi API | Ad/user data fetched via store actions inside `useAsyncData` | Feeds dynamic page titles in `[slug].vue` and `anuncios/[slug].vue` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `seo.ts` plugin ↔ pages | `useNuxtApp().$setSEO(...)` | All pages must import via `useNuxtApp()`, not direct import |
| `$setSEO` ↔ `useSeoMeta` | `$setSEO` calls `useSeoMeta` internally | Never call both for the same tags; they will conflict |
| `site.name` ↔ page title | No automatic relationship | Title suffix is the page author's responsibility |

### New vs Modified Components (for this milestone)

| File | Change Type | What Changes |
|------|-------------|--------------|
| `app/plugins/seo.ts` | **No change** — plugin signature stays as-is | Nothing |
| `nuxt.config.ts` | **No change** — no titleTemplate to add | Nothing |
| `app/pages/*.vue` (28 pages) | **Modified** — title/description strings only | String values passed to `$setSEO` |
| `app/pages/packs/gracias.vue` | **Modified** — optional fix | Add `{ immediate: true }` to watch if gap is in scope |

**Build order:** No compilation dependencies between page changes. All edits are independent string
replacements within existing `$setSEO(...)` calls. TypeScript `typeCheck: true` will pass as long
as `title` and `description` remain `string` (not `undefined`).

---

## Data Flow

### Static Page SEO Flow

```
Page script setup starts
      ↓
$setSEO({ title, description }) called synchronously
      ↓
useSeoMeta({ title, ogTitle, ... }) called inside plugin
      ↓
Nuxt SSR renders <head> with populated tags
      ↓
HTML sent to client with correct <title> and <meta>
```

### Dynamic Page SEO Flow

```
Page script setup starts
      ↓
await useAsyncData("key", fetchFn, { server: true, lazy: false })
      ↓  (server fetches and resolves before continuing)
data ref has resolved value
      ↓
watch(data, handler, { immediate: true }) — fires NOW with resolved data
      ↓
$setSEO({ title: `${data.name} | ...` }) called
      ↓
useSeoMeta sets <head> tags
      ↓
SSR renders HTML with correct dynamic <title>
```

---

## Anti-Patterns

### Anti-Pattern 1: Calling `useSeoMeta` for title/description directly

**What people do:** `useSeoMeta({ title: "...", description: "..." })` in a page.
**Why it's wrong:** Skips OG and Twitter tags. Creates dual source-of-truth with `$setSEO`.
**Do this instead:** Always use `$setSEO`. Use `useSeoMeta` **only** for `robots`.

### Anti-Pattern 2: Setting SEO inside `onMounted` or a non-immediate watcher

**What people do:** `onMounted(() => $setSEO(...))` or `watch(data, handler)` without `immediate: true`.
**Why it's wrong:** `onMounted` is client-only. A watcher without `immediate` does not fire on SSR.
The `<title>` and `<meta description>` will be absent from the SSR HTML — invisible to crawlers.
**Do this instead:** For static pages, call `$setSEO` synchronously. For dynamic pages, use
`watch(data, handler, { immediate: true })`.

### Anti-Pattern 3: Assuming `site.name` appends a suffix

**What people do:** Write a short title like `"Preguntas Frecuentes"` expecting `" | Waldo.click®"` to be appended.
**Why it's wrong:** No `titleTemplate` is configured. The title renders exactly as passed.
**Do this instead:** Always write the complete title string: `"Preguntas Frecuentes | Waldo.click®"`.

### Anti-Pattern 4: Inconsistent OG image path (`/share.jpg` vs `/images/share.jpg`)

**What people do:** Some pages pass `config.public.baseUrl + "/share.jpg"` (no `/images/` prefix),
while the plugin default is `BASE_URL + "/images/share.jpg"`.
**Why it's wrong:** Creates inconsistent OG image paths — some may 404.
**Do this instead:** Standardize to `config.public.baseUrl + "/images/share.jpg"` across all pages,
matching the plugin default.

---

## Sources

- Direct inspection of `apps/website/app/plugins/seo.ts`
- Direct inspection of `apps/website/nuxt.config.ts`
- Direct inspection of all 33 pages in `apps/website/app/pages/`
- Confirmed: no `titleTemplate` in nuxt.config.ts (grep across all `.ts` files found 0 matches for `titleTemplate|titleSeparator|ogSiteName`)

---
*Architecture research for: Website Meta Copy Audit (apps/website — Nuxt 4)*
*Researched: 2026-03-07*
