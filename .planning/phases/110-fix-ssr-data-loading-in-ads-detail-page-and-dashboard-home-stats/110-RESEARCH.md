# Phase 110: Fix SSR Data Loading in Ads Detail Page and Dashboard Home Stats — Research

**Researched:** 2026-03-29
**Domain:** Nuxt 4 SSR data loading patterns, `useAsyncData` vs `onMounted`, `watch({ immediate: true })`
**Confidence:** HIGH

---

## Summary

Phase 110 fixes two concrete SSR data-loading violations found in the codebase after the Phase 109 migration. Both violate project coding rules defined in CLAUDE.md.

**Bug 1 — Dashboard home stats (`StatisticsDefault.vue` and `StatsDefault.vue`):** Both components call `apiClient()` inside `onMounted()`. This is a client-only lifecycle hook, meaning stats always render as zeros on the server. Since `ssr: true` in `nuxt.config.ts`, this causes a visible flash of zero-values on every page load and provides no SEO value from the stats. CLAUDE.md rule: `watch({ immediate: true }) is the sole data-loading trigger in dashboard components — never pair with onMounted`.

**Bug 2 — Website ads detail page (`apps/website/app/pages/anuncios/[slug].vue`):** The `useAdsStore` is instantiated inside the `useAsyncData` callback (`const adsStore = useAdsStore()` is inside the async function passed to `useAsyncData`). The `useAdsStore` constructor calls `useApiClient()` which calls `useSessionClient()`. In Nuxt SSR context, calling composables that depend on Nuxt context (like `useRuntimeConfig`) inside an async callback that executes after the synchronous setup phase can cause "Nuxt instance unavailable" errors or inconsistent behavior. The store should be created at setup scope, before `useAsyncData`, so it is available when the callback executes. CLAUDE.md rule: `useApiClient() must always be declared at setup scope, never inside watch/onMounted/fetch function callbacks`.

**Primary recommendation:** Move `useAdsStore()` instantiation to setup scope in `[slug].vue`. Replace `onMounted` with `watch({ immediate: true })` in `StatisticsDefault.vue` and `StatsDefault.vue`.

---

## Standard Stack

No new libraries are required. This phase uses only existing project infrastructure.

### Core (already installed)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Vue 3 Composition API | existing | `watch`, `ref`, `onMounted` | Replace `onMounted` with `watch` |
| Pinia | existing | Store instantiation | Move `useAdsStore()` to setup scope |
| `useAsyncData` (Nuxt) | existing | SSR data fetching in pages | Already used in `[slug].vue` |
| `useApiClient` (project) | existing | HTTP client wrapper | Already used in all components |

---

## Architecture Patterns

### Pattern 1: Dashboard Component Data Loading (watch + immediate)

CLAUDE.md mandates: `watch({ immediate: true }) is the sole data-loading trigger in dashboard components — never pair with onMounted`.

**Correct pattern (from `AdsTable.vue`):**
```typescript
// watch(immediate:true) is the only data-loading trigger — no onMounted
watch(
  [
    () => sectionSettings.value.searchTerm,
    // ...other reactive dependencies
  ],
  () => {
    fetchAds();
  },
  { immediate: true },
);
```

**Current broken pattern (in `StatisticsDefault.vue` and `StatsDefault.vue`):**
```typescript
// WRONG — onMounted is client-only, data never loads during SSR
onMounted(async () => {
  const res = await apiClient("indicators/dashboard-stats", { method: "GET" });
  // ...
});
```

**Fixed pattern for `StatisticsDefault.vue`:**
```typescript
import { ref, watch } from "vue";

const counts = ref({ /* ... */ });
const apiClient = useApiClient();
const countsLoading = ref(true);

// Trigger fires once immediately (SSR + client) and on any reactive dep changes
watch(
  () => true, // no reactive dep — single fire on mount equivalent
  async () => {
    try {
      countsLoading.value = true;
      const res = (await apiClient("indicators/dashboard-stats", {
        method: "GET",
      })) as { data: typeof counts.value };
      if (res.data) {
        counts.value = { /* ... */ };
      }
    } catch (error) {
      console.error("Error fetching statistics counts:", error);
    } finally {
      countsLoading.value = false;
    }
  },
  { immediate: true },
);
```

**Note:** A `watch(() => true, fn, { immediate: true })` is the canonical single-fire pattern when there are no reactive dependencies to watch. It fires once immediately in both SSR and client environments, unlike `onMounted` which is client-only.

### Pattern 2: Store Instantiation at Setup Scope (useAsyncData)

CLAUDE.md mandates: `useApiClient() must always be declared at setup scope, never inside watch/onMounted/fetch function callbacks`.

The same principle extends to Pinia stores: any store that calls composables in its constructor (e.g., `useAdsStore` calls `useApiClient()` which calls `useSessionClient()` which calls `useRuntimeConfig()`) must be instantiated at setup scope, not inside an `async` callback.

**Current broken pattern (in `anuncios/[slug].vue`):**
```typescript
const { data: adData } = await useAsyncData<AdPageData | null>(
  `ad-${route.params.slug}`,
  async () => {
    const adsStore = useAdsStore(); // WRONG — store created inside async callback
    // ...
  }
);
```

**Fixed pattern:**
```typescript
// Store instantiated at setup scope — before useAsyncData
const adsStore = useAdsStore();

const { data: adData } = await useAsyncData<AdPageData | null>(
  `ad-${route.params.slug}`,
  async () => {
    // adsStore captured from setup scope — composable context always valid
    const result = await adsStore.loadAdBySlug(route.params.slug as string);
    // ...
  }
);
```

### Existing Correct Reference (same file)

Other stores in `[slug].vue` are already correctly instantiated at setup scope:
```typescript
// These are correct — all at setup scope
const historyStore = useHistoryStore();
const relatedStore = useRelatedStore();
const indicatorStore = useIndicatorStore();
```

Only `useAdsStore()` is misplaced inside the callback.

### Recommended Project Structure

No structural changes required. This is a targeted bug fix within existing files:

```
apps/website/app/pages/anuncios/[slug].vue        # move useAdsStore() to setup scope
apps/dashboard/app/components/StatisticsDefault.vue  # replace onMounted with watch(immediate)
apps/dashboard/app/components/StatsDefault.vue       # replace onMounted with watch(immediate)
```

### Anti-Patterns to Avoid

- **`onMounted` for data loading in dashboard components:** Client-only hook — data never loads during SSR rendering. Use `watch({ immediate: true })` instead.
- **Store/composable instantiation inside `useAsyncData` callback:** The async callback may execute outside the synchronous Nuxt setup context. Any composable that internally calls `useRuntimeConfig`, `useCookie`, or other context-dependent Nuxt composables must be instantiated at setup scope.
- **Double-fetch via both `useAsyncData` + store-level fetch:** Already avoided in `[slug].vue` — `useAsyncData` is the sole trigger.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Single-fire watcher in component | Custom `onMounted` logic | `watch(() => true, fn, { immediate: true })` | Fires on both SSR and client; consistent with project pattern |
| SSR-safe data loading in pages | Manual `$fetch` calls | `useAsyncData` with setup-scope stores | Handles hydration, deduplication, server/client sync automatically |

---

## Common Pitfalls

### Pitfall 1: `onMounted` vs `watch({ immediate: true })` in SSR
**What goes wrong:** `onMounted` never fires during server-side rendering. Components render with empty/zero initial state, causing a layout shift when data loads on the client.
**Why it happens:** `onMounted` is a lifecycle hook that only executes in the browser DOM context. Nuxt SSR never mounts components in a traditional sense.
**How to avoid:** Use `watch(() => true, fetchFn, { immediate: true })` when there are no reactive dependencies. This fires synchronously during setup in both SSR and client contexts.
**Warning signs:** Stats or data appear as 0 or empty on first render, then flash to real values.

### Pitfall 2: Composable called outside Nuxt context
**What goes wrong:** `useRuntimeConfig()`, `useCookie()`, or other Nuxt-context composables fail with "Nuxt instance unavailable" when called inside an async callback that executes after setup completes.
**Why it happens:** Nuxt tracks the "current instance" during synchronous setup execution. Once the synchronous phase ends and async code executes later, the context is no longer active.
**How to avoid:** Always call stores and composables at the top level of `<script setup>`, before any `await` calls or async callbacks. Capture the returned value; use it inside async functions.
**Warning signs:** Runtime errors like "Nuxt instance unavailable" or unpredictable behavior in SSR vs client-only rendering.

### Pitfall 3: Removing `onMounted` import without removing the `import { onMounted }` statement
**What goes wrong:** TypeScript/ESLint unused import warning; potentially a lint error that blocks CI.
**How to avoid:** When replacing `onMounted` with `watch`, remove `onMounted` from the `import { ref, onMounted }` statement.

### Pitfall 4: `watch` source must be reactive
**What goes wrong:** `watch(true, fn, { immediate: true })` — passing a non-reactive literal directly (not as a getter function) will not work as a source.
**How to avoid:** Always use `() => true` (a getter function) as the source for a non-reactive single-fire watch, not the literal `true`.

---

## Code Examples

### Correct `watch(immediate)` single-fire pattern
```typescript
// Source: CLAUDE.md rule + AdsTable.vue reference implementation
import { ref, watch } from "vue";

const data = ref(null);
const apiClient = useApiClient();

// watch(immediate:true) is the only data-loading trigger — no onMounted
watch(
  () => true,
  async () => {
    try {
      const res = await apiClient("some/endpoint", { method: "GET" });
      data.value = res;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  { immediate: true },
);
```

### Correct setup-scope store instantiation with useAsyncData
```typescript
// Source: CLAUDE.md rule — composables at setup scope, not inside callbacks
const route = useRoute();
const adsStore = useAdsStore(); // setup scope — always valid

const { data: adData } = await useAsyncData(
  `ad-${route.params.slug}`,
  async () => {
    // adsStore is captured from setup scope above
    return adsStore.loadAdBySlug(route.params.slug as string);
  }
);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `onMounted` for data loading | `watch({ immediate: true })` | Phase 107-108 (dashboard migration) | Works in SSR; no hydration flash |
| Store instantiation in callbacks | Store at setup scope | Phase 108 (useApiClient setup-scope rule) | No "Nuxt instance unavailable" errors |

**Deprecated/outdated in this project:**
- `onMounted` for API fetches in dashboard components: replaced by `watch({ immediate: true })` per CLAUDE.md

---

## Open Questions

1. **Is the `useAdsStore` inside the callback causing observable runtime errors, or only theoretical risk?**
   - What we know: All other stores in `[slug].vue` are correctly at setup scope; only `useAdsStore` is inside the callback. The store constructor calls `useApiClient()` → `useSessionClient()` → `useRuntimeConfig()`.
   - What's unclear: Whether this has manifested as a production error or is latent risk.
   - Recommendation: Fix it regardless — it violates the established pattern and the risk is real in Nuxt's context model.

2. **Should `StatsDefault.vue` (economic indicators component) also be fixed?**
   - What we know: `StatsDefault.vue` uses `onMounted` in the same way as `StatisticsDefault.vue`. The phase description mentions "dashboard home stats" which maps to both components (both render on the dashboard home page via `StatisticsDefault.vue` wrapping `ChartSales` and the `StatsDefault.vue` shown in `HeroDashboard`).
   - Recommendation: Fix both components in the same plan to maintain consistency.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + happy-dom |
| Config file | `apps/dashboard/vitest.config.ts`, `apps/website/vitest.config.ts` |
| Quick run command | `yarn workspace waldo-dashboard vitest run` |
| Full suite command | `yarn workspace waldo-dashboard vitest run && yarn workspace waldo-website vitest run` |

### Phase Requirements → Test Map

These are bug fixes, not new behaviors with distinct requirement IDs. The behaviors to verify:

| Behavior | Test Type | Automated Command | Notes |
|----------|-----------|-------------------|-------|
| `StatisticsDefault.vue` no longer uses `onMounted` | unit (grep/lint) | `grep -r "onMounted" apps/dashboard/app/components/StatisticsDefault.vue` | Should return no output after fix |
| `StatsDefault.vue` no longer uses `onMounted` | unit (grep/lint) | `grep -r "onMounted" apps/dashboard/app/components/StatsDefault.vue` | Should return no output after fix |
| `[slug].vue` `useAdsStore` at setup scope | unit (grep/lint) | `grep -n "useAdsStore" apps/website/app/pages/anuncios/\[slug\].vue` | Should appear before `useAsyncData` |
| Existing tests pass | regression | `yarn workspace waldo-dashboard vitest run` | 55 tests must remain green |
| Existing website tests pass | regression | `yarn workspace waldo-website vitest run` | All website tests must remain green |

### Sampling Rate
- **Per task commit:** `yarn workspace waldo-dashboard vitest run`
- **Per wave merge:** `yarn workspace waldo-dashboard vitest run && yarn workspace waldo-website vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers regression testing. No new unit tests are required for these bug fixes (they are structural/pattern corrections verifiable by grep and type checking).

---

## Sources

### Primary (HIGH confidence)
- `CLAUDE.md` — `watch({ immediate: true }) is the sole data-loading trigger in dashboard components — never pair with onMounted`; `useApiClient() must always be declared at setup scope, never inside watch/onMounted/fetch function callbacks`
- `apps/dashboard/app/components/AdsTable.vue` — reference implementation using `watch({ immediate: true })` correctly
- `apps/dashboard/app/components/StatisticsDefault.vue` — current broken code (lines 142, 183: `onMounted`)
- `apps/dashboard/app/components/StatsDefault.vue` — current broken code (lines 24, 79: `onMounted`)
- `apps/website/app/pages/anuncios/[slug].vue` — current broken code (line 78: `useAdsStore()` inside async callback)
- `.planning/STATE.md` — "useApiClient() must always be declared at setup scope, never inside watch/onMounted/fetch function callbacks (108-01)"

### Secondary (MEDIUM confidence)
- Nuxt 4 documentation pattern: composables requiring Nuxt context must be called in synchronous setup phase — standard Nuxt limitation

---

## Metadata

**Confidence breakdown:**
- Bug identification: HIGH — code is directly readable, violations are unambiguous
- Fix approach: HIGH — CLAUDE.md prescribes exact patterns; `AdsTable.vue` provides reference implementation
- Test coverage: HIGH — existing vitest suites provide regression coverage

**Research date:** 2026-03-29
**Valid until:** stable (no third-party library changes required)
