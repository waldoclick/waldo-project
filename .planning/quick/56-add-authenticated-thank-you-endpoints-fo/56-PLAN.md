---
quick: 56
type: execute
autonomous: true
files_modified:
  - apps/strapi/src/api/ad/services/ad.ts
  - apps/strapi/src/api/ad/controllers/ad.ts
  - apps/strapi/src/api/ad/routes/00-ad-custom.ts
  - apps/strapi/src/api/payment/controllers/payment.ts
  - apps/strapi/src/api/payment/routes/payment.ts
  - apps/website/app/pages/anunciar/gracias.vue
  - apps/website/app/composables/useOrderById.ts

must_haves:
  truths:
    - "GET /api/ads/thankyou/:documentId returns 401 for unauthenticated requests"
    - "GET /api/ads/thankyou/:documentId returns 404 if ad doesn't belong to the authenticated user"
    - "GET /api/ads/thankyou/:documentId returns the ad (including pending, bypassing publishedAt) for the owner"
    - "GET /api/payments/thankyou/:documentId returns 401 for unauthenticated requests"
    - "GET /api/payments/thankyou/:documentId returns 403 if order doesn't belong to the authenticated user"
    - "GET /api/payments/thankyou/:documentId returns the order for the owner"
    - "/anunciar/gracias calls /ads/thankyou/:documentId instead of /ads/:documentId"
    - "/pagar/gracias calls /payments/thankyou/:documentId instead of /orders/:documentId"
  artifacts:
    - path: "apps/strapi/src/api/ad/services/ad.ts"
      provides: "findByDocumentIdForOwner service method"
      contains: "findByDocumentIdForOwner"
    - path: "apps/strapi/src/api/ad/controllers/ad.ts"
      provides: "thankyou controller action"
      contains: "thankyou"
    - path: "apps/strapi/src/api/ad/routes/00-ad-custom.ts"
      provides: "GET /ads/thankyou/:documentId route"
      contains: "/ads/thankyou/:documentId"
    - path: "apps/strapi/src/api/payment/controllers/payment.ts"
      provides: "thankyou controller action for orders"
      contains: "thankyou"
    - path: "apps/strapi/src/api/payment/routes/payment.ts"
      provides: "GET /payments/thankyou/:documentId route"
      contains: "/payments/thankyou/:documentId"
    - path: "apps/website/app/pages/anunciar/gracias.vue"
      provides: "calls ads/thankyou endpoint"
      contains: "ads/thankyou/"
    - path: "apps/website/app/composables/useOrderById.ts"
      provides: "calls payments/thankyou endpoint"
      contains: "payments/thankyou/"
  key_links:
    - from: "apps/website/app/pages/anunciar/gracias.vue"
      to: "/api/ads/thankyou/:documentId"
      via: "useApiClient"
    - from: "apps/website/app/composables/useOrderById.ts"
      to: "/api/payments/thankyou/:documentId"
      via: "useApiClient"
    - from: "apps/strapi/src/api/ad/controllers/ad.ts#thankyou"
      to: "strapi.service('api::ad.ad').findByDocumentIdForOwner"
      via: "service delegation"
    - from: "apps/strapi/src/api/payment/controllers/payment.ts#thankyou"
      to: "strapi.db.query('api::order.order').findOne"
      via: "direct db query (bypasses publishedAt)"
---

<objective>
Add two ownership-verified thank-you endpoints to Strapi, then point the website pages at them.

Currently `/anunciar/gracias` hits the core Strapi `GET /api/ads/:documentId` which applies the `publishedAt` filter — causing a 500 for pending ads in production. `/pagar/gracias` hits `GET /api/orders/:documentId` with no ownership check, letting any authenticated user read any order.

Purpose: Eliminate the pending-ad 500 crash and close the order read-access gap with a single consistent pattern.
Output: Two new Strapi endpoints (`GET /api/ads/thankyou/:documentId`, `GET /api/payments/thankyou/:documentId`) that require authentication and verify ownership, plus updated website callers.
</objective>

<context>
@apps/strapi/src/api/ad/services/ad.ts
@apps/strapi/src/api/ad/controllers/ad.ts
@apps/strapi/src/api/ad/routes/00-ad-custom.ts
@apps/strapi/src/api/payment/controllers/payment.ts
@apps/strapi/src/api/payment/routes/payment.ts
@apps/website/app/pages/anunciar/gracias.vue
@apps/website/app/composables/useOrderById.ts

<interfaces>
<!-- PaymentController uses a class-based pattern (not factories.createCoreController). -->
<!-- All controller methods are arrow functions assigned as class properties and wrapped with controllerWrapper. -->
<!-- The thankyou method must follow the same class-method pattern — arrow function assigned to class property. -->

From apps/strapi/src/api/ad/controllers/ad.ts:
- Uses factories.createCoreController("api::ad.ad", ({ strapi }) => ({ ... }))
- Each method is an async function inside the factory object
- Pattern for auth guard: `const userId = ctx.state.user?.id; if (!userId) return ctx.unauthorized();`
- strapi.service("api::ad.ad") calls service methods

From apps/strapi/src/api/ad/routes/00-ad-custom.ts:
- Routes without `config: { auth: false }` require authentication by default (Strapi JWT middleware)
- New thankyou route must go BEFORE the slug route (no auth:false needed — Strapi auth middleware handles it)
- The `/ads/slug/:slug` route has `config: { auth: false }` — note: thankyou must NOT have this

From apps/strapi/src/api/payment/controllers/payment.ts:
- Class-based: `class PaymentController { thankyou = this.controllerWrapper(async (ctx: Context) => { ... }) }`
- controllerWrapper catches errors and calls errorHandler (sets status 400 + body)
- Direct db query pattern: strapi.db.query("api::order.order").findOne({ where: { documentId }, populate: [...] })
- Ownership check: `(order as Record<string, any>).user?.id !== userId`

From apps/strapi/src/api/payment/routes/payment.ts:
- All routes use `config: { policies: [] }` — add thankyou route with same config
- Type `RouteConfig` is declared at top — new route must conform

From apps/website/app/composables/useOrderById.ts:
- useApiClient() is instantiated inside the function (factory pattern — composable rules)
- Raw body shape: response is `{ data: unknown }` — no change needed after URL swap
- Response access: `response.data` — same shape from new endpoint (`ctx.send({ data: order })`)

From apps/website/app/pages/anunciar/gracias.vue:
- useApiClient() called at setup root level (line 32: `const client = useApiClient()`)
- Response accessed as `response.data` (line 58)
- No populate param needed — new service method handles populate internally
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add ad service method + controller action + route for /ads/thankyou/:documentId</name>
  <files>
    apps/strapi/src/api/ad/services/ad.ts
    apps/strapi/src/api/ad/controllers/ad.ts
    apps/strapi/src/api/ad/routes/00-ad-custom.ts
  </files>
  <action>
**apps/strapi/src/api/ad/services/ad.ts** — Add `findByDocumentIdForOwner` as a new method inside the `factories.createCoreService` factory object (same level as existing methods like `activeAds`, `findBySlug`, etc.). The method uses `strapi.db.query` (NOT entityService) to bypass the `publishedAt` filter:

```typescript
async findByDocumentIdForOwner(documentId: string, userId: number) {
  const ad = await strapi.db.query("api::ad.ad").findOne({
    where: { documentId },
    populate: {
      user: true,
      commune: true,
      category: true,
      condition: true,
      gallery: true,
      ad_reservation: true,
      ad_featured_reservation: true,
    },
  });

  if (!ad) return null;

  const adRecord = ad as Record<string, any>;
  if (adRecord.user?.id !== userId) return null;

  return ad;
},
```

**apps/strapi/src/api/ad/controllers/ad.ts** — Add `thankyou` method at the end of the factory object (before the closing `})`):

```typescript
/**
 * Get ad by documentId for thank-you page (owner only).
 * Uses strapi.db.query to bypass publishedAt — pending ads are valid.
 * @route GET /api/ads/thankyou/:documentId
 */
async thankyou(ctx: Context) {
  const userId = ctx.state.user?.id;
  if (!userId) return ctx.unauthorized();

  const { documentId } = ctx.params;
  const ad = await strapi
    .service("api::ad.ad")
    .findByDocumentIdForOwner(documentId, userId);

  if (!ad) return ctx.notFound("Ad not found or access denied");

  return ctx.send({ data: ad });
},
```

**apps/strapi/src/api/ad/routes/00-ad-custom.ts** — Add the thankyou route BEFORE the `/ads/slug/:slug` entry (order matters — more specific static segments before `:slug`):

```typescript
{
  method: "GET",
  path: "/ads/thankyou/:documentId",
  handler: "ad.thankyou",
},
```

No `auth: false` — Strapi JWT middleware enforces authentication by default.

After completing all three files, run `cd apps/strapi && yarn build --no-optimization 2>&1 | tail -20` to catch TypeScript errors. Fix any type errors before proceeding.
  </action>
  <verify>
    <automated>cd apps/strapi && yarn tsc --noEmit 2>&1 | grep -E "error TS|ad\.ts|ad-custom" | head -20; echo "Exit: $?"</automated>
  </verify>
  <done>
    - `findByDocumentIdForOwner(documentId, userId)` method exists in ad service, uses `strapi.db.query` with `where: { documentId }`
    - `thankyou(ctx)` action exists in ad controller, guards with `if (!userId) return ctx.unauthorized()`
    - `/ads/thankyou/:documentId` route exists in 00-ad-custom.ts without `auth: false`
    - TypeScript compilation passes for Strapi
  </done>
</task>

<task type="auto">
  <name>Task 2: Add payment controller thankyou action + route for /payments/thankyou/:documentId</name>
  <files>
    apps/strapi/src/api/payment/controllers/payment.ts
    apps/strapi/src/api/payment/routes/payment.ts
  </files>
  <action>
**apps/strapi/src/api/payment/controllers/payment.ts** — Add `thankyou` as a class property (arrow function) inside `PaymentController`, following the same pattern as `adCreate`, `freeAdCreate`, etc. Add it after `proResponse`:

```typescript
thankyou = this.controllerWrapper(async (ctx: Context) => {
  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { success: false, message: "Unauthorized" };
    return;
  }

  const { documentId } = ctx.params;

  const order = await strapi.db.query("api::order.order").findOne({
    where: { documentId },
    populate: ["user", "ad"],
  });

  if (!order) {
    ctx.status = 404;
    ctx.body = { success: false, message: "Order not found" };
    return;
  }

  const orderRecord = order as Record<string, any>;
  if (orderRecord.user?.id !== userId) {
    ctx.status = 403;
    ctx.body = { success: false, message: "Access denied" };
    return;
  }

  ctx.body = { data: order };
});
```

Note: `controllerWrapper` already catches thrown errors and sets status 400. For 401/403/404, set `ctx.status` and `ctx.body` directly (not throwing) so controllerWrapper doesn't override the status.

**apps/strapi/src/api/payment/routes/payment.ts** — Add to the `routes` array (append before closing `]`):

```typescript
{
  method: "GET",
  path: "/payments/thankyou/:documentId",
  handler: "payment.thankyou",
  config: {
    policies: [],
  },
},
```

The `RouteConfig` type already exists at the top of the file — no type changes needed.

After completing both files, run TypeScript check to confirm no errors.
  </action>
  <verify>
    <automated>cd apps/strapi && yarn tsc --noEmit 2>&1 | grep -E "error TS|payment" | head -20; echo "Exit: $?"</automated>
  </verify>
  <done>
    - `thankyou` arrow function exists as a class property on `PaymentController`
    - Uses `strapi.db.query("api::order.order").findOne` with `where: { documentId }`
    - Ownership check: `orderRecord.user?.id !== userId` returns 403 (not 404) to avoid info leak
    - `/payments/thankyou/:documentId` route exists in payment.ts routes array with `config: { policies: [] }`
    - TypeScript compilation passes for Strapi
  </done>
</task>

<task type="auto">
  <name>Task 3: Update website callers to use the new thankyou endpoints</name>
  <files>
    apps/website/app/pages/anunciar/gracias.vue
    apps/website/app/composables/useOrderById.ts
  </files>
  <action>
**apps/website/app/pages/anunciar/gracias.vue** — Replace the `client()` call inside `useAsyncData`. Change:

```typescript
const response = (await client(`ads/${documentId}`, {
  method: "GET",
  params: { populate: "*" } as unknown as Record<string, unknown>,
})) as { data: Record<string, unknown> | null };
```

To:

```typescript
const response = (await client(`ads/thankyou/${documentId}`, {
  method: "GET",
})) as { data: Record<string, unknown> | null };
```

Remove the `params` option entirely — the new Strapi service method handles populate internally. The response shape `{ data: ... }` is unchanged so no other lines need modification.

**apps/website/app/composables/useOrderById.ts** — Replace the `client()` call. Change:

```typescript
const response = (await client(`orders/${documentId}`, {
  method: "GET",
  params: { populate: "*" } as unknown as Record<string, unknown>,
})) as { data: unknown };
```

To:

```typescript
const response = (await client(`payments/thankyou/${documentId}`, {
  method: "GET",
})) as { data: unknown };
```

Remove the `params` option — the new endpoint populates `["user", "ad"]` internally. The `response.data` accessor and the `if (!response.data)` guard are unchanged.

After editing both files, run the website TypeScript check:
`cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "ERROR|error TS" | head -20`
  </action>
  <verify>
    <automated>grep -n "ads/thankyou/" apps/website/app/pages/anunciar/gracias.vue && grep -n "payments/thankyou/" apps/website/app/composables/useOrderById.ts && echo "Both callers updated"</automated>
  </verify>
  <done>
    - `gracias.vue` calls `ads/thankyou/${documentId}` with no `params` option
    - `useOrderById.ts` calls `payments/thankyou/${documentId}` with no `params` option
    - Neither file has the old `orders/` or `ads/${documentId}` URL patterns
    - Website TypeScript compilation passes
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Two new Strapi endpoints with ownership enforcement:
    - GET /api/ads/thankyou/:documentId — returns the ad to its owner (bypasses publishedAt, pending ads work)
    - GET /api/payments/thankyou/:documentId — returns the order to its owner

    Website updated to call these endpoints:
    - /anunciar/gracias → ads/thankyou/:documentId
    - /pagar/gracias → payments/thankyou/:documentId (via useOrderById)

    IMPORTANT: After Strapi restarts, go to Strapi Admin → Settings → Users & Permissions → Authenticated role → Ad permissions → enable `thankyou`. Do the same for Payment permissions → enable `thankyou`. Without this, the endpoints will return 403 from the permissions layer even though the controller enforces auth.
  </what-built>
  <how-to-verify>
    1. Restart Strapi (`yarn dev` in apps/strapi)
    2. Enable permissions in Strapi Admin panel (see note above)
    3. Log into the website as a test user who has a pending ad
    4. Navigate to `/anunciar/gracias?ad={documentId}` — verify the summary page loads without 500
    5. Navigate to `/pagar/gracias?order={orderDocumentId}` — verify the order summary loads
    6. Test with a different authenticated user's documentId — verify 404 (ad) or 403 (order) is returned
  </how-to-verify>
  <resume-signal>Type "approved" or describe any issues</resume-signal>
</task>

</tasks>

<success_criteria>
- `/anunciar/gracias?ad={documentId}` loads correctly for pending ads (no more publishedAt 500)
- `/pagar/gracias?order={documentId}` loads correctly and is read-only to the owning user
- Any user attempting to read another user's ad/order via these endpoints gets 404 or 403
- Strapi TypeScript compilation passes (no `any` regressions beyond existing casts in the file)
- Website TypeScript compilation passes
</success_criteria>

<output>
After completion, create `.planning/quick/56-add-authenticated-thank-you-endpoints-fo/56-SUMMARY.md` with what was built, files changed, and any decisions made.
</output>
