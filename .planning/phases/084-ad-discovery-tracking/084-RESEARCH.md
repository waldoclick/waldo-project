# Phase 084: Ad Discovery Tracking — Research

**Researched:** 2026-03-14
**Domain:** GA4 analytics — discovery/browse events in Nuxt 4 / Vue 3
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DISC-01 | GA4 receives `view_item_list` event when user views `/anuncios` — includes item array with visible ads | New `viewItemListPublic()` function in `useAdAnalytics.ts`; wired via `watch(adsData)` in `anuncios/index.vue` |
| DISC-02 | GA4 receives `view_item` event when user views `/anuncios/[slug]` — includes `item_id`, `item_name`, `price`, `item_category` | New `viewItem()` function in `useAdAnalytics.ts`; wired via `watch(adData)` in `anuncios/[slug].vue` |
| DISC-03 | GA4 receives `search` event when user submits search or applies commune filter — includes `search_term` | New `search()` function in `useAdAnalytics.ts`; wired via `watch(route.query.s)` + `watch(route.query.commune)` in `anuncios/index.vue` |
</phase_requirements>

---

## Summary

Phase 084 wires three GA4 discovery events (`view_item_list`, `view_item`, `search`) to the public-facing ad browsing pages. All event logic follows the identical pattern established in Phase 083: new functions added to `useAdAnalytics.ts`, wired via `watch()` with fired-once guards in the relevant pages.

The primary complexity is **not** in the analytics pattern itself (already proven) but in correctly mapping ad data fields to GA4 item schema:
- `view_item_list` maps `adsData.ads[]` → `AnalyticsItem[]`
- `view_item` maps the single `adData` → one `AnalyticsItem` (with `documentId` as `item_id` — but `Ad` type has no `documentId` field yet; must use `ad.id.toString()`)
- `search` fires when `route.query.s` OR `route.query.commune` changes (two distinct triggers, one event)

The `search` event is the most nuanced: it must fire on both keyword search (from `SearchDefault.vue` → `route.query.s`) and commune filter selection (from `FilterResults.vue` → `route.query.commune`). Both are query-param-driven, so a single watcher in `anuncios/index.vue` handles both cleanly.

**Primary recommendation:** Add three functions to `useAdAnalytics.ts`, wire them in `anuncios/index.vue` and `anuncios/[slug].vue` via `watch()` with the same SSR-safe guard pattern from Phase 083.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `useAdAnalytics.ts` composable | existing | All GA4 events for this app | Project-established; all Phase 083 events live here |
| `window.dataLayer.push()` | GTM standard | Sends events to GA4 via GTM | Project standard — same `pushEvent()` internal wrapper |
| Vitest | ^3.2.4 | Unit tests for composable functions | Existing test suite; `useAdAnalytics.test.ts` has 17 tests |

### No New Dependencies
This phase requires zero new npm packages. All tooling is already installed.

**Installation:** *(none required)*

---

## Architecture Patterns

### Existing `pushEvent()` Pattern (established in Phase 083)
```typescript
// Source: apps/website/app/composables/useAdAnalytics.ts
const pushEvent = (
  eventName: string,
  items: AnalyticsItem[],
  extraData: Record<string, unknown> = {},
  flow = "ad_creation",
) => {
  if (typeof window === "undefined") return;  // SSR guard
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });  // Clear previous ecommerce data
  const eventData: DataLayerEvent = { event: eventName, flow, ...extraData };
  if (items.length > 0) { eventData.ecommerce = { items }; }
  window.dataLayer.push(eventData);
};
```
**Key rules:**
- Always guard `typeof window === "undefined"` for SSR safety
- Always push `{ ecommerce: null }` before any ecommerce event
- `flow` parameter identifies the user journey context

### Pattern: New Function in `useAdAnalytics.ts`

#### DISC-01 — `viewItemListPublic()`
```typescript
// New function for /anuncios page
const viewItemListPublic = (ads: Ad[]) => {
  const items: AnalyticsItem[] = ads.map((ad) => ({
    item_id: String(ad.id),
    item_name: ad.name,
    item_category: typeof ad.category === "object" && ad.category !== null
      ? (ad.category as Category).name
      : "Unknown",
    price: ad.price ?? 0,
    quantity: 1,
    currency: ad.currency ?? "CLP",
  }));
  pushEvent("view_item_list", items, {}, "ad_discovery");
};
```
**Notes:**
- `ad.category` is `number | Category` per `Ad` type — must handle both shapes
- Use `"ad_discovery"` as flow (new flow name for browse context; distinct from `"ad_creation"`)
- `ad.id` is a number — `String(ad.id)` converts to string for `item_id`

#### DISC-02 — `viewItem()`
```typescript
// New function for /anuncios/[slug] page
const viewItem = (ad: AdWithAnalyticsShape) => {
  const category = typeof ad.category === "object" && ad.category !== null
    ? (ad.category as { name: string }).name
    : "Unknown";
  pushEvent(
    "view_item",
    [{
      item_id: String(ad.id),
      item_name: ad.name,
      item_category: category,
      price: ad.price ?? 0,
      quantity: 1,
      currency: ad.currency ?? "CLP",
    }],
    {},
    "ad_discovery",
  );
};
```
**Notes:**
- `[slug].vue` uses a local `AdWithPriceData` interface that extends `Ad` — the function parameter can use a minimal shape or the exported interface
- `item_id` uses `ad.id.toString()` — the `Ad` type has no `documentId` field (only `User`, `Category`, `Commune` types have it in this project)

#### DISC-03 — `search()`
```typescript
// New function for search tracking
const search = (searchTerm: string) => {
  pushEvent("search", [], { search_term: searchTerm }, "ad_discovery");
};
```
**Notes:**
- GA4 `search` event is non-ecommerce — `items` array is empty, `search_term` is in `extraData`
- `search_term` must be the human-readable term (keyword text OR commune name)

### Pattern: Wiring in Pages with `watch()` + fired-once guard

#### `anuncios/index.vue` — Two triggers for DISC-01 and DISC-03

```typescript
// Wire in anuncios/index.vue (after existing useAsyncData calls)
import { useAdAnalytics } from "@/composables/useAdAnalytics";

const adAnalytics = useAdAnalytics();
const viewItemListFired = ref(false);

// DISC-01: fire view_item_list when ads load or filters change
watch(
  adsData,
  (data) => {
    if (data && data.ads.length > 0) {
      viewItemListFired.value = false; // reset on filter change (new list = new event)
      adAnalytics.viewItemListPublic(data.ads);
    }
  },
  { immediate: true },
);

// DISC-03: fire search when keyword or commune changes
const lastSearchTerm = ref<string | null>(null);

watch(
  [() => route.query.s, () => route.query.commune],
  ([newS, newCommune]) => {
    const term = newS?.toString() || newCommune?.toString() || null;
    if (term && term !== lastSearchTerm.value) {
      lastSearchTerm.value = term;
      adAnalytics.search(term);
    }
  },
);
```

**DISC-01 guard decision:** Unlike `purchase` (fires once per session), `view_item_list` should fire every time filters change (new list = new browse action). No `fired` guard needed — the watcher fires naturally on filter/page changes because `adsData` key changes.

**DISC-03 guard note:** The `lastSearchTerm` guard prevents double-fire if both `s` and `commune` change simultaneously. Fire once per distinct user action.

#### `anuncios/[slug].vue` — DISC-02

```typescript
// Wire in anuncios/[slug].vue (after existing watch for SEO)
import { useAdAnalytics } from "@/composables/useAdAnalytics";

const adAnalytics = useAdAnalytics();
const viewItemFired = ref(false);

watch(
  () => adData.value,
  (ad) => {
    if (ad && !viewItemFired.value) {
      viewItemFired.value = true;
      adAnalytics.viewItem(ad);
    }
  },
  { immediate: true },
);
```

**`viewItemFired` guard is necessary here** because navigating between ads loads different slugs — but the page component may not fully unmount between navigations (Nuxt router reuses components). `viewItemFired` must reset when slug changes. The existing `useAsyncData` key `ad-${route.params.slug}` already changes per ad, but the component instance persists. Reset guard on slug change:

```typescript
watch(
  () => route.params.slug,
  () => { viewItemFired.value = false; },
);
```

This satisfies Success Criterion 4: "navigating between multiple ads generates distinct `view_item` events."

### Pattern: `search_term` for commune filter (DISC-03)

The `FilterResults.vue` component writes `route.query.commune` as a commune **ID** (integer), not the name. The `search` event `search_term` should be human-readable. Two options:

1. **Use the commune ID as-is** — simple, consistent, but not human-readable in GA4
2. **Resolve the commune name** — look up `filterStore.filterCommunes` by ID, use `.name`

**Recommendation:** Use commune name from `filterStore.filterCommunes` when available, fall back to the ID string. This makes GA4 `search` reports readable. The filter store is already loaded on the page (`filterStore.loadFilterCommunes()` runs in `useAsyncData`).

```typescript
// In anuncios/index.vue watch handler for DISC-03
const resolveSearchTerm = (s?: string, communeId?: string): string | null => {
  if (s) return s;
  if (communeId) {
    const commune = filterStore.filterCommunes.find(
      (c) => c.id.toString() === communeId,
    );
    return commune?.name ?? communeId;
  }
  return null;
};
```

### Anti-Patterns to Avoid
- **Firing analytics in `onMounted`:** Pages use SSR; `onMounted` only runs on client. Use `watch(..., { immediate: true })` to catch SSR-hydrated data.
- **Double-watcher:** The `anuncios/index.vue` already has `useAsyncData` with watch options that auto-refresh on query param changes. Don't add a second redundant `watch` (commented-out example already in the file).
- **Using `??` for `item_id` fallbacks:** Project rule — use `||` where empty string should trigger fallback.
- **Firing `view_item` without slug reset guard:** Without resetting `viewItemFired` on slug change, navigating from ad A → ad B won't fire a second event.
- **Importing `Ad` type into composable functions:** `useAdAnalytics.ts` currently has no Nuxt/app type imports. Keep the function parameter typed with a minimal inline shape or the existing `AnalyticsItem` shape, not the full `Ad` type (avoids circular imports with the store layer).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GA4 event sending | Custom fetch to GA4 API | `window.dataLayer.push()` via existing `pushEvent()` | GTM handles the GA4 transport; direct API calls bypass consent mode |
| SSR-safety for analytics | Custom hydration detection | `typeof window === "undefined"` guard in `pushEvent()` | Already baked into all `pushEvent()` calls |
| Test mocking | Custom test helpers | Existing `mockDataLayer` + `vi.mock("@/stores/ad.store")` pattern | Tests/composables already set this up |

---

## Common Pitfalls

### Pitfall 1: `view_item` fires once across all ad navigations
**What goes wrong:** `viewItemFired = true` is set on first load and never reset. User navigates A→B→C, only A fires.
**Why it happens:** Component instance is reused across `[slug]` route changes in Nuxt.
**How to avoid:** Add `watch(() => route.params.slug, () => { viewItemFired.value = false; })` alongside the main analytics watcher.
**Warning signs:** GA4 Realtime shows `view_item` only on first detail page, not subsequent ones.

### Pitfall 2: `search` fires on every query-param change (double-fire)
**What goes wrong:** Both `s` and `commune` in the watch array — if a user types a keyword and also has a commune selected, the watcher fires twice when they submit.
**Why it happens:** Both query params update simultaneously in `handleSubmit()` of `SearchDefault.vue`.
**How to avoid:** Use a single `lastSearchTerm` ref as a deduplication guard; resolve priority (keyword > commune).
**Warning signs:** GA4 Realtime shows two `search` events for one user action.

### Pitfall 3: `view_item_list` items array is empty
**What goes wrong:** `adsData.ads` is `[]` on initial SSR, event fires with no items.
**Why it happens:** `default: () => ({...})` in `useAsyncData` starts with empty array; watcher fires immediately.
**How to avoid:** Guard `if (data && data.ads.length > 0)` before firing `viewItemListPublic()`.
**Warning signs:** GA4 shows `view_item_list` with empty `items` array.

### Pitfall 4: `ad.category` type narrowing
**What goes wrong:** `ad.category` is typed as `number | Category` — calling `.name` on a number throws at runtime.
**Why it happens:** `Ad` type in `ad.d.ts` line 43: `category: number | Category`.
**How to avoid:** Always narrow: `typeof ad.category === "object" && ad.category !== null ? ad.category.name : "Unknown"`.
**Warning signs:** TypeScript errors in composable, or `"Unknown"` appearing in GA4 for all items.

### Pitfall 5: SSR guard missing in new functions
**What goes wrong:** `viewItemListPublic()` or `viewItem()` called on server side, crashes because `window` is undefined.
**Why it happens:** All new functions ultimately call `pushEvent()` which has the guard — but only if not bypassed.
**How to avoid:** All new functions must route through `pushEvent()` (not call `window.dataLayer` directly). The guard is in `pushEvent()`, not in each public function.

---

## Code Examples

### Complete test pattern for new functions (mirrors Phase 083 style)

```typescript
// Source: apps/website/app/composables/useAdAnalytics.test.ts (Phase 083 pattern)

describe("useAdAnalytics - viewItemListPublic()", () => {
  it("pushes view_item_list event with mapped items", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { viewItemListPublic } = useAdAnalytics();

    const ads = [
      { id: 1, name: "Grúa Horquilla", price: 5000000, currency: "CLP",
        category: { id: 10, name: "Grúas", slug: "gruas" } },
    ];

    viewItemListPublic(ads as any);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "view_item_list",
    ) as Record<string, unknown> | undefined;
    expect(event).toBeDefined();
    expect(event?.flow).toBe("ad_discovery");
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    const items = ecommerce?.items as Record<string, unknown>[];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      item_id: "1",
      item_name: "Grúa Horquilla",
      item_category: "Grúas",
      price: 5000000,
    });
  });
});

describe("useAdAnalytics - viewItem()", () => {
  it("pushes view_item event with single item", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { viewItem } = useAdAnalytics();

    const ad = { id: 42, name: "Compresor Atlas", price: 1200000,
      currency: "CLP", category: { id: 5, name: "Compresores", slug: "compresores" } };

    viewItem(ad as any);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "view_item",
    ) as Record<string, unknown> | undefined;
    expect(event?.flow).toBe("ad_discovery");
    const items = (event?.ecommerce as any)?.items;
    expect(items[0]?.item_id).toBe("42");
    expect(items[0]?.item_name).toBe("Compresor Atlas");
  });
});

describe("useAdAnalytics - search()", () => {
  it("pushes search event with search_term and no items", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { search } = useAdAnalytics();

    search("grúa horquilla");

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "search",
    ) as Record<string, unknown> | undefined;
    expect(event?.search_term).toBe("grúa horquilla");
    expect(event?.flow).toBe("ad_discovery");
    expect(event?.ecommerce).toBeUndefined(); // no items → no ecommerce block
  });
});
```

---

## Key File Inventory

| File | Change | Purpose |
|------|--------|---------|
| `apps/website/app/composables/useAdAnalytics.ts` | Add 3 functions | `viewItemListPublic()`, `viewItem()`, `search()` — also add to return object |
| `apps/website/app/composables/useAdAnalytics.test.ts` | Add tests | Unit tests for all 3 new functions (≥ 6 new tests) |
| `apps/website/app/pages/anuncios/index.vue` | Add wiring | Import composable, wire DISC-01 + DISC-03 watchers |
| `apps/website/app/pages/anuncios/[slug].vue` | Add wiring | Import composable, wire DISC-02 watcher + slug reset guard |

**No new files need to be created.** All changes are additions to existing files.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Calling `window.dataLayer.push()` directly in pages | Route through `useAdAnalytics.pushEvent()` wrapper | SSR safety, event clearing, typed interface |
| `onMounted()` for analytics | `watch(..., { immediate: true })` | Works with SSR-rendered data without waiting for client mount |

---

## Open Questions

1. **`search_term` value for commune filter — ID or name?**
   - What we know: `FilterResults.vue` stores commune as an integer ID in `route.query.commune`; `filterStore.filterCommunes` has the name
   - What's unclear: GA4 `search` reports are more readable with names; but the name requires an extra lookup
   - Recommendation: Resolve name from `filterStore.filterCommunes` (already loaded in `useAsyncData`); fall back to ID string if not found

2. **`view_item_list` on empty-result pages**
   - What we know: When no ads match filters, `adsData.ads = []`; the "No hay anuncios" message shows
   - What's unclear: Should we fire `view_item_list` with an empty items array (valid GA4) or skip it?
   - Recommendation: Skip firing when `ads.length === 0` — a list with zero items has no discovery value for GA4 reports

3. **`Ad` type — `documentId` field absent**
   - What we know: `ad.d.ts` doesn't define `documentId`; Strapi v5 returns it but it's not typed
   - What's unclear: Should we cast or add `documentId?` to the `Ad` type?
   - Recommendation: Use `String(ad.id)` for `item_id` — the numeric `id` is stable and unambiguous. Adding `documentId` to `Ad` type is a separate concern not required by this phase.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest v3.2.4 |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn vitest run app/composables/useAdAnalytics.test.ts` (from `apps/website/`) |
| Full suite command | `yarn vitest run` (from `apps/website/`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DISC-01 | `viewItemListPublic()` maps ads → GA4 items array | unit | `yarn vitest run app/composables/useAdAnalytics.test.ts` | ✅ (new tests in existing file) |
| DISC-01 | `view_item_list` event uses `"ad_discovery"` flow | unit | same | ✅ |
| DISC-02 | `viewItem()` pushes single item with correct fields | unit | same | ✅ |
| DISC-02 | `view_item` fires distinct event per ad (slug reset guard) | manual | GA4 Realtime — navigate A→B | ❌ manual-only |
| DISC-03 | `search()` pushes `search_term` with no items block | unit | same | ✅ |
| DISC-03 | `search` fires on commune filter change | manual | GA4 Realtime — select commune | ❌ manual-only |

### Sampling Rate
- **Per task commit:** `yarn vitest run app/composables/useAdAnalytics.test.ts`
- **Per wave merge:** `yarn vitest run` (from `apps/website/`)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. New tests are additions to `useAdAnalytics.test.ts`, which already exists and runs.

---

## Sources

### Primary (HIGH confidence)
- Direct code reading: `apps/website/app/composables/useAdAnalytics.ts` — full function patterns confirmed
- Direct code reading: `apps/website/app/composables/useAdAnalytics.test.ts` — test patterns confirmed, 17 tests verified passing
- Direct code reading: `apps/website/app/pages/anuncios/index.vue` — `useAsyncData` + `watch` pattern, `route.query` structure
- Direct code reading: `apps/website/app/pages/anuncios/[slug].vue` — `adData` shape, existing `watch` for SEO
- Direct code reading: `apps/website/app/components/FilterResults.vue` — commune filter uses `router.push({ query: { commune: id } })`
- Direct code reading: `apps/website/app/components/SearchDefault.vue` — search uses `router.push({ query: { s: term } })`
- Direct code reading: `apps/website/app/pages/pagar/gracias.vue` — `watch(orderData, ..., { immediate: true })` + `purchaseFired` guard pattern (the canonical SSR-safe analytics pattern)
- Direct code reading: `apps/website/app/types/ad.d.ts` — `Ad` type, `category: number | Category`, no `documentId` field
- `.planning/STATE.md` — v1.38 key facts and accumulated decisions

### Secondary (MEDIUM confidence)
- GA4 standard event schema for `view_item_list`, `view_item`, `search` — well-documented; patterns match existing `purchase` implementation in this codebase

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing libraries, no new dependencies
- Architecture: HIGH — direct code reading of all target files; patterns proven in Phase 083
- Pitfalls: HIGH — identified from actual code structure (type narrowing, slug reset, SSR guard)
- Test strategy: HIGH — existing test file and pattern confirmed running

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable domain — no external dependencies changing)
