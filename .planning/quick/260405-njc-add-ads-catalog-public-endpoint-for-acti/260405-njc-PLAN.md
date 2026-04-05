---
phase: quick
plan: 260405-njc
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/api/ad/controllers/ad.ts
  - apps/strapi/src/api/ad/routes/00-ad-custom.ts
  - apps/website/app/stores/ads.store.ts
  - apps/website/server/routes/sitemap.xml.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "Public website listing at /anuncios shows all active ads without authentication"
    - "Sitemap includes all active ads fetched from public catalog endpoint"
    - "Authenticated user's account section still uses /ads/actives for their own ads"
  artifacts:
    - path: "apps/strapi/src/api/ad/controllers/ad.ts"
      provides: "catalog controller method"
      contains: "async catalog"
    - path: "apps/strapi/src/api/ad/routes/00-ad-custom.ts"
      provides: "public catalog route"
      contains: "/ads/catalog"
  key_links:
    - from: "apps/website/app/stores/ads.store.ts"
      to: "/api/ads/catalog"
      via: "client GET call in loadAds"
      pattern: "ads/catalog"
    - from: "apps/website/server/routes/sitemap.xml.ts"
      to: "/api/ads/catalog"
      via: "server-side fetch"
      pattern: "ads/catalog"
---

<objective>
Add a public GET /ads/catalog endpoint in Strapi that returns all active ads without authentication, then update the website's public-facing pages to use it instead of /ads/actives (which now requires auth and filters by userId).

Purpose: The recent refactor of /ads/actives added role-based userId filtering, breaking the public website's ad listing and sitemap. A dedicated public catalog endpoint restores this functionality.
Output: Working public catalog endpoint + updated website store and sitemap.
</objective>

<context>
@apps/strapi/src/api/ad/controllers/ad.ts
@apps/strapi/src/api/ad/routes/00-ad-custom.ts
@apps/website/app/stores/ads.store.ts
@apps/website/server/routes/sitemap.xml.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add catalog controller method and public route in Strapi</name>
  <files>apps/strapi/src/api/ad/controllers/ad.ts, apps/strapi/src/api/ad/routes/00-ad-custom.ts</files>
  <action>
1. In `apps/strapi/src/api/ad/controllers/ad.ts`, add a `catalog` method to the controller object (after the `actives` method). It should:
   - Follow the exact same pagination extraction pattern as `actives` (parse `ctx.query.pagination.page` and `ctx.query.pagination.pageSize`)
   - Call `strapi.service("api::ad.ad").activeAds(options, true, null)` — passing `isManager: true` to bypass user filtering, and `userId: null` since no user context needed
   - This returns all active ads (active=true, banned=false, rejected=false, remaining_days>0) with pagination
   - Wrap in try/catch with `ctx.throw(500, error)` like the other methods
   - JSDoc: `@route GET /api/ads/catalog`

2. In `apps/strapi/src/api/ad/routes/00-ad-custom.ts`, add a new route entry BEFORE the `/ads/actives` route:
   ```
   {
     method: "GET",
     path: "/ads/catalog",
     handler: "ad.catalog",
     config: { auth: false },
   },
   ```
   The `config: { auth: false }` makes this public (no JWT required), matching the pattern used by `/ads/slug/:slug`.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace strapi build 2>&1 | tail -5</automated>
  </verify>
  <done>GET /api/ads/catalog route exists with auth:false, controller delegates to activeAds service with isManager=true and userId=null</done>
</task>

<task type="auto">
  <name>Task 2: Update website store and sitemap to use /ads/catalog</name>
  <files>apps/website/app/stores/ads.store.ts, apps/website/server/routes/sitemap.xml.ts</files>
  <action>
1. In `apps/website/app/stores/ads.store.ts` line 44, change:
   `const response = await client("ads/actives", {`
   to:
   `const response = await client("ads/catalog", {`

   Do NOT touch `apps/website/app/stores/user.store.ts` — it correctly uses `ads/actives` for the authenticated user's own ads.

2. In `apps/website/server/routes/sitemap.xml.ts` line 81, change:
   `` const adsRes = await fetch(`${apiUrl}/api/ads/actives`); ``
   to:
   `` const adsRes = await fetch(`${apiUrl}/api/ads/catalog`); ``
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx nuxi typecheck apps/website 2>&1 | tail -10</automated>
  </verify>
  <done>Website public ad listing calls /ads/catalog (public, no auth). User store still calls /ads/actives (authenticated, user-filtered). Sitemap fetches from /ads/catalog.</done>
</task>

</tasks>

<verification>
- Strapi builds without errors
- Website typechecks clean
- `grep -r "ads/actives" apps/website/` only shows hits in `user.store.ts` (authenticated usage), not in `ads.store.ts` or `sitemap.xml.ts`
- `grep -r "ads/catalog" apps/website/` shows hits in `ads.store.ts` and `sitemap.xml.ts`
</verification>

<success_criteria>
- Public GET /api/ads/catalog endpoint exists with `auth: false`, returning all active ads with pagination/sort/populate/filters support
- Website public pages (ad listing, sitemap) use /ads/catalog
- Authenticated user pages continue using /ads/actives unchanged
</success_criteria>

<output>
After completion, create `.planning/quick/260405-njc-add-ads-catalog-public-endpoint-for-acti/260405-njc-SUMMARY.md`
</output>
