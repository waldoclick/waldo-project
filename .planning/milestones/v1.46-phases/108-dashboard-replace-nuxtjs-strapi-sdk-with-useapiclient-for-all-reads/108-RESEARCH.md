# Phase 108: dashboard replace nuxtjs-strapi sdk with useApiClient for all reads - Research

**Researched:** 2026-03-29
**Domain:** Nuxt 4 / @nuxtjs/strapi SDK / useApiClient GET migration / dashboard read calls
**Confidence:** HIGH

## Summary

Phase 107 migrated all **mutating** calls (POST/PUT/DELETE) in the dashboard from `useStrapi()` and `useStrapiClient()` to `useApiClient()`. After that migration, 67 `strapi.find()` / `strapi.findOne()` calls remain spread across 29 components, 19 pages, and 1 store — all still using the `@nuxtjs/strapi` SDK for reads.

Phase 108 completes the migration: replace every remaining `strapi.find()` and `strapi.findOne()` call with `apiClient(url, { method: "GET", params: ... })`. The `useApiClient` composable already exists in the dashboard (`app/composables/useApiClient.ts`). No new composable is needed — only call-site changes.

**Three categories are explicitly OUT OF SCOPE:**
1. `useStrapiUser()` — session state provided by `@nuxtjs/strapi` auth system. The website still uses it everywhere. Keep as-is.
2. `useStrapiToken()` — used in `useImage.ts` for the `Authorization` header on raw `fetch()` uploads. Not a Strapi content API call. Keep as-is.
3. Auth read composables (`useStrapiAuth`, `useStrapiClient` inside `useApiClient`) — these are infrastructure, not content reads.

**Primary recommendation:** For each file containing `strapi.find()` or `strapi.findOne()`, replace those calls with the `apiClient` GET pattern, remove the `useStrapi()` instantiation if no other SDK calls remain in that file, and preserve the existing response-shape handling (`response.data`, `response.meta.pagination`).

---

## Standard Stack

### Core (already in place — nothing new to install)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `useApiClient` | in-repo | Unified HTTP client for all Strapi calls | Established in Phase 107; already in dashboard |
| `useStrapiClient` | via @nuxtjs/strapi v2 | Underlying HTTP client (used by useApiClient) | Do not call directly in components |
| `useStrapi` | via @nuxtjs/strapi v2 | SDK with find/findOne/create/update/delete | Being removed from content call-sites |
| `useStrapiUser` | via @nuxtjs/strapi v2 | Auth session user reactive ref | KEEP — not part of this migration |
| `useStrapiToken` | via @nuxtjs/strapi v2 | Auth token for raw fetch uploads | KEEP — not part of this migration |

**No new packages required.** This phase is purely call-site replacement.

---

## Architecture Patterns

### Pattern 1: `strapi.find()` → `apiClient GET` with `params`

`strapi.find(collection, queryParams)` maps to `apiClient(collection, { method: "GET", params: queryParams })`.

The `params` object is passed as URL query parameters. The response shape is identical — `useApiClient` delegates to `useStrapiClient` which uses `$fetch`, returning the raw Strapi JSON (`{ data: [...], meta: { pagination: {...} } }`).

```typescript
// BEFORE
const strapi = useStrapi();
const response = await strapi.find("orders", {
  pagination: { page: 1, pageSize: 20 },
  sort: "createdAt:desc",
  populate: ["user", "ad"],
} as Record<string, unknown>);
// response.data → Order[]
// response.meta?.pagination → pagination

// AFTER
const apiClient = useApiClient();
const response = await apiClient("orders", {
  method: "GET",
  params: {
    pagination: { page: 1, pageSize: 20 },
    sort: "createdAt:desc",
    populate: ["user", "ad"],
  } as unknown as Record<string, unknown>,
}) as { data: Order[]; meta: { pagination: Pagination } };
// response.data and response.meta unchanged — same shape
```

### Pattern 2: `strapi.findOne()` → `apiClient GET` with `/{id}` URL

`strapi.findOne(collection, id, queryParams)` maps to `apiClient(`${collection}/${id}`, { method: "GET", params: queryParams })`.

The response from `findOne` is `{ data: T }`. With `apiClient`, the response is also `{ data: T }` for standard content types.

```typescript
// BEFORE
const strapi = useStrapi();
const response = await strapi.findOne(
  "orders",
  id as string,
  { populate: { user: true, ad: true } } as Record<string, unknown>,
);
// response.data → Order

// AFTER
const apiClient = useApiClient();
const response = await apiClient(`orders/${id}`, {
  method: "GET",
  params: { populate: { user: true, ad: true } } as unknown as Record<string, unknown>,
}) as { data: Order };
// response.data → Order (same shape)
```

**Special case — `users/{id}` endpoint:** Strapi's `/users/:id` returns the user object directly, not wrapped in `{ data: T }`. Existing code handles this with a `normalizeUser()` helper — preserve that helper as-is, just change the fetch call.

```typescript
// BEFORE
const response = await strapi.findOne("users", id as string, { populate: {...} });
return normalizeUser(response);

// AFTER
const response = await apiClient(`users/${id}`, {
  method: "GET",
  params: { populate: {...} } as unknown as Record<string, unknown>,
});
return normalizeUser(response);
```

### Pattern 3: find-by-documentId lookup pattern (dual `find` + `findOne` fallback)

Many pages use this pattern to look up by `documentId` (Strapi v5 primary slug) with a numeric `id` fallback:

```typescript
// BEFORE
const response = await strapi.find("faqs", {
  filters: { documentId: { $eq: id } },
} as Record<string, unknown>);
const data = Array.isArray(response.data) ? response.data[0] : null;
if (data) return data;
const fallbackResponse = await strapi.findOne("faqs", id as string);
return (fallbackResponse.data as unknown) || null;

// AFTER
const apiClient = useApiClient();
const response = await apiClient("faqs", {
  method: "GET",
  params: { filters: { documentId: { $eq: id } } } as unknown as Record<string, unknown>,
}) as { data: Faq[] };
const data = Array.isArray(response.data) ? response.data[0] : null;
if (data) return data;
const fallback = await apiClient(`faqs/${id}`, { method: "GET" }) as { data: Faq };
return (fallback.data as unknown) || null;
```

This pattern repeats across all detail pages (faqs, regions, conditions, communes, categories, packs, articles). The find/findOne structure does not change — only the fetch mechanism changes.

### Pattern 4: `strapi.find()` inside `watch({ immediate: true })` (dashboard components)

Dashboard components use `watch({ immediate: true })` as the data-loading trigger (per CLAUDE.md). The replacement is straightforward — just swap the SDK call for `apiClient` inside the same watch callback.

```typescript
// Components initialize apiClient at setup scope (not inside watch):
const apiClient = useApiClient();

watch(someRef, async () => {
  const response = await apiClient("faqs", {
    method: "GET",
    params: searchParams,
  }) as { data: Faq[]; meta: { pagination: Pagination } };
  items.value = response.data ?? [];
  paginationMeta.value = response.meta?.pagination ?? null;
}, { immediate: true });
```

### Pattern 5: `me.store.ts` — `strapi.find("users/me")` → `apiClient GET`

The store already calls `useApiClient()` for the `saveUsername` mutation. The `loadMe` function still uses `strapi.find`. Replace it:

```typescript
// BEFORE (me.store.ts)
const strapi = useStrapi();
const response = await strapi.find("users/me", {
  populate: { commune: { populate: "region" } },
} as Record<string, unknown>);
me.value = response as unknown as Record<string, unknown>;

// AFTER (me.store.ts)
// Remove const strapi = useStrapi(); (line 7)
const response = await apiClient("users/me", {
  method: "GET",
  params: {
    populate: { commune: { populate: "region" } },
  } as unknown as Record<string, unknown>,
});
me.value = response as unknown as Record<string, unknown>;
```

After this change, `useStrapi` is no longer imported in `me.store.ts` and the import can be removed.

### Pattern 6: Response shapes that ARE already handled correctly

Several components already defensively unwrap responses with `Array.isArray(response) ? response : response.data ?? []`. These normalizations work identically with `apiClient` because the raw response shape is the same.

### Anti-Patterns to Avoid

- **Do NOT remove `useStrapiUser()`** — it is the auth session, not a content API call. Components like `HeaderDefault.vue`, `AvatarDefault.vue`, `HeroDashboard.vue`, `FormPassword.vue`, `FormVerifyCode.vue`, `DropdownUser.vue`, `FormEdit.vue`, middleware (`guard.global.ts`, `guest.ts`), and `sentry.ts` all use it correctly and must not be changed.
- **Do NOT remove `useStrapiToken()`** from `useImage.ts` — it is used for the `Authorization` header on raw `fetch()` file uploads, not a content API call.
- **Do NOT add `{ data: payload }` wrapping** on GET calls — only POST/PUT require body wrapping.
- **Do NOT call `useApiClient()` inside a watch callback or async function** — call it at setup scope and capture the returned function in a variable, then use that variable inside the callback.

---

## Complete Call-Site Inventory

### Files requiring migration (find/findOne reads only)

#### Stores (1 file)
| File | SDK calls to replace | Notes |
|------|---------------------|-------|
| `stores/me.store.ts` | `strapi.find("users/me", ...)` | Already has `apiClient`; remove `useStrapi()` after |

#### Components (29 files)
| File | SDK calls | Endpoint |
|------|-----------|---------|
| `AdsTable.vue` | `strapi.find(props.endpoint, ...)` | dynamic — ads/ads-pending/ads-approved/etc |
| `ArticlesDefault.vue` | `strapi.find("articles", ...)` | articles |
| `CategoriesDefault.vue` | `strapi.find("categories", ...)` x2 | categories + ad-user-counts |
| `ChartSales.vue` | `strapi.find(...)` | orders (stats endpoint) |
| `CommunesDefault.vue` | `strapi.find("communes", ...)` | communes |
| `ConditionsDefault.vue` | `strapi.find("conditions", ...)` | conditions |
| `DropdownPendings.vue` | `strapi.find("ads/pendings", ...)` | ads/pendings |
| `DropdownSales.vue` | `strapi.find("orders", ...)` | orders |
| `FaqsDefault.vue` | `strapi.find("faqs", ...)` | faqs |
| `FeaturedFree.vue` | `strapi.find(...)` | ad-featured-reservations |
| `FeaturedUsed.vue` | `strapi.find(...)` | ad-featured-reservations |
| `FormCategory.vue` | `strapi.find("categories", ...)` (lookup) | categories |
| `FormCommune.vue` | `strapi.find("regions", ...)` + `strapi.find("communes", ...)` | regions + communes |
| `FormCondition.vue` | `strapi.find("conditions", ...)` (lookup) | conditions |
| `FormFaq.vue` | `strapi.find("faqs", ...)` (lookup) | faqs |
| `FormGift.vue` | `strapi.find("users", ...)` | users |
| `FormPack.vue` | `strapi.find("ad-packs", ...)` (lookup) | ad-packs |
| `FormRegion.vue` | `strapi.find("regions", ...)` (lookup) | regions |
| `OrdersDefault.vue` | `strapi.find("orders", ...)` | orders |
| `PacksDefault.vue` | `strapi.find("ad-packs", ...)` | ad-packs |
| `RegionsDefault.vue` | `strapi.find("regions", ...)` | regions |
| `ReservationsFree.vue` | `strapi.find("ad-reservations", ...)` | ad-reservations |
| `ReservationsUsed.vue` | `strapi.find("ad-reservations", ...)` | ad-reservations |
| `StatisticsDefault.vue` | `strapi.find(...)` | stats endpoint |
| `StatsDefault.vue` | `strapi.find(...)` | stats endpoint |
| `UserAnnouncements.vue` | `strapi.find("ads", ...)` | ads |
| `UserFeatured.vue` | `strapi.find("ad-featured-reservations", ...)` | ad-featured-reservations |
| `UserReservations.vue` | `strapi.find("ad-reservations", ...)` | ad-reservations |
| `UsersDefault.vue` | `strapi.find("users", ...)` | users |

#### Pages (19 files)
| File | SDK calls | Notes |
|------|-----------|-------|
| `ads/[id].vue` | `strapi.findOne("ads", id, {...})` | In `onMounted` (not `useAsyncData`) |
| `articles/[id]/edit.vue` | `strapi.find` + `strapi.findOne` (find-by-docId pattern) | dual find+findOne |
| `articles/[id]/index.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `categories/[id]/edit.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `categories/[id]/index.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `communes/[id]/edit.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `communes/[id]/index.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `conditions/[id]/edit.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `conditions/[id]/index.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `faqs/[id]/edit.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `faqs/[id]/index.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `featured/[id].vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `orders/[id].vue` | `strapi.findOne("orders", id, {...})` | inside `useAsyncData` |
| `packs/[id]/edit.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `packs/[id]/index.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `regions/[id]/edit.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `regions/[id]/index.vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `reservations/[id].vue` | `strapi.find` + `strapi.findOne` | dual find+findOne |
| `users/[id].vue` | `strapi.findOne("users", id, {...})` | users endpoint — direct object, no `{ data: T }` wrapper |

### Files explicitly OUT OF SCOPE (do not touch)

| File | SDK usage | Reason |
|------|-----------|--------|
| `middleware/guard.global.ts` | `useStrapiUser()` | Auth session state — not a content read |
| `middleware/guest.ts` | `useStrapiUser()` | Auth session state |
| `plugins/sentry.ts` | `useStrapiUser()` | Auth session state |
| `components/HeaderDefault.vue` | `useStrapiUser()` | Auth session state |
| `components/HeroDashboard.vue` | `useStrapiUser()` | Auth session state |
| `components/AvatarDefault.vue` | `useStrapiUser()` | Auth session state |
| `components/DropdownUser.vue` | `useStrapiUser()` | Auth session state |
| `components/FormEdit.vue` | `useStrapiUser()` | Auth session state |
| `components/FormVerifyCode.vue` | `useStrapiUser()` | Auth session state |
| `components/FormPassword.vue` | `useStrapiUser()` | Auth session state |
| `composables/useImage.ts` | `useStrapiToken()` | Raw fetch upload — not a content API call |
| `components/UploadMedia.vue` | `useStrapiToken()` | Raw fetch upload |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GET with query params | Custom `$fetch` wrapper | `apiClient(url, { method: "GET", params: {...} })` | Already established; `useStrapiClient` handles serialization |
| Pagination response type | Re-typing pagination | Cast as `{ data: T[]; meta: { pagination: Pagination } }` | Existing pattern across all list components |
| findOne by documentId fallback | New helper function | Keep existing `find` + `findOne` dual pattern, just swap the fetch call | Same logic, different transport |

**Key insight:** The entire migration is a mechanical substitution. The response shapes, error handling, and business logic are all already correct — only the fetch mechanism changes from SDK to raw HTTP via `apiClient`.

---

## Common Pitfalls

### Pitfall 1: Passing query params in `body` instead of `params`
**What goes wrong:** `apiClient(url, { method: "GET", body: queryObject })` — GET requests must not have a body. Strapi ignores body on GET, returning unfiltered results.
**How to avoid:** Always use `params` (not `body`) for GET calls: `apiClient(url, { method: "GET", params: queryObject })`.
**Warning signs:** Pagination returns all records; filters have no effect.

### Pitfall 2: `useStrapi` import not removed after migration
**What goes wrong:** TypeScript may still pass (the import is unused but valid). However, it leaves a mixed-state file that partially depends on the SDK. Over time this creates confusion.
**How to avoid:** After replacing all `strapi.find()`/`strapi.findOne()` calls in a file, check whether `useStrapi()` is still called. If the only remaining SDK usage is `useStrapiUser()` or `useStrapiToken()`, the `useStrapi()` instantiation line and its `#imports` import can be removed. If any other SDK calls remain (e.g., a mutation that wasn't part of Phase 107), leave `useStrapi()`.
**Warning signs:** `const strapi = useStrapi()` line has no remaining usages — TypeScript will flag it as unused.

### Pitfall 3: `users/{id}` and `users/me` do NOT wrap response in `{ data: T }`
**What goes wrong:** Strapi's `/users/:id` and `/users/me` endpoints return the user object directly, not `{ data: user }`. Code that does `response.data` will get `undefined`.
**How to avoid:** Existing components already have normalizer functions (`normalizeUser`, `normalizeOrder`) or direct assignment for these endpoints. After migration, these normalizers still receive the same shape — no change needed. In `me.store.ts`, the existing `response as unknown as Record<string, unknown>` cast works correctly because `/users/me` returns the user object directly.
**Warning signs:** `user.value` is `undefined` after migration.

### Pitfall 4: `strapi.find()` called at component `setup` scope vs inside `useAsyncData` / `watch`
**What goes wrong:** Some pages (e.g., `ads/[id].vue`) call the SDK inside `onMounted` (not `useAsyncData`), while others (e.g., `orders/[id].vue`) call it inside `useAsyncData`. The migration pattern is the same for both — just swap the SDK call — but do not accidentally restructure the calling context.
**How to avoid:** Check where `strapi.find()`/`strapi.findOne()` is called in each file. Replace only the SDK call; preserve the surrounding `useAsyncData`, `watch`, or `onMounted` structure unchanged.
**Warning signs:** Data no longer loads on SSR (if `useAsyncData` was accidentally replaced with `onMounted`).

### Pitfall 5: `const strapi = useStrapi()` initialized inside `useAsyncData` callback
**What goes wrong:** In some pages (e.g., `faqs/[id]/index.vue`, `users/[id].vue`), `const strapi = useStrapi()` is called inside the `useAsyncData` callback. `useApiClient()` must be called at setup scope (outside the callback), not inside it — Nuxt composables must be called at the top level of `setup`.
**How to avoid:** Move `const apiClient = useApiClient()` to the component's setup scope (top level of `<script setup>`). Inside the `useAsyncData` callback, use the already-captured `apiClient` variable.
**Warning signs:** Nuxt warning "composable used outside of setup context".

### Pitfall 6: `UploadMedia.vue` and `useImage.ts` — do not remove `useStrapiToken`
**What goes wrong:** `UploadMedia.vue` calls `useStrapiToken()` to get the auth token for a raw `fetch()` POST to `/api/upload`. This is a file upload, not a Strapi content API call — it is not going through `useApiClient` and should remain unchanged.
**How to avoid:** Check if `useStrapiToken()` usage in a file is for a raw `fetch()` upload. If yes, leave it alone. Only replace `strapi.find()`/`strapi.findOne()` calls.

---

## Code Examples

### find with pagination and sort
```typescript
// Source: apps/website/app/stores/articles.store.ts (established GET pattern)
const apiClient = useApiClient();  // called at setup scope

const response = await apiClient("articles", {
  method: "GET",
  params: {
    pagination: { page: 1, pageSize: 12 },
    sort: ["createdAt:desc"],
    populate: "*",
  } as unknown as Record<string, unknown>,
}) as { data: Article[]; meta: { pagination: Pagination } };

items.value = response.data ?? [];
pagination.value = response.meta.pagination;
```

### find with filters
```typescript
// Source: apps/website/app/stores/user.store.ts (GET with filters)
const response = await apiClient("users", {
  method: "GET",
  params: {
    filters: { username: { $eq: slug } },
    populate: "*",
  } as unknown as Record<string, unknown>,
}) as { data: User[] } | User[];

// Handle both shapes (users endpoint is irregular)
const userList = Array.isArray(response) ? response : (response as { data: User[] }).data;
```

### findOne by id
```typescript
// Source: established by Phase 107 migration patterns
const apiClient = useApiClient();

const response = await apiClient(`orders/${id}`, {
  method: "GET",
  params: { populate: { user: true, ad: true } } as unknown as Record<string, unknown>,
}) as { data: Order };

return response.data;
```

### find-by-documentId + findOne fallback (pages pattern)
```typescript
// Source: observed in 12+ dashboard pages — dual pattern stays
const apiClient = useApiClient();  // at setup scope

// Inside useAsyncData callback:
const response = await apiClient("faqs", {
  method: "GET",
  params: { filters: { documentId: { $eq: id } } } as unknown as Record<string, unknown>,
}) as { data: Faq[] };
const data = Array.isArray(response.data) ? response.data[0] : null;
if (data) return data;

const fallback = await apiClient(`faqs/${id}`, { method: "GET" }) as { data: Faq };
return (fallback.data as unknown) || null;
```

### me.store.ts after migration
```typescript
// Remove: const strapi = useStrapi();
// Keep:   const apiClient = useApiClient();

const loadMe = async () => {
  try {
    const response = await apiClient("users/me", {
      method: "GET",
      params: {
        populate: { commune: { populate: "region" } },
      } as unknown as Record<string, unknown>,
    });
    me.value = response as unknown as Record<string, unknown>;
  } catch (_error) {
    console.error("Error loading user data:", _error);
  }
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useStrapi().find()` / `useStrapi().findOne()` for reads | `apiClient(url, { method: "GET", params: {...} })` | Phase 108 | Eliminates dual-resource pattern; all HTTP through one composable |
| Mutations via `useStrapi().create/update/delete()` | `apiClient(url, { method: "POST/PUT/DELETE", body: {...} })` | Phase 107 | Already done |
| `useStrapiUser()` for auth session | `useStrapiUser()` unchanged | N/A (never migrated) | Part of @nuxtjs/strapi auth — keep forever |

**Deprecated/outdated in dashboard after Phase 108:**
- `const strapi = useStrapi()` in all content-reading components/pages — replaced by `const apiClient = useApiClient()`
- `import { useStrapi } from "#imports"` in list-reading files — replaced by (auto-imported) `useApiClient`
- `import { useStrapi, useStrapiUser } from "#imports"` in files that need ONLY `useStrapiUser` — simplify import to remove `useStrapi`

---

## Open Questions

1. **`StatisticsDefault.vue` and `StatsDefault.vue` stat endpoints**
   - What we know: Both components call `strapi.find()` against what appears to be a custom stats endpoint. The exact endpoint path needs to be verified by reading those files.
   - What's unclear: Whether the endpoint returns a standard `{ data: T[], meta: {...} }` shape or a custom shape.
   - Recommendation: Read each file during planning to verify the endpoint and response cast. The migration pattern is the same regardless.

2. **`ChartSales.vue` endpoint**
   - Same situation as StatisticsDefault — custom chart data endpoint.
   - Recommendation: Read during planning; apply the same GET migration.

3. **Whether to add TypeScript generic to `apiClient<T>` calls**
   - What we know: The website pattern uses inline response casts (`as { data: T[] }`) rather than the generic form `apiClient<{ data: T[] }>()`.
   - Recommendation: Use the inline cast pattern (`as { data: T[] }`) consistently with existing website code. Apply `apiClient<{ data: T }>()` only when the TYPE declaration is needed at the call site (e.g., for complex inferred types). Consistency within the file is more important than uniformity across files.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + happy-dom |
| Config file | `apps/dashboard/vitest.config.ts` |
| Quick run command | `yarn workspace waldo-dashboard vitest run` |
| Full suite command | `yarn workspace waldo-dashboard vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RDR-108-01 | `apiClient` passes GET params as URL query params (not body) | unit | `yarn workspace waldo-dashboard vitest run tests/composables/useApiClient.test.ts` | YES (existing file) |
| RDR-108-02 | `apiClient` does NOT inject X-Recaptcha-Token on GET | unit | same file | YES (already tested in Phase 107) |
| RDR-108-03 | TypeScript compiles without errors after all useStrapi removals | typecheck | `yarn workspace waldo-dashboard nuxt typecheck` | N/A — build step |

### Sampling Rate
- **Per task commit:** `yarn workspace waldo-dashboard vitest run`
- **Per wave merge:** `yarn workspace waldo-dashboard vitest run`
- **Phase gate:** Full suite green + `nuxt typecheck` passes before `/gsd:verify-work`

### Wave 0 Gaps
None — the existing `tests/composables/useApiClient.test.ts` already covers GET behavior (RDR-108-01 and RDR-108-02 are already covered by existing GET test cases from Phase 107). No new test files required.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `apps/dashboard/app/composables/useApiClient.ts`
- Direct code inspection: all 29 dashboard components with `strapi.find()`/`strapi.findOne()` calls
- Direct code inspection: all 19 dashboard pages with `strapi.find()`/`strapi.findOne()` calls
- Direct code inspection: `apps/dashboard/app/stores/me.store.ts`
- Direct code inspection: `apps/website/app/stores/me.store.ts` (migration reference)
- Direct code inspection: `apps/website/app/stores/articles.store.ts` (GET pattern reference)
- Direct code inspection: `apps/website/app/stores/user.store.ts` (GET with filters reference)
- Direct code inspection: `apps/website/app/composables/usePacksList.ts` (GET with params reference)
- Direct code inspection: `apps/website/app/composables/useOrderById.ts` (findOne reference)
- Direct code inspection: `.planning/STATE.md` — Phase 107 key decisions
- Direct code inspection: `apps/dashboard/tests/stubs/imports.stub.ts` — test infrastructure

### Secondary (MEDIUM confidence)
- Phase 107 RESEARCH.md — established patterns from previous migration
- Phase 107 SUMMARY files — confirmed decisions carried forward

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no external dependencies; all code is in-repo
- Architecture: HIGH — GET pattern established and battle-tested in website; response shapes verified by direct code inspection
- Pitfalls: HIGH — derived from code structure and Phase 107 decisions carried forward
- Call-site inventory: HIGH — grepped 67 `strapi.find`/`strapi.findOne` calls across 49 files; out-of-scope files explicitly identified

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable — no external dependencies)
