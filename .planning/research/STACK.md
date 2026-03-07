# Technology Stack: Website Meta Copy Audit (v1.16)

**Project:** Waldo — `apps/website`
**Researched:** 2026-03-07
**Milestone:** v1.16 — Audit and rewrite all `<title>` and `<meta description>` tags

---

## No New Packages Needed

This milestone is **copy-only**. Zero new npm dependencies. All required mechanisms are
already installed and wired. The work is: read every page's current `$setSEO` call, evaluate
the copy, and replace strings.

---

## How Titles Actually Render (end-to-end)

Understanding the rendering pipeline is critical before changing any copy — a wrong mental
model leads to double-suffixed or stripped titles.

### Pipeline

```
$setSEO({ title: "Foo" })
  → useSeoMeta({ title: "Foo", ogTitle: "Foo", twitterTitle: "Foo", ... })
      → sets <title> content to "Foo"
          → nuxt-seo-utils titleTemplate: "%s %separator %siteName"
              → unhead resolves %s = "Foo", %separator = "|", %siteName = "Waldo.click®"
                  → final browser <title>: "Foo | Waldo.click®"
```

### Layer 1 — `$setSEO` plugin (`app/plugins/seo.ts`)

The custom Nuxt plugin. **Single call site for all SEO on every page.**

```typescript
$setSEO({
  title: string,        // required — the page-specific title (NO site suffix)
  description: string,  // required — 120–160 chars, keyword-rich
  imageUrl?: string,    // optional — defaults to /images/share.jpg
  url?: string,         // optional — canonical URL
  ogType?: string,      // optional — defaults to "website"
  twitterCard?: string  // optional — defaults to "summary_large_image"
})
```

Internally calls `useSeoMeta()` and sets: `title`, `description`, `ogTitle`, `ogDescription`,
`ogImage`, `ogUrl`, `ogType`, `twitterCard`, `twitterTitle`, `twitterDescription`.

**Confidence:** HIGH (read from source at `apps/website/app/plugins/seo.ts`)

### Layer 2 — `nuxt-seo-utils` title template (active, automatic)

`nuxt-seo-utils` (sub-module of `@nuxtjs/seo@3.4.0`, installed) registers a plugin
(`applyDefaults.js`) that calls:

```javascript
useHead({
  titleTemplate: "%s %separator %siteName"
}, { tagPriority: "low" })
```

This is applied **at low priority**, meaning any page-level `useSeoMeta({ title })` or
`useHead({ title })` wins for the `%s` slot, and the template appends the suffix.

**Result:** Whatever string `title` you pass to `$setSEO` becomes `%s`. The final rendered
`<title>` is always **`{your title} | Waldo.click®`**.

- `%separator` defaults to `|` (from `unhead`: `const sep = params.separator || "|"`)
- `%siteName` resolves from `site.name` in `nuxt.config.ts` → `"Waldo.click®"`

**Confidence:** HIGH (verified in installed source:
`node_modules/nuxt-seo-utils/dist/runtime/app/logic/applyDefaults.js` and
`node_modules/unhead/dist/shared/unhead.ckV6dpEQ.mjs`)

### Layer 3 — `site` config in `nuxt.config.ts`

```typescript
site: {
  name: "Waldo.click®",
  url: process.env.BASE_URL  // not set in local mode
}
```

`site.name` is the only site-wide title variable. It is **not configurable per-page** — it
is always the suffix. There is no `titleSeparator` override in `nuxt.config.ts` (uses the
default `|`).

**Confidence:** HIGH (read directly from `apps/website/nuxt.config.ts`)

### Layer 4 — fallback titles plugin (`nuxt-seo-utils`)

A second plugin (`titles.js`) runs at `tagPriority: 101` (lower than page-level, higher than
`applyDefaults`). It derives a fallback title from the last URL segment if no title is set:

```javascript
// If no title set, use titleCase of last route segment
return lastSegment ? titleCase(lastSegment) : null;
```

This is a **safety net only** — it fires when a page has no `$setSEO` call at all.
Pages with `$setSEO` override it.

**Confidence:** HIGH (verified in installed source:
`node_modules/nuxt-seo-utils/dist/runtime/app/plugins/titles.js`)

---

## The Correct Pattern for Static Pages

```vue
<script setup lang="ts">
const { $setSEO } = useNuxtApp()

// Always call at top level (not inside watch/onMounted) for static pages
$setSEO({
  title: "Keyword-Rich Page Title",   // NO "| Waldo.click®" suffix — added automatically
  description: "120–160 chars. Keyword-rich, action-oriented. No dynamic counters.",
})
</script>
```

**What NOT to do:**
- Do NOT include `| Waldo.click®` in the title string — the template doubles it
- Do NOT use raw `useSeoMeta({ title })` directly on pages — bypasses nothing but
  creates inconsistency; `$setSEO` is the established pattern
- Do NOT use raw `useHead({ title })` directly on pages — same reason

**Confidence:** HIGH

---

## Page Inventory: Current SEO State

All 33 pages surveyed. Call pattern breakdown:

| Pattern | Pages | Notes |
|---------|-------|-------|
| `$setSEO({ title, description })` top-level | ~22 pages | Standard static pattern — correct |
| `$setSEO` inside `watch(..., { immediate: true })` | 3 pages | Dynamic pages: `anuncios/index.vue`, `anuncios/[slug].vue`, `[slug].vue` |
| No `$setSEO` at all | 2 pages | `login/facebook.vue`, `login/google.vue` (redirect-only pages, noindex) |

### Pages with `$setSEO` top-level (static copy — audit candidates)

| Page | Current Title | Has Description? |
|------|--------------|-----------------|
| `index.vue` | "Compra y Venta de Equipo en Chile" | ✓ |
| `preguntas-frecuentes.vue` | "Preguntas Frecuentes" | ✓ |
| `politicas-de-privacidad.vue` | "Políticas de Privacidad" | ✓ |
| `contacto/index.vue` | "Contacto" | ✓ |
| `contacto/gracias.vue` | "Gracias por contactarnos" | ✓ |
| `sitemap.vue` | "Mapa del Sitio" | ✓ |
| `packs/index.vue` | "Packs de Avisos" | ✓ |
| `login/index.vue` | "Iniciar sesión" | ✓ + noindex |
| `registro.vue` | "Regístrate" | ✓ + noindex |
| `recuperar-contrasena.vue` | "Recuperar Contraseña" | ✓ + noindex |
| `restablecer-contrasena.vue` | "Restablecer Contraseña" | ✓ + noindex |
| `anunciar/index.vue` | "Crear Anuncio" | ✓ + noindex |
| `anunciar/resumen.vue` | "Resumen del Anuncio" | ✓ + noindex |
| `anunciar/gracias.vue` | "Gracias por Publicar" | ✓ + noindex |
| `anunciar/error.vue` | "Error al Crear Anuncio" | ✓ + noindex |
| `packs/comprar.vue` | "Comprar Pack" | ✓ + noindex |
| `packs/error.vue` | "Error en el Pago" | ✓ + noindex |
| `cuenta/index.vue` | "Mi Cuenta" | ✓ + noindex |
| `cuenta/perfil/index.vue` | "Perfil" | ✓ + noindex |
| `cuenta/perfil/editar.vue` | "Editar Perfil" | ✓ + noindex |
| `cuenta/mis-anuncios.vue` | "Mis Anuncios" | ✓ + noindex |
| `cuenta/mis-ordenes.vue` | "Mis Órdenes" | ✓ + noindex |
| `cuenta/cambiar-contrasena.vue` | "Cambiar Contraseña" | ✓ + noindex |
| `cuenta/username.vue` | "Personalizar Nombre de Usuario" | ✓ + noindex |
| `cuenta/cover.vue` | "Personalizar Portada" | ✓ + noindex |
| `cuenta/avatar.vue` | "Personalizar Avatar" | ✓ + noindex |
| `dev.vue` | "Acceso Restringido - Modo Desarrollo" | ✓ + noindex |

### Pages with dynamic `$setSEO` (watch-based — special handling)

| Page | Title Pattern | Dynamic Variable | Audit concern |
|------|--------------|-----------------|---------------|
| `anuncios/[slug].vue` | `{ad.name} en {commune} \| Venta de Equipo en Waldo.click` | ad.name, commune | Title has manual ` \| Waldo.click` suffix — doubles the auto-suffix |
| `anuncios/index.vue` | Generated by `generateSEOTitle()` | category, commune, search query | Description uses `${totalAds} anuncios` counter — replace with static |
| `[slug].vue` (user profile) | `Perfil de ${username} \| Waldo.click®` | username | Manual ` \| Waldo.click®` suffix — doubles the auto-suffix |

**Critical issue found in dynamic pages:** Both `anuncios/[slug].vue` and `[slug].vue`
manually append `| Waldo.click` to their titles, which **doubles the site suffix** because
the `titleTemplate` appends `| Waldo.click®` automatically. The `$setSEO({ title })` string
should never contain the separator or site name.

### Pages without `$setSEO` (noindex redirect-only)

| Page | Why No SEO | Action |
|------|-----------|--------|
| `login/facebook.vue` | OAuth callback, immediate redirect, no UI | Acceptable — noindex by robots.txt |
| `login/google.vue` | OAuth callback, immediate redirect, no UI | Acceptable — noindex by robots.txt |

---

## What `app.vue` Does to SEO

```javascript
useHead(() => ({
  meta: config.public.blockSearchEngines
    ? [{ name: "robots", content: "noindex, nofollow" }]
    : []
}))
```

This is a **global environment-controlled noindex**. When `BLOCK_SEARCH_ENGINES=true` (e.g.,
staging), it adds noindex to every page regardless of individual page settings. This does NOT
affect title/description rendering.

**Confidence:** HIGH (read from `apps/website/app/app.vue`)

---

## `useSeoMeta` Direct Usage (non-`$setSEO`)

Some pages call `useSeoMeta` directly **in addition to** `$setSEO` — exclusively for the
`robots` meta tag:

```typescript
useSeoMeta({ robots: "noindex, nofollow" });  // 18 private/transactional pages
```

This is correct and intentional. It is **separate** from title/description — does not
interfere with them.

---

## `@nuxtjs/seo` Sub-Modules Active in This Project

| Module | Version | Role | Affects Title/Description? |
|--------|---------|------|---------------------------|
| `nuxt-seo-utils` | (part of @nuxtjs/seo 3.4.0) | titleTemplate, fallback titles, canonical | **YES — adds `| Waldo.click®` suffix** |
| `nuxt-og-image` | (part of @nuxtjs/seo) | OG image generation | No |
| `nuxt-site-config` | (part of @nuxtjs/seo) | Provides `site.name`, `site.url` | Indirectly (supplies `%siteName` token) |
| `nuxt-robots` | (part of @nuxtjs/seo) | robots.txt | No |
| `nuxt-sitemap` | (part of @nuxtjs/seo) | sitemap.xml | No |
| `nuxt-schema-org` | (part of @nuxtjs/seo) | JSON-LD | No |

---

## Key Rules for the Requirements Writer

1. **The auto-suffix is `| Waldo.click®`** — copy auditors must NOT write titles with this
   suffix; the template adds it automatically. Final browser title = `{title} | Waldo.click®`.

2. **`$setSEO({ title, description })` is the canonical call** — use it at top level in
   `<script setup>` for static pages. No alternatives needed.

3. **Dynamic pages use `watch(..., { immediate: true })`** — the `anuncios/index.vue`,
   `anuncios/[slug].vue`, and `[slug].vue` pages build titles from runtime data. These need
   their template strings audited, not a pattern change.

4. **Fix the double-suffix bug on two dynamic pages:**
   - `anuncios/[slug].vue` line 187: remove manual `| Venta de Equipo en Waldo.click` from
     the template string
   - `[slug].vue` line 161: remove manual `| Waldo.click®` from the template string

5. **Description is set directly via `$setSEO`** — `@nuxtjs/seo` does NOT auto-generate
   descriptions. If `description` is empty/missing, the page has no meta description. Every
   page currently has one.

6. **`anuncios/index.vue` description uses a counter** (`${totalAds} anuncios`) — this is
   the dynamic counter the milestone targets. Replace with static keyword-rich copy.

7. **`[slug].vue` (user profile) description uses a counter** (`${totalAds} anuncios
   publicados`) — same concern. Replace with static copy.

8. **`packs/gracias.vue` title is dynamic** from pack data — noindex page, low priority.

9. **noindex pages** (18 pages): their titles/descriptions are served to users but not
   indexed. They still matter for UX (browser tab, share previews), but are not SEO-critical.

10. **TypeScript**: no type changes needed. `$setSEO` signature accepts `string` for both
    title and description. Changing string values is type-safe.

---

## Sources

| Claim | Source | Confidence |
|-------|--------|------------|
| `titleTemplate: "%s %separator %siteName"` | `node_modules/nuxt-seo-utils/dist/runtime/app/logic/applyDefaults.js:52` | HIGH |
| Default separator is `\|` | `node_modules/unhead/dist/shared/unhead.ckV6dpEQ.mjs:131` | HIGH |
| `site.name: "Waldo.click®"` | `apps/website/nuxt.config.ts:136` | HIGH |
| `$setSEO` plugin signature | `apps/website/app/plugins/seo.ts` | HIGH |
| `@nuxtjs/seo` installed version 3.4.0 | `node_modules/@nuxtjs/seo/package.json` | HIGH |
| Double-suffix bug in `anuncios/[slug].vue` | `apps/website/app/pages/anuncios/[slug].vue:187-189` | HIGH |
| Double-suffix bug in `[slug].vue` | `apps/website/app/pages/[slug].vue:161` | HIGH |
| Counter in `anuncios/index.vue` description | `apps/website/app/pages/anuncios/index.vue:309` | HIGH |
| Counter in `[slug].vue` description | `apps/website/app/pages/[slug].vue:162` | HIGH |
| Fallback title plugin (low priority) | `node_modules/nuxt-seo-utils/dist/runtime/app/plugins/titles.js` | HIGH |
