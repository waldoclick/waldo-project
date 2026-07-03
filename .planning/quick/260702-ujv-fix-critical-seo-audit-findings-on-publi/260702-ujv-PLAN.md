---
phase: quick
plan: 260702-ujv
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/pages/anuncios/[slug].vue
  - apps/website/app/pages/[slug].vue
  - apps/website/app/pages/blog/index.vue
  - apps/website/app/pages/anuncios/index.vue
  - apps/website/app/pages/preguntas-frecuentes.vue
  - apps/website/app/pages/politicas-de-privacidad.vue
  - apps/website/app/pages/politicas-de-cookies.vue
  - apps/website/app/pages/politicas-de-seguridad.vue
  - apps/website/app/pages/terminos-y-condiciones-de-uso.vue
  - apps/website/app/pages/sitemap.vue
  - apps/website/app/pages/contacto/index.vue
  - apps/website/server/routes/sitemap.xml.ts
  - apps/website/app/components/GalleryDefault.vue
  - apps/website/app/components/AdSingle.vue
  - apps/website/app/components/ArticleSingle.vue
autonomous: true
requirements: []
must_haves:
  truths:
    - "SSR returns real HTTP 404 for a non-existent ad slug (/anuncios/{bogus}) instead of 200"
    - "SSR returns real HTTP 404 for a non-existent profile slug (/{bogus}) instead of 200"
    - "Existing valid ad and profile pages still return HTTP 200 after the fix (no over-eager 404)"
    - "All og:image / twitter:image references point to an image file that actually exists (/images/share.jpg), not a 404'd /share.jpg or /contact-share.jpg"
    - "/packs is absent from sitemap.xml (page is noindex,nofollow) while the 3 legal pages previously missing from sitemap.xml are now present"
    - "Ad detail page's primary gallery image loads eager with high fetch priority instead of lazy"
    - "Gallery image alt text reflects the actual ad/article name instead of a hardcoded generic string"
  artifacts:
    - path: "apps/website/app/pages/anuncios/[slug].vue"
      provides: "SSR-safe 404 via watchEffect + pending, mirroring blog/[slug].vue"
    - path: "apps/website/app/pages/[slug].vue"
      provides: "SSR-safe 404 via watchEffect + pending, mirroring blog/[slug].vue"
    - path: "apps/website/server/routes/sitemap.xml.ts"
      provides: "staticPages array without /packs, with 3 added legal pages"
    - path: "apps/website/app/components/GalleryDefault.vue"
      provides: "eager+fetchpriority main image, dynamic name prop driving alt text"
  key_links:
    - from: "apps/website/app/components/AdSingle.vue"
      to: "apps/website/app/components/GalleryDefault.vue"
      via: "name prop bound to all.name"
      pattern: "GalleryDefault.*:name="
    - from: "apps/website/app/components/ArticleSingle.vue"
      to: "apps/website/app/components/GalleryDefault.vue"
      via: "name prop bound to article.title"
      pattern: "GalleryDefault.*:name="
---

<objective>
Fix all CRITICAL and HIGH findings (plus one low-risk MEDIUM) from the SEO audit of apps/website public pages (branch audit/seo-public-pages, based off main):

1. Soft-404 bug on the ad detail page and public profile page — SSR always returns HTTP 200 even for non-existent slugs, because the 404 check only runs client-side inside onMounted.
2. Broken OG/social share image — ~15 call sites across 11 files reference /share.jpg (404, file doesn't exist at that path) or /contact-share.jpg (never existed) instead of the real /images/share.jpg.
3. /packs is listed as an indexable priority-0.6 URL in sitemap.xml.ts even though the page itself sets noindex, nofollow — a direct contradiction search engines penalize.
4. Ad detail page's main/LCP gallery image is loading="lazy", delaying the largest contentful paint.
5. Gallery image alt text is hardcoded generic Spanish strings instead of naming the actual ad/article.
6. (Low-risk MEDIUM) 3 indexable legal pages are missing from sitemap.xml.ts's static URL list.

Purpose: Close every audit finding without touching anything outside its documented scope (BreadcrumbList JSON-LD, canonical whitelist, category/commune URL structure, i18n, PII in JSON-LD, dateModified, profile sitemap entries are explicitly out of scope — separate design decisions the user wants to consider later).

Output: SSR 404s work correctly for ads/profiles, no dead share-image references, sitemap.xml matches actual indexability, LCP + alt text fixed on the ad gallery.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Reference pattern (already correct, DO NOT MODIFY) — apps/website/app/pages/blog/[slug].vue:

```javascript
const { data: pageData, pending } = await useAsyncData<ArticlePageData>(
  () => `article-${route.params.slug}`,
  async () => { /* ... returns { article: null, ... } on not-found, never throws */ },
  { server: true, default: () => ({ article: null, relatedArticles: [] }) },
);

// Show 404 when data is done loading but no article was found
watchEffect(() => {
  if (!pending.value && (!pageData.value || !pageData.value.article)) {
    showError({
      statusCode: 404,
      message: "Artículo no encontrado",
      statusMessage: "Lo sentimos, el artículo que buscas no existe o no está disponible.",
    });
  }
});
```

This runs identically on server and client (no import.meta.client / onMounted gating), which is why blog already returns a real SSR 404.

Confirmed current (buggy) behavior, verified against the running local dev server before writing this plan:
- curl -sI http://localhost:3000/anuncios/does-not-exist-xyz-12345 returns 200 OK (should be 404)
- curl -sI http://localhost:3000/no-such-user-xyz-12345 returns 200 OK (should be 404)
- curl -sI http://localhost:3000/blog/does-not-exist-xyz-12345 returns 404 (already correct — the reference pattern)
- Valid slugs for regression checks: ad alexandra-hester-1771545556625, profile gabrielburgos (both currently 200 OK, must stay 200 OK after the fix)
- Local dev server is already running (pnpm dev via turbo) on port 3000 — no need to start it

DEFAULT_IMAGE constant (apps/website/app/plugins/seo.ts line 6): `${baseUrl}/images/share.jpg` — this is the correct, existing path. index.vue line 110 already uses /images/share.jpg correctly (reference, do not touch).

anuncios/[slug].vue and [slug].vue are touched by BOTH Task 1 (404 logic) and Task 2 (share.jpg fallback), on different, non-adjacent lines. Task 2's edits on these two files MUST be done by matching the exact string `${config.public.baseUrl}/share.jpg` (not by line number), since Task 1 changes line offsets earlier in the same files.

Out of scope (do not touch, confirmed by grep during planning): apps/website/app/pages/restablecer-contrasena.vue, recuperar-contrasena.vue, dev.vue, pagar/error.vue, pagar/gracias.vue, packs/gracias.vue, packs/error.vue, packs/index.vue, cuenta/*, pro/*, anunciar/*, login/index.vue, registro/index.vue, contacto/gracias.vue, error.vue — these also reference /share.jpg, /thanks-share.jpg, or absolute https://waldo.click/share.jpg but are gated/account/auth pages outside the audit's "public pages" scope. Leave them exactly as-is.
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Fix soft-404 SSR bug on ad detail and profile pages</name>
  <files>
apps/website/app/pages/anuncios/[slug].vue
apps/website/app/pages/[slug].vue
  </files>
  <action>
Apply the SAME reactive, SSR-safe 404 pattern already used correctly in apps/website/app/pages/blog/[slug].vue (see context above) to both files. Do not invent a different pattern.

apps/website/app/pages/anuncios/[slug].vue:

1. Destructure pending from the existing useAsyncData call (currently `const { data: adData, refresh } = await useAsyncData<AdPageData | null>(...)` — add pending alongside refresh).
2. Delete the existing client-only guard:
   ```javascript
   // Client-side guard: if adData is null after hydration, show 404 error page.
   // Cannot use watchEffect (fires in SSR → 500). onMounted is client-only.
   onMounted(() => {
     if (!adData.value) {
       showError({ statusCode: 404, message: "Página no encontrada" });
     }
   });
   ```
3. Replace it with (placed right after the adComputed/adAccess computed declarations, so adComputed exists before the watchEffect references it):
   ```javascript
   // Show 404 reactively (runs during SSR, not just onMounted) when data is
   // done loading but no ad was found — mirrors blog/[slug].vue's pattern.
   watchEffect(() => {
     if (!pending.value && !adComputed.value) {
       showError({
         statusCode: 404,
         message: "Página no encontrada",
         statusMessage: "Lo sentimos, el anuncio que buscas no existe o no está disponible.",
       });
     }
   });
   ```
4. Leave the internal try/catch createError({ statusCode: 404/500, ..., fatal: true }) throws inside the useAsyncData handler exactly as they are — they still correctly populate adData.value as null (via default: () => null) when the fetch fails, which is what the new watchEffect checks. Do not remove or restructure them.
5. watchEffect needs no new import — used the same way in blog/[slug].vue without an explicit import (Nuxt auto-import).

apps/website/app/pages/[slug].vue:

1. pending is already destructured from useAsyncData (`const { data: adsData, pending, error } = await useAsyncData<ProfileData | null>(...)`). Remove the now-unused error destructure (never used elsewhere in this file — grep confirmed) — CLAUDE.md forbids unused variables.
2. Delete the existing client-only guard AND the client-only no-op watchEffect immediately below it:
   ```javascript
   // Cannot re-throw error.value in setup (fires in SSR → 500).
   // onMounted is client-only.
   onMounted(() => {
     if (!adsData.value) {
       showError({ statusCode: 404, message: "Página no encontrada" });
     }
   });

   // Observar los datos para cambios dinámicos (solo en cliente)
   if (import.meta.client) {
     watchEffect(() => {
       if (pending.value) return;
       if (adsData.value && adsData.value.user) return;
     });
   }
   ```
3. Replace both with a single reactive watchEffect (runs on server AND client, no import.meta.client gate):
   ```javascript
   // Show 404 reactively (runs during SSR, not just onMounted) when data is
   // done loading but no user profile was found — mirrors blog/[slug].vue's pattern.
   watchEffect(() => {
     if (!pending.value && (!adsData.value || !adsData.value.user)) {
       showError({
         statusCode: 404,
         message: "Página no encontrada",
         statusMessage: "Lo sentimos, la página que buscas no existe.",
       });
     }
   });
   ```
4. Leave the existing `if (RESERVED_USERNAMES.includes(...)) throw createError(...)` guard at the top of the file untouched — it's a separate, already-correct synchronous 404 (fires before any async work).
5. Leave the internal useAsyncData handler's `if (import.meta.server) throw createError(...)` / `return null` branches untouched.

Contingency: If the verify curl checks below still return 200 instead of 404 after this change, it means the handler's throw createError({fatal:true}) is being swallowed by useAsyncData without the watchEffect observing a null data ref. In that case, change the handler to RETURN null-shaped data on the not-found path instead of throwing (mirroring blog/[slug].vue exactly, which never throws inside its handler) — do not attempt a different workaround. Nuxt Vite dev server has HMR for page files; give it a couple seconds after saving before re-running curl.
  </action>
  <verify>
    <automated>sleep 3; echo "bogus ad:"; curl -sI http://localhost:3000/anuncios/does-not-exist-xyz-12345 | head -1; echo "bogus profile:"; curl -sI http://localhost:3000/no-such-user-xyz-12345 | head -1; echo "valid ad (regression):"; curl -sI http://localhost:3000/anuncios/alexandra-hester-1771545556625 | head -1; echo "valid profile (regression):"; curl -sI http://localhost:3000/gabrielburgos | head -1</automated>
  </verify>
  <done>
- Bogus ad slug curl returns HTTP/1.1 404
- Bogus profile slug curl returns HTTP/1.1 404
- Valid ad slug (alexandra-hester-1771545556625) curl still returns HTTP/1.1 200
- Valid profile slug (gabrielburgos) curl still returns HTTP/1.1 200
- No unused variables left (error removed from [slug].vue's useAsyncData destructure)
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Fix broken OG/social share image paths</name>
  <files>
apps/website/app/pages/blog/index.vue
apps/website/app/pages/anuncios/index.vue
apps/website/app/pages/preguntas-frecuentes.vue
apps/website/app/pages/politicas-de-privacidad.vue
apps/website/app/pages/politicas-de-cookies.vue
apps/website/app/pages/politicas-de-seguridad.vue
apps/website/app/pages/terminos-y-condiciones-de-uso.vue
apps/website/app/pages/sitemap.vue
apps/website/app/pages/anuncios/[slug].vue
apps/website/app/pages/[slug].vue
apps/website/app/pages/contacto/index.vue
  </files>
  <action>
The real share image lives at /images/share.jpg (confirmed in apps/website/app/plugins/seo.ts's DEFAULT_IMAGE constant and already used correctly in index.vue). Many public pages instead reference /share.jpg (no file there → 404) or, in one case, /contact-share.jpg (never existed).

In each file below, find every occurrence of the exact substring `${config.public.baseUrl}/share.jpg` and replace it with `${config.public.baseUrl}/images/share.jpg`. Match by string content, not line number (some of these files were also edited by Task 1). Do not touch any other part of these files.

Files with exactly ONE occurrence each:

- apps/website/app/pages/preguntas-frecuentes.vue
- apps/website/app/pages/politicas-de-privacidad.vue
- apps/website/app/pages/politicas-de-cookies.vue
- apps/website/app/pages/politicas-de-seguridad.vue
- apps/website/app/pages/terminos-y-condiciones-de-uso.vue
- apps/website/app/pages/sitemap.vue

Files with exactly TWO occurrences each (fix both):

- apps/website/app/pages/blog/index.vue
- apps/website/app/pages/anuncios/index.vue
- apps/website/app/pages/anuncios/[slug].vue (both inside the $setSEO/structured-data watch block — do not touch the 404 watchEffect added in Task 1)
- apps/website/app/pages/[slug].vue (both inside the $setSEO/structured-data watch block — do not touch the 404 watchEffect added in Task 1)

Special case — apps/website/app/pages/contacto/index.vue:
This file references `${config.public.baseUrl}/contact-share.jpg` (different filename, also 404 — this file never existed anywhere in the codebase). Replace this exact substring with `${config.public.baseUrl}/images/share.jpg` (same target as all the others, not a contact-images/ variant).

After all edits, run a repo-wide grep to confirm zero remaining bad references in the 11 files above (files outside this list, e.g. cuenta/*, pro/*, login, registro, are intentionally left untouched per audit scope — see context).
  </action>
  <verify>
    <automated>grep -rn "baseUrl}/share.jpg\|baseUrl}/contact-share.jpg" apps/website/app/pages/blog/index.vue apps/website/app/pages/anuncios/index.vue apps/website/app/pages/preguntas-frecuentes.vue apps/website/app/pages/politicas-de-privacidad.vue apps/website/app/pages/politicas-de-cookies.vue apps/website/app/pages/politicas-de-seguridad.vue apps/website/app/pages/terminos-y-condiciones-de-uso.vue apps/website/app/pages/sitemap.vue "apps/website/app/pages/anuncios/[slug].vue" "apps/website/app/pages/[slug].vue" apps/website/app/pages/contacto/index.vue; echo "grep exit code: $? (expect 1 = zero matches found)"</automated>
  </verify>
  <done>
- grep for baseUrl}/share.jpg or baseUrl}/contact-share.jpg across the 11 listed files returns zero matches
- All 11 files now use `${config.public.baseUrl}/images/share.jpg`
- No files outside the listed 11 were modified
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Fix sitemap.xml.ts — remove noindexed /packs, add missing legal pages</name>
  <files>apps/website/server/routes/sitemap.xml.ts</files>
  <action>
This file's staticPages array (near the top of the default export handler) currently is:

```javascript
const staticPages = [
  { loc: "/", changefreq: "daily", priority: 1 },
  { loc: "/anuncios", changefreq: "hourly", priority: 0.9 },
  { loc: "/blog", changefreq: "daily", priority: 0.8 },
  { loc: "/packs", changefreq: "monthly", priority: 0.6 },
  { loc: "/preguntas-frecuentes", changefreq: "monthly", priority: 0.5 },
  { loc: "/contacto", changefreq: "yearly", priority: 0.4 },
  { loc: "/politicas-de-privacidad", changefreq: "yearly", priority: 0.3 },
];
```

Two changes, both in this same array:

1. Remove the `{ loc: "/packs", changefreq: "monthly", priority: 0.6 }` entry entirely. The /packs page (apps/website/app/pages/packs/index.vue) sets `useSeoMeta({ robots: "noindex, nofollow" })` — listing it as an indexable priority-0.6 URL directly contradicts that and is a documented audit finding. Do not touch packs/index.vue itself (it already correctly sets noindex,nofollow — confirmed during planning).

2. Add 3 new entries alongside the existing /politicas-de-privacidad entry, matching its changefreq/priority pattern exactly (these are indexable legal pages currently missing from the sitemap):
   ```javascript
   { loc: "/politicas-de-cookies", changefreq: "yearly", priority: 0.3 },
   { loc: "/politicas-de-seguridad", changefreq: "yearly", priority: 0.3 },
   { loc: "/terminos-y-condiciones-de-uso", changefreq: "yearly", priority: 0.3 },
   ```

Resulting array (order-preserving, /packs removed, 3 legal pages appended at the end):
```javascript
const staticPages = [
  { loc: "/", changefreq: "daily", priority: 1 },
  { loc: "/anuncios", changefreq: "hourly", priority: 0.9 },
  { loc: "/blog", changefreq: "daily", priority: 0.8 },
  { loc: "/preguntas-frecuentes", changefreq: "monthly", priority: 0.5 },
  { loc: "/contacto", changefreq: "yearly", priority: 0.4 },
  { loc: "/politicas-de-privacidad", changefreq: "yearly", priority: 0.3 },
  { loc: "/politicas-de-cookies", changefreq: "yearly", priority: 0.3 },
  { loc: "/politicas-de-seguridad", changefreq: "yearly", priority: 0.3 },
  { loc: "/terminos-y-condiciones-de-uso", changefreq: "yearly", priority: 0.3 },
];
```

Do not touch the ads/articles fetch logic below this array, the cachedEventHandler options, or anything else in this file.
  </action>
  <verify>
    <automated>grep -n '"/packs"' apps/website/server/routes/sitemap.xml.ts; echo "packs exit code: $? (expect 1 = not found)"; grep -c '"/politicas-de-cookies"\|"/politicas-de-seguridad"\|"/terminos-y-condiciones-de-uso"' apps/website/server/routes/sitemap.xml.ts</automated>
  </verify>
  <done>
- staticPages array no longer contains a "/packs" entry
- staticPages array contains "/politicas-de-cookies", "/politicas-de-seguridad", "/terminos-y-condiciones-de-uso" entries (grep -c returns 3)
- No other part of sitemap.xml.ts modified
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 4: Fix ad gallery LCP loading and dynamic alt text</name>
  <files>
apps/website/app/components/GalleryDefault.vue
apps/website/app/components/AdSingle.vue
apps/website/app/components/ArticleSingle.vue
  </files>
  <behavior>
- GalleryDefault's main/primary image renders with loading="eager" and fetchpriority="high" (was loading="lazy") — matches the pattern already used correctly for the homepage hero image in PictureDefault.vue (NuxtImg loading="eager" fetchpriority="high"). Thumbnail images stay loading="lazy" (unaffected — they are never the LCP element).
- GalleryDefault accepts a new `name` prop (String, default ""). When provided, the main image's alt/title reads "Imagen principal: {name}" and thumbnail alt/title reads "Imagen secundaria: {name}". When not provided (name is ""), alt/title fall back to the current generic "Imagen principal" / "Imagen secundaria" strings — no visual regression for any caller that doesn't pass name.
- GalleryDefault is a shared component consumed by both the ad detail page (AdSingle.vue) and the blog article page (ArticleSingle.vue) — applying eager+fetchpriority to the main image benefits both (neither HeroAnnouncement.vue nor HeroArticle.vue render an image, so GalleryDefault's main image is the LCP candidate on both pages). This is a deliberate choice, not a bug: splitting the component into ad-specific and article-specific variants would violate the project's "no new abstractions" rule for a component that is otherwise identical.
  </behavior>
  <action>
**apps/website/app/components/GalleryDefault.vue:**

1. Add a `name` prop to the existing `defineProps`:
   ```javascript
   const props = defineProps({
     media: {
       type: Array,
       default: () => [],
     },
     name: {
       type: String,
       default: "",
     },
   });
   ```
2. Add two computed alt-text helpers near the other computed refs:
   ```javascript
   const mainImageAlt = computed(() =>
     props.name ? `Imagen principal: ${props.name}` : "Imagen principal",
   );
   const thumbnailAlt = computed(() =>
     props.name ? `Imagen secundaria: ${props.name}` : "Imagen secundaria",
   );
   ```
3. In the template, update the main image `<img>` tag (currently `loading="lazy"` with hardcoded alt/title "Imagen principal"):
   ```html
   <img
     loading="eager"
     fetchpriority="high"
     decoding="async"
     :src="mainImageUrl"
     :alt="mainImageAlt"
     :title="mainImageAlt"
   />
   ```
4. In the template, update the thumbnail `<img>` tag's alt/title (keep `loading="lazy"` — thumbnails are never the LCP element):
   ```html
   <img
     loading="lazy"
     decoding="async"
     :src="image"
     :alt="thumbnailAlt"
     :title="thumbnailAlt"
   />
   ```

**apps/website/app/components/AdSingle.vue:**
Update the `<GalleryDefault>` usage to pass the ad's name:
```html
<GalleryDefault :media="all?.gallery || null" :name="all?.name" />
```

**apps/website/app/components/ArticleSingle.vue:**
Update the `<GalleryDefault>` usage to pass the article's title:
```html
<GalleryDefault :media="props.article.gallery ?? []" :name="props.article.title" />
```
  </action>
  <verify>
    <automated>grep -n 'loading="eager"' apps/website/app/components/GalleryDefault.vue; grep -n 'fetchpriority="high"' apps/website/app/components/GalleryDefault.vue; grep -n 'name:' apps/website/app/components/GalleryDefault.vue; grep -n 'GalleryDefault.*:name=' apps/website/app/components/AdSingle.vue apps/website/app/components/ArticleSingle.vue</automated>
  </verify>
  <done>
- GalleryDefault.vue main image has loading="eager" and fetchpriority="high"
- GalleryDefault.vue thumbnail images still have loading="lazy"
- GalleryDefault.vue accepts a name prop driving dynamic alt/title text with generic fallback
- AdSingle.vue passes :name="all?.name" to GalleryDefault
- ArticleSingle.vue passes :name="props.article.title" to GalleryDefault
  </done>
</task>

</tasks>

<verification>
After all 4 tasks:
1. curl -sI http://localhost:3000/anuncios/does-not-exist-xyz-12345 returns 404 (was 200)
2. curl -sI http://localhost:3000/no-such-user-xyz-12345 returns 404 (was 200)
3. curl -sI http://localhost:3000/anuncios/alexandra-hester-1771545556625 still returns 200 (no regression)
4. curl -sI http://localhost:3000/gabrielburgos still returns 200 (no regression)
5. grep -rn "baseUrl}/share.jpg\|baseUrl}/contact-share.jpg" across the 11 fixed pages returns zero matches
6. apps/website/server/routes/sitemap.xml.ts has no "/packs" entry and has all 3 new legal page entries
7. apps/website/app/components/GalleryDefault.vue main image is loading="eager" fetchpriority="high" with dynamic alt
8. vue-tsc / nuxi typecheck for apps/website is not broken by these changes (run from apps/website: node ../../node_modules/.bin/nuxi typecheck, or vue-tsc --noEmit if typecheck is slow/unavailable in this sandbox)
9. Visual spot-check (optional, not automatable): visit /anuncios/alexandra-hester-1771545556625 in a browser, confirm the main gallery image and its alt text (inspect element) reflect the ad name, and confirm og:image meta tag (view-source or browser devtools) resolves to a 200, not a 404
</verification>

<success_criteria>
- All 6 numbered audit findings (3 CRITICAL, 2 HIGH, 1 MEDIUM) are closed
- SSR returns real HTTP 404 status codes for non-existent ad and profile slugs, verified via curl -I (not just visually rendering an error page after hydration)
- No existing valid ad/profile page regresses to a 404
- Zero remaining /share.jpg or /contact-share.jpg references in the 11 audited public pages
- sitemap.xml.ts no longer lists the noindexed /packs page and now lists all 4 legal pages (privacidad + the 3 newly added)
- Ad detail page's primary gallery image is eager-loaded with high fetch priority and has a dynamic, ad-specific alt text
- Nothing outside the documented scope was touched (no BreadcrumbList, canonical whitelist, category/commune URL structure, i18n, PII in JSON-LD, dateModified, or profile sitemap entry changes)
</success_criteria>

<output>
After completion, create `.planning/quick/260702-ujv-fix-critical-seo-audit-findings-on-publi/260702-ujv-SUMMARY.md`
</output>
