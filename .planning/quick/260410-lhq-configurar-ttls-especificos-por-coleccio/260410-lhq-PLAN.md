---
phase: quick
plan: 260410-lhq
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/middlewares/cache.ts
autonomous: true
requirements: [configure-collection-ttls]
must_haves:
  truths:
    - "Mantenedores (categories, conditions, ad-packs, regions, communes, faqs, policies, terms) use 24h TTL"
    - "Ads catalog endpoint uses 1-minute TTL for freshness"
    - "Default TTL remains 4 hours for unspecified routes"
    - "Active invalidation still clears cache on PUT/POST/DELETE"
  artifacts:
    - path: "apps/strapi/src/middlewares/cache.ts"
      provides: "Collection-specific TTL configuration"
      contains: "CACHE_CONFIG"
  key_links:
    - from: "CACHE_CONFIG entries"
      to: "getCacheTTL function"
      via: "URL prefix matching with longest-match priority"
      pattern: "url.startsWith"
---

<objective>
Configure collection-specific TTLs in Redis cache middleware for dashboard mantenedores and ads.

Purpose: Mantenedores (master data) change very rarely and have active invalidation, so they benefit from long TTLs (24h). Ads/catalog change frequently and need short TTLs (1 min). This optimizes Redis usage and reduces unnecessary Strapi queries.

Output: Updated CACHE_CONFIG in cache.ts with per-collection TTL entries.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/strapi/src/middlewares/cache.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add collection-specific TTL entries to CACHE_CONFIG</name>
  <files>apps/strapi/src/middlewares/cache.ts</files>
  <action>
Update the CACHE_CONFIG object in cache.ts to uncomment and configure TTL entries for each collection.

Add TWO named constants above CACHE_CONFIG:
- `ONE_DAY = ONE_HOUR * 24` (86400 seconds)
- `ONE_MINUTE = 60`

Update CACHE_CONFIG with these entries (replace the commented-out block):

```typescript
const CACHE_CONFIG: Record<string, number> = {
  default: ONE_HOUR * 4,

  // Mantenedores — rarely change, active invalidation on edit
  "/api/categories": ONE_DAY,
  "/api/conditions": ONE_DAY,
  "/api/ad-packs": ONE_DAY,
  "/api/regions": ONE_DAY,
  "/api/communes": ONE_DAY,
  "/api/faqs": ONE_DAY,
  "/api/policies": ONE_DAY,
  "/api/terms": ONE_DAY,

  // High-traffic, frequently changing
  "/api/ads": ONE_MINUTE,

  // Analytics/indicators — moderate freshness
  "/api/indicators": ONE_HOUR,
};
```

Remove all the old commented-out lines (the `// "/api/connect": 1` block etc.).

Also add the explicit `Record<string, number>` type annotation to CACHE_CONFIG so TypeScript resolves the `matchingRoute` index correctly — the existing code indexes CACHE_CONFIG with a dynamic string key from Object.keys, which needs this type.

Do NOT modify any other part of the file — shouldNotCache, invalidateCollectionCache, and the middleware function remain unchanged.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx tsc --noEmit --project apps/strapi/tsconfig.json 2>&1 | head -20</automated>
  </verify>
  <done>
CACHE_CONFIG has entries for all 8 mantenedor collections at 24h, ads at 1 minute, indicators at 1 hour. Default remains 4 hours. TypeScript compiles clean. No other changes to the file.
  </done>
</task>

</tasks>

<verification>
- Verify CACHE_CONFIG has exactly 8 mantenedor entries + ads + indicators + default
- Verify getCacheTTL still works (longest prefix match logic unchanged)
- Verify shouldNotCache exclusions still apply (orders, users, auth, admin remain uncached)
- TypeScript compiles without errors
</verification>

<success_criteria>
- All mantenedor endpoints configured with 24h TTL
- Ads endpoint configured with 1-minute TTL
- Indicators endpoint configured with 1-hour TTL
- Default 4-hour TTL unchanged
- No functional changes to cache middleware logic
</success_criteria>

<output>
After completion, create `.planning/quick/260410-lhq-configurar-ttls-especificos-por-coleccio/260410-lhq-SUMMARY.md`
</output>
