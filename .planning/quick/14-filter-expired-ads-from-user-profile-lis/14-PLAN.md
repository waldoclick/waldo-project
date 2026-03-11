---
phase: quick-14
plan: 14
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/pages/[slug].vue
autonomous: true
requirements:
  - QUICK-14
must_haves:
  truths:
    - "Expired ads (remaining_days <= 0) do not appear in the user profile listing"
    - "Active, non-expired ads still appear normally in the user profile listing"
  artifacts:
    - path: "apps/website/app/pages/[slug].vue"
      provides: "Strapi query filter that excludes ads with remaining_days <= 0"
      contains: "remaining_days: { $gt: 0 }"
  key_links:
    - from: "apps/website/app/pages/[slug].vue"
      to: "Strapi ads collection"
      via: "adsStore.loadAds(filtersParams, ...)"
      pattern: "remaining_days.*\\$gt.*0"
---

<objective>
Expired ads are currently shown in the public user profile listing page (`/[slug]`). The fix is to add `remaining_days: { $gt: 0 }` to the Strapi filter query so ads where the expiration countdown has reached zero are excluded from results.

Purpose: Users browsing a seller's profile should only see active, valid listings — not expired ones.
Output: One-line filter addition in `[slug].vue` matching the pattern already used in `anuncios/index.vue` and `error.vue`.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<interfaces>
<!-- From apps/website/app/pages/[slug].vue (lines 101-109) -->
<!-- Current filter — missing remaining_days guard -->
```typescript
const paginationParams = { pageSize: 12, page: currentPage.value };
const sortParams = ["createdAt:desc"];
const filtersParams = {
  active: { $eq: true },
  user: { username: { $eq: username } },
};
await adsStore.loadAds(filtersParams, paginationParams, sortParams);
```

<!-- Pattern to follow — from apps/website/app/pages/anuncios/index.vue line 153+184 -->
```typescript
{ active: { $eq: true }, remaining_days: { $gt: 0 } }
```

<!-- Ad schema field (apps/strapi/src/api/ad/content-types/ad/schema.json) -->
<!-- remaining_days: integer, required, default 0 — decremented by cron job daily -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add remaining_days filter to user profile ads query</name>
  <files>apps/website/app/pages/[slug].vue</files>
  <action>
    In `apps/website/app/pages/[slug].vue`, add `remaining_days: { $gt: 0 }` to the `filtersParams` object (around line 103-106).

    Change from:
    ```typescript
    const filtersParams = {
      active: { $eq: true },
      user: { username: { $eq: username } },
    };
    ```

    Change to:
    ```typescript
    const filtersParams = {
      active: { $eq: true },
      remaining_days: { $gt: 0 },
      user: { username: { $eq: username } },
    };
    ```

    No other changes needed. This matches the exact pattern used in `anuncios/index.vue` (line 184) and `error.vue` (line 104). The `remaining_days` field is an integer in the Strapi schema; `$gt: 0` ensures ads with 0 or fewer remaining days are excluded.
  </action>
  <verify>
    <automated>yarn workspace website typecheck 2>&1 | grep -E "error TS|Found [0-9]+ error" | head -20 || echo "No TypeScript errors"</automated>
  </verify>
  <done>
    - `filtersParams` in `[slug].vue` contains `remaining_days: { $gt: 0 }`
    - TypeScript check passes with no new errors
    - User profile pages no longer return expired ads from Strapi
  </done>
</task>

</tasks>

<verification>
After the fix, a user profile page (`/[username]`) should only display ads where both `active === true` AND `remaining_days > 0`. This matches the filter pattern already used consistently across `anuncios/index.vue` and `error.vue`.

Manually verify: Visit a user profile page whose ads have expired (remaining_days = 0) — those ads should not appear. Active, non-expired ads should still be listed.
</verification>

<success_criteria>
- `remaining_days: { $gt: 0 }` filter is present in `[slug].vue` `filtersParams`
- No expired ads (remaining_days <= 0) are returned in the profile listing query
- TypeScript strict mode passes without new errors
- Pattern is consistent with the rest of the codebase
</success_criteria>

<output>
After completion, create `.planning/quick/14-filter-expired-ads-from-user-profile-lis/14-SUMMARY.md` following the summary template.
</output>
