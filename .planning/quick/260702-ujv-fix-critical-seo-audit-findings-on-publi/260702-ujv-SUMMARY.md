---
phase: quick
plan: 260702-ujv
subsystem: seo
tags: [nuxt, ssr, seo, sitemap, og-image, lcp, accessibility]

# Dependency graph
requires: []
provides:
  - Real SSR HTTP 404s for non-existent ad and profile slugs (was soft-404: always 200)
  - Correct og:image/twitter:image references (/images/share.jpg) across 11 public pages
  - sitemap.xml.ts free of the noindexed /packs page, with 3 previously-missing legal pages added
  - Ad/article gallery main image eager+high-fetchpriority with dynamic, name-driven alt text
affects: [seo-audit, website-public-pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SSR-safe reactive 404: watchEffect(() => { if (!pending.value && !data.value) showError(...) }) instead of onMounted-gated guards — runs identically on server and client, mirroring blog/[slug].vue"

key-files:
  created: []
  modified:
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

key-decisions:
  - "Substituted the plan's stale regression-test ad slug (alexandra-hester-1771545556625, no longer accessible in dev DB) with a genuinely active slug (maxine-pugh-1775416573859) confirmed live via /api/ads/catalog — no code change, verification-data fix only"
  - "Left blog/[slug].vue's identical /share.jpg bug untouched — it was absent from both Task 2's file list and the plan's explicit out-of-scope list (a genuine audit gap), logged to deferred-items.md instead of fixed, per the project's 'only scope what's approved' convention"
  - "ArticleSingle.vue's :name binding formatted as a multi-line attribute by the repo's prettier/eslint pre-commit hook — functionally identical to the plan's single-line spec"

requirements-completed: []

# Metrics
duration: 35min
completed: 2026-07-03
---

# Quick Task 260702-ujv: Fix critical SEO audit findings on public pages Summary

**Closed all 6 SEO audit findings on apps/website public pages: SSR soft-404 fixed on ad/profile pages, 11 files' dead /share.jpg and /contact-share.jpg references repointed to the real /images/share.jpg, /packs removed from sitemap.xml.ts while 3 missing legal pages were added, and the ad/article gallery's LCP image switched from lazy to eager+high-priority with dynamic alt text.**

## Performance

- **Duration:** 35 min
- **Started:** 2026-07-03T02:05:00Z
- **Completed:** 2026-07-03T02:40:00Z
- **Tasks:** 4
- **Files modified:** 15

## Accomplishments
- SSR now returns a real HTTP 404 for non-existent ad (`/anuncios/{bogus}`) and profile (`/{bogus}`) slugs, verified via `curl -I` — previously always 200 due to a client-only `onMounted` guard
- Valid ad and profile pages confirmed to still return 200 after the fix (regression-checked against a genuinely live ad, since the plan's original test fixture had gone stale in the dev DB independent of this change)
- All `og:image`/`twitter:image` references across 11 public pages now point to the real `/images/share.jpg` file instead of 404ing `/share.jpg` or never-existed `/contact-share.jpg`
- `sitemap.xml.ts` no longer contradicts `/packs`' own `noindex,nofollow` meta tag, and now lists all 4 legal pages (previously only privacidad)
- Ad/article detail pages' primary gallery image (the LCP candidate on both page types) loads eager with `fetchpriority="high"`; alt/title text is now dynamic (`"Imagen principal: {name}"`) instead of a hardcoded generic string

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix soft-404 SSR bug on ad detail and profile pages** - `eaadca9e` (fix)
2. **Task 2: Fix broken OG/social share image paths** - `3dbfe6b7` (fix)
3. **Task 3: Fix sitemap.xml.ts — remove noindexed /packs, add missing legal pages** - `a5680685` (fix)
4. **Task 4: Fix ad gallery LCP loading and dynamic alt text** - `5b5bfa48` (fix)

_Note: Task 4 was flagged `tdd="true"` in the plan, but its `<action>` specified no test file and its `<verify>` block was grep-only; no component test infrastructure exists for GalleryDefault/PictureDefault-style components in apps/website/tests/components/, so no new test scaffolding was introduced — implementation-only, matching the plan's actual verify spec._

## Files Created/Modified
- `apps/website/app/pages/anuncios/[slug].vue` - Reactive `watchEffect`-based 404 (replaces `onMounted` guard); also fixed 2x `/share.jpg` refs
- `apps/website/app/pages/[slug].vue` - Reactive `watchEffect`-based 404 (replaces `onMounted` guard + dead client-only watchEffect); removed unused `error` destructure; also fixed 2x `/share.jpg` refs
- `apps/website/app/pages/blog/index.vue` - Fixed 2x `/share.jpg` refs
- `apps/website/app/pages/anuncios/index.vue` - Fixed 2x `/share.jpg` refs
- `apps/website/app/pages/preguntas-frecuentes.vue` - Fixed 1x `/share.jpg` ref
- `apps/website/app/pages/politicas-de-privacidad.vue` - Fixed 1x `/share.jpg` ref
- `apps/website/app/pages/politicas-de-cookies.vue` - Fixed 1x `/share.jpg` ref
- `apps/website/app/pages/politicas-de-seguridad.vue` - Fixed 1x `/share.jpg` ref
- `apps/website/app/pages/terminos-y-condiciones-de-uso.vue` - Fixed 1x `/share.jpg` ref
- `apps/website/app/pages/sitemap.vue` - Fixed 1x `/share.jpg` ref
- `apps/website/app/pages/contacto/index.vue` - Fixed 1x `/contact-share.jpg` ref
- `apps/website/server/routes/sitemap.xml.ts` - Removed `/packs` entry, added 3 legal page entries to `staticPages`
- `apps/website/app/components/GalleryDefault.vue` - Main image `loading="eager" fetchpriority="high"`, added `name` prop driving dynamic alt/title with generic fallback
- `apps/website/app/components/AdSingle.vue` - Passes `:name="all?.name"` to GalleryDefault
- `apps/website/app/components/ArticleSingle.vue` - Passes `:name="props.article.title"` to GalleryDefault

## Decisions Made
- Regression-test ad slug substitution (see key-decisions above) — no functional impact, verification-data correction only
- blog/[slug].vue's identical share-image bug left unfixed and logged as a deferred item, respecting the plan's explicit file scope

## Deviations from Plan

### Auto-fixed Issues

None — no auto-fixes under Rules 1-3 were required. All changes matched the plan's specified actions exactly.

### Scope-boundary discoveries (not fixed, logged only)

**1. `apps/website/app/pages/blog/[slug].vue` has the same `/share.jpg` bug, but is outside Task 2's file list**
- **Found during:** Task 2
- **Issue:** Lines 127 and 141 reference `${config.public.baseUrl}/share.jpg`, identical to the bug fixed elsewhere — but this file is absent from both Task 2's 11-file list and the plan's explicit out-of-scope list (a genuine audit gap, not an intentional exclusion)
- **Action:** Left untouched; logged to `deferred-items.md` for a future quick task
- **Files modified:** None

---

**Total deviations:** 0 auto-fixed, 1 scope-boundary item deferred and documented
**Impact on plan:** No scope creep. The one deferred item is a pre-existing bug outside this plan's file list, not caused by this plan's changes.

## Issues Encountered
- The plan's regression-check ad slug (`alexandra-hester-1771545556625`) returned a genuine `404 "Ad not found or access denied"` from the website's own `/api/ads/slug/:slug` proxy route after the Task 1 fix — not a regression, but the correct fix surfacing a pre-existing data-availability issue that the old soft-404 bug had been masking (the buggy code always returned HTTP 200 regardless of whether the ad actually loaded). Resolved by substituting a confirmed-live ad slug (`maxine-pugh-1775416573859`, verified via `/api/ads/catalog`) for the regression check. See `deferred-items.md` for full detail.
- `sitemap.xml.ts` is wrapped in a 1-hour `cachedEventHandler` (Nitro dev cache) — had to manually clear `apps/website/.nuxt/cache/nitro/handlers/sitemap-xml/sitemapxml.json` to observe the Task 3 change take effect immediately during verification (no code change; local dev-cache artifact only).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 4 tasks complete, all plan verification checks pass (SSR 404s, share-image grep, sitemap.xml.ts contents, gallery eager+alt), `vue-tsc --noEmit` clean for apps/website
- One deferred item logged (`deferred-items.md`) for blog/[slug].vue's identical share-image bug — recommend a small follow-up quick task
- Branch `audit/seo-public-pages` ready for review/merge decision by the user; no push performed

## Self-Check: PASSED

All 6 modified/verified files exist on disk; all 4 task commit hashes (eaadca9e, 3dbfe6b7, a5680685, 5b5bfa48) found in git log.

---
*Phase: quick/260702-ujv*
*Completed: 2026-07-03*
