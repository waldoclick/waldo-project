---
phase: 54-fix-ad-detail-page-access-control-active
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/api/ad/routes/00-ad-custom.ts
  - apps/strapi/src/api/ad/services/ad.ts
  - apps/strapi/src/api/ad/controllers/ad.ts
  - apps/website/app/stores/ads.store.ts
  - apps/website/app/pages/anuncios/[slug].vue
autonomous: true
requirements: []

must_haves:
  truths:
    - "Public users can fetch an active ad by slug without a JWT"
    - "Authenticated owners can fetch their own pending/inactive ad by slug"
    - "Managers/Admins can fetch any ad by slug regardless of status"
    - "Non-owners without manager role receive 404 for non-active ads"
    - "[slug].vue uses a single store call — no fallback double-fetch"
  artifacts:
    - path: "apps/strapi/src/api/ad/routes/00-ad-custom.ts"
      provides: "GET /ads/slug/:slug route with auth: false"
    - path: "apps/strapi/src/api/ad/services/ad.ts"
      provides: "findBySlug(slug, userId?) access-control logic"
    - path: "apps/strapi/src/api/ad/controllers/ad.ts"
      provides: "findBySlug controller action"
    - path: "apps/website/app/stores/ads.store.ts"
      provides: "loadAdBySlug calling new endpoint, loadAdBySlugUnfiltered removed"
    - path: "apps/website/app/pages/anuncios/[slug].vue"
      provides: "Single-call useAsyncData, fallback block removed"
  key_links:
    - from: "apps/website/app/pages/anuncios/[slug].vue"
      to: "apps/website/app/stores/ads.store.ts"
      via: "adsStore.loadAdBySlug(slug)"
      pattern: "loadAdBySlug"
    - from: "apps/website/app/stores/ads.store.ts"
      to: "GET /api/ads/slug/:slug"
      via: "client(`ads/slug/${slug}`)"
      pattern: "ads/slug/"
    - from: "apps/strapi/src/api/ad/controllers/ad.ts"
      to: "apps/strapi/src/api/ad/services/ad.ts"
      via: "strapi.service('api::ad.ad').findBySlug(slug, userId)"
      pattern: "findBySlug"
---

<objective>
Replace the dual-fetch (active-only + unfiltered fallback) pattern on the ad detail page with a single secure Strapi endpoint that enforces access control server-side.

Purpose: Owners viewing their own pending ads, and managers reviewing any ad, currently require two round-trips and client-side ownership checks — a security anti-pattern. Moving the logic to Strapi makes it auditable, correct on SSR, and eliminates the fallback code path.

Output: `GET /api/ads/slug/:slug` endpoint with service-level ACL; simplified `[slug].vue` + `ads.store.ts`.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/strapi/src/api/ad/routes/00-ad-custom.ts
@apps/strapi/src/api/ad/services/ad.ts
@apps/strapi/src/api/ad/controllers/ad.ts
@apps/website/app/stores/ads.store.ts
@apps/website/app/pages/anuncios/[slug].vue

<interfaces>
<!-- Key patterns from existing code. Executor: use these directly. -->

From apps/strapi/src/api/ad/services/ad.ts:
```typescript
// computeAdStatus is a module-level function (not exported) — reuse directly inside the factory closure
function computeAdStatus(ad: unknown): AdStatus { ... }

// Service factory pattern — add findBySlug alongside existing methods:
export default factories.createCoreService("api::ad.ad", ({ strapi }) => ({
  async findOne(id, options) { ... },
  async activeAds(options) { ... },
  // ADD: async findBySlug(slug: string, userId?: number | null) { ... }
}));
```

From apps/strapi/src/api/ad/controllers/ad.ts:
```typescript
import { factories } from "@strapi/strapi";
import { Context } from "koa";

export default factories.createCoreController("api::ad.ad", ({ strapi }) => ({
  async findOne(ctx: Context) { ... },
  async actives(ctx: Context) { ... },
  // ADD: async findBySlug(ctx: Context) { ... }
}));
```

From apps/strapi/src/api/ad/routes/00-ad-custom.ts:
```typescript
export default {
  routes: [
    { method: "GET", path: "/ads/me/counts", handler: "ad.meCounts" },
    // ... existing routes ...
    // ADD before /:id routes:
    { method: "GET", path: "/ads/slug/:slug", handler: "ad.findBySlug", config: { auth: false } },
  ],
};
```

From apps/website/app/stores/ads.store.ts:
```typescript
// useApiClient pattern (established in 088-01):
const client = useApiClient();  // called at store root level, not inside actions
// Raw body: { data: T } for single-item endpoints
// Response typing: response as unknown as { data: Ad }
```

From apps/website/app/pages/anuncios/[slug].vue:
```typescript
// useAsyncData key format for dynamic routes:
await useAsyncData<AdWithPriceData | null>(`ad-${route.params.slug}`, async () => { ... })
// Store is instantiated inside the callback (SSR pattern):
const adsStore = useAdsStore();
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add findBySlug to Strapi service, controller, and route</name>
  <files>
    apps/strapi/src/api/ad/services/ad.ts,
    apps/strapi/src/api/ad/controllers/ad.ts,
    apps/strapi/src/api/ad/routes/00-ad-custom.ts
  </files>
  <action>
**1. `apps/strapi/src/api/ad/services/ad.ts`** — Add `findBySlug` method inside the `factories.createCoreService` factory object (after the existing `saveDraft` method):

```typescript
async findBySlug(slug: string, userId?: number | null) {
  const POPULATE = [
    "user",
    "commune",
    "category",
    "condition",
    "gallery",
    "ad_reservation",
    "ad_featured_reservation",
  ];

  const ad = await strapi.db.query("api::ad.ad").findOne({
    where: { slug },
    populate: POPULATE,
  });

  if (!ad) return null;

  const status = computeAdStatus(ad);

  // Active ads are public
  if (status === "active") return { ...ad, status };

  // Non-active: require authentication
  if (!userId) return null;

  // Owner access
  const adRecord = ad as Record<string, any>;
  if (adRecord.user?.id === userId) return { ...ad, status };

  // Manager/Admin access
  const user = await strapi.db
    .query("plugin::users-permissions.user")
    .findOne({ where: { id: userId }, populate: ["role"] });

  const userRecord = user as Record<string, any>;
  const roleName = userRecord?.role?.name as string | undefined;
  if (
    roleName === "Manager" ||
    roleName === "Admin" ||
    roleName === "Administrator"
  ) {
    return { ...ad, status };
  }

  return null;
},
```

Note: `computeAdStatus` is already defined at module scope — accessible from inside the factory closure without importing or exporting.

**2. `apps/strapi/src/api/ad/controllers/ad.ts`** — Add `findBySlug` controller action inside the `factories.createCoreController` factory object (after `deactivateAd`):

```typescript
/**
 * Get advertisement by slug with server-side access control.
 * Active ads are public. Pending/inactive: owner or manager only.
 *
 * @route GET /api/ads/slug/:slug
 */
async findBySlug(ctx: Context) {
  const { slug } = ctx.params;
  const userId = ctx.state.user?.id ?? null;

  const ad = await strapi.service("api::ad.ad").findBySlug(slug, userId);

  if (!ad) {
    return ctx.notFound("Ad not found or access denied");
  }

  return ctx.send({ data: ad });
},
```

**3. `apps/strapi/src/api/ad/routes/00-ad-custom.ts`** — Add the slug route to the `routes` array. Insert it before the `/:id` routes (i.e., after `/ads/save-draft` and before `/ads/:id/approve`) to prevent path conflicts:

```typescript
{
  method: "GET",
  path: "/ads/slug/:slug",
  handler: "ad.findBySlug",
  config: { auth: false },
},
```

`auth: false` lets unauthenticated users reach the endpoint. The service handles visibility — active ads are returned, non-active require a valid `ctx.state.user`.
  </action>
  <verify>
    <automated>cd apps/strapi && yarn ts-node --transpile-only -e "console.log('TS OK')" 2>&1 || yarn tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>
    - `findBySlug(slug, userId?)` method exists in the service factory
    - `findBySlug(ctx)` controller action exists
    - `GET /ads/slug/:slug` route with `config: { auth: false }` exists in `00-ad-custom.ts`
    - No TypeScript errors in the three modified files
  </done>
</task>

<task type="auto">
  <name>Task 2: Simplify ads.store.ts and [slug].vue to use the new endpoint</name>
  <files>
    apps/website/app/stores/ads.store.ts,
    apps/website/app/pages/anuncios/[slug].vue
  </files>
  <action>
**1. `apps/website/app/stores/ads.store.ts`** — Replace `loadAdBySlug` and remove `loadAdBySlugUnfiltered` entirely:

Replace the existing `loadAdBySlug` method (lines 59-99) with:
```typescript
const loadAdBySlug = async (slug: string): Promise<Ad> => {
  loading.value = true;
  error.value = null;

  try {
    const response = await client(`ads/slug/${slug}`, {
      method: "GET",
    });
    const typedResponse = response as unknown as { data: Ad };

    if (typedResponse.data) {
      return typedResponse.data;
    } else {
      throw new Error("Ad not found");
    }
  } catch (err) {
    error.value = "Error al cargar el anuncio";
    console.error("Error loading ad:", err);
    throw err;
  } finally {
    loading.value = false;
  }
};
```

Delete `loadAdBySlugUnfiltered` (lines 101-135) entirely — purely subtractive removal.

Update the `return` object: remove `loadAdBySlugUnfiltered` from the returned object.

**2. `apps/website/app/pages/anuncios/[slug].vue`** — Simplify the `useAsyncData` callback:

- Remove `import type { User } from "@/types/user"` (line 31) — no longer needed
- Replace the entire `useAsyncData` callback body with the simplified version below. The `let ad: AdWithPriceData | null = null; try { ... } catch { ... } if (!ad) { const strapiUser = ... }` block becomes a single call:

```typescript
const adsStore = useAdsStore();

let ad: AdWithPriceData | null = null;
try {
  ad = (await adsStore.loadAdBySlug(
    route.params.slug as string,
  )) as AdWithPriceData | null;
} catch {
  // Ad not found or access denied
}

try {
  if (!ad) {
    return null;
  }

  // Format original price and convert to alternate currency
  if (ad.price) {
    // ... price formatting block unchanged ...
  }

  // Only load related ads if the ad is active
  if (ad.status !== "review") {
    await relatedStore.loadRelatedAds(ad.id);
  }

  historyStore.addToHistory({
    id: ad.id,
    title: ad.title,
    slug: ad.slug,
    url: route.fullPath,
    price: ad.price,
    image: ad.gallery?.[0]?.url || "",
  });

  return ad;
} catch (error) {
  console.error("Error loading ad:", error);
  return null;
}
```

Keep all price formatting logic, related ads, history, SEO, analytics, and `watchEffect` untouched.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20</automated>
  </verify>
  <done>
    - `loadAdBySlugUnfiltered` no longer exists in `ads.store.ts` or its return object
    - `loadAdBySlug` calls `ads/slug/${slug}` via `useApiClient`
    - `[slug].vue` has no `import type { User }` and no fallback `loadAdBySlugUnfiltered` block
    - `useAsyncData` callback uses a single `loadAdBySlug` call
    - TypeScript reports no errors in the two modified files
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. `curl http://localhost:1337/api/ads/slug/some-active-slug` returns `{ data: { ... } }` with status 200 (no JWT needed)
2. `curl http://localhost:1337/api/ads/slug/some-pending-slug` returns 404 without JWT
3. Website: visiting `/anuncios/[active-slug]` loads correctly (public user)
4. Website: authenticated owner visiting their pending ad's slug sees the ad
5. No TypeScript errors in Strapi or website apps
</verification>

<success_criteria>
- `GET /api/ads/slug/:slug` exists and enforces: active=public, pending=owner or manager, else 404
- `ads.store.ts` exports only `loadAdBySlug` (not `loadAdBySlugUnfiltered`)
- `[slug].vue` `useAsyncData` has a single store call — no `useStrapiUser` fallback block
- `yarn nuxt typecheck` passes in `apps/website`
- Strapi compiles without TS errors
</success_criteria>

<output>
After completion, create `.planning/quick/54-fix-ad-detail-page-access-control-active/54-SUMMARY.md`
</output>
