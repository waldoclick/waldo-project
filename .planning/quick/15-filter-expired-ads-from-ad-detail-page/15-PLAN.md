---
quick_task: 15
type: execute
autonomous: true
files_modified:
  - apps/website/app/stores/ads.store.ts

must_haves:
  truths:
    - "Visiting /anuncios/{slug} for an expired ad returns a 404 page"
    - "Visiting /anuncios/{slug} for an active ad continues to work normally"
  artifacts:
    - path: "apps/website/app/stores/ads.store.ts"
      provides: "loadAdBySlug with active + remaining_days filters"
      contains: "active: { $eq: true }"
  key_links:
    - from: "loadAdBySlug filters"
      to: "Strapi ads endpoint"
      via: "strapi.find with active.$eq and remaining_days.$gt filters"
      pattern: "active.*\\$eq.*true"
---

<objective>
Filter expired/inactive ads from the ad detail page so that visiting
/anuncios/{slug} for an expired ad results in a 404 rather than showing
the ad with a misleading "solo tú puedes verlo" warning.

Purpose: Public visitors must not be able to view expired or inactive ads.
Output: `loadAdBySlug` adds `active: { $eq: true }` and `remaining_days: { $gt: 0 }` to its Strapi filters. Expired ads return no results → "Ad not found" → existing `watchEffect` in `[slug].vue` triggers `showError` → 404.
</objective>

<context>
@apps/website/app/stores/ads.store.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add active and remaining_days filters to loadAdBySlug</name>
  <files>apps/website/app/stores/ads.store.ts</files>
  <action>
In `loadAdBySlug` (lines 55–88), extend the `filters` object passed to `strapi.find`
to include two additional conditions alongside the existing `slug` filter:

```typescript
filters: {
  slug: { $eq: slug },
  active: { $eq: true },
  remaining_days: { $gt: 0 },
},
```

No changes to `[slug].vue` are needed — the page already handles a null/missing ad
by calling `showError({ statusCode: 404, ... })` inside its `watchEffect` (lines 174-178),
which fires when `loadAdBySlug` throws "Ad not found" due to an empty result set.

This matches the pattern already used in the listing pages (anuncios/index.vue, error.vue)
and applied to the user profile [slug].vue in quick task 14.
  </action>
  <verify>
    <automated>yarn workspace website typecheck 2>&1 | grep -E "error TS|Found [1-9]" || echo "typecheck passed"</automated>
  </verify>
  <done>
    - `loadAdBySlug` filters include `active: { $eq: true }` and `remaining_days: { $gt: 0 }`
    - TypeScript check passes with no new errors
    - An expired ad (active: false or remaining_days: 0) visited at its URL returns 404
    - An active ad continues to load and display normally
  </done>
</task>

</tasks>

<verification>
After applying the fix, manually verify:
1. Visit /anuncios/{expired-slug} (e.g. /anuncios/jermaine-williamson) → should show 404
2. Visit /anuncios/{active-slug} → should show full ad detail page as before
</verification>

<success_criteria>
Expired/inactive ads are inaccessible at their direct URL. The filter change in
`loadAdBySlug` causes Strapi to return an empty result, which bubbles up as
"Ad not found", which the existing `watchEffect` converts to a 404 error page.
</success_criteria>
