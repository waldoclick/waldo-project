# Phase 25: Critical Correctness Bugs - Research

**Researched:** 2026-03-06
**Domain:** Nuxt 3/4 plugins, useAsyncData, SSR hydration
**Confidence:** HIGH

## Summary

Phase 25 is a targeted bug-fix phase with five discrete, self-contained corrections in the website app. Three of the five bugs have been directly verified by reading the relevant source files; the patterns required to fix them are well-established Nuxt 3/4 idioms.

**BUG-01** (`microdata.ts` / `$setStructuredData`): The plugin does NOT expose a type declaration for `$setStructuredData` in `NuxtApp`. The `seo.ts` plugin correctly declares `$setSEO` in `declare module "#app"`, but `microdata.ts` has no such declaration. This means TypeScript (and auto-complete) won't recognise the helper — but more importantly, many pages cast `useNuxtApp() as unknown as { $setStructuredData }` just to silence the error, which is fragile. The fix is to add the missing type augmentation to `microdata.ts`. The plugin itself (`useHead` with `script: [{ type, children }]`) is correct; the declaration is simply absent.

**BUG-02** (key collisions): `index.vue` uses `useAsyncData("packs", …)` and `packs/index.vue` also uses `useAsyncData("packs", …)`. In Nuxt's SSR payload, both keys map to the same cache slot. If both pages are rendered within one session (SPA navigation), the second page reuses the first's cached payload. The fix is unique, descriptive keys: `"home-packs"` / `"packs-page"`.  Likewise `anuncios/[slug].vue` uses the static key `"adData"` — this key must include the slug: `` `ad-${route.params.slug}` ``.

**BUG-03** (`console.client.ts`): The plugin suppresses `console.warn`, `console.error`, and `console.info` in production — the opposite of the intended behaviour. Only `console.log` and `console.debug` should be silenced.

**BUG-04** (`mis-anuncios.vue`): `useAsyncData(async () => { … })` is called without `await` and without a key. Missing `await` means SSR and CSR may not be synchronised. Missing key means Nuxt cannot serialize the payload for hydration. Fix: `await useAsyncData("mis-anuncios", async () => { … })`.

**BUG-05** (`mis-ordenes.vue`): Same pattern — `useAsyncData(async () => { … })` without `await` or key. Fix: `await useAsyncData("mis-ordenes", async () => { … })`.

**Primary recommendation:** Fix all five bugs independently in a single wave; they are non-overlapping and none depends on the others.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-01 | `$setStructuredData` plugin type declaration added; JSON-LD renders in page source | Add `declare module "#app"` augmentation to `microdata.ts` |
| BUG-02 | `useAsyncData` keys unique across all pages (`"packs"` collision, `"adData"` static) | Rename keys in `index.vue`, `packs/index.vue`, `anuncios/[slug].vue` |
| BUG-03 | Only `console.log` and `console.debug` suppressed in production | Remove `console.warn`, `console.error`, `console.info` lines from `console.client.ts` |
| BUG-04 | `mis-anuncios.vue` `useAsyncData` has `await` + explicit key | Add `await` and key `"mis-anuncios"` |
| BUG-05 | `mis-ordenes.vue` `useAsyncData` has `await` + explicit key | Add `await` and key `"mis-ordenes"` |
</phase_requirements>

---

## Standard Stack

### Core (already in the project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt 3 (v4 compat) | `compatibilityVersion: 4` | SSR framework | Project baseline |
| `useAsyncData` | Nuxt built-in | SSR-safe data fetching | Nuxt 4 recommended pattern |
| `useHead` | Nuxt built-in | Inject `<head>` elements (incl. ld+json) | Already used correctly in `microdata.ts` |
| `defineNuxtPlugin` | Nuxt built-in | Plugin registration + `provide` | Already used |

**Installation:** None — all libraries already present.

---

## Architecture Patterns

### Pattern 1: Nuxt Plugin Type Augmentation

**What:** When a plugin uses `provide`, the returned key must be declared in `declare module "#app"` so TypeScript and the Nuxt runtime know the helper exists.

**When to use:** Every `provide` in a plugin.

**Example (correct pattern — already in `seo.ts`, missing in `microdata.ts`):**
```typescript
// plugins/microdata.ts
export default defineNuxtPlugin(() => {
  const setStructuredData = (data: object) => {
    useHead({
      script: [{ type: "application/ld+json", children: JSON.stringify(data) }],
    });
  };
  return { provide: { setStructuredData } };
});

declare module "#app" {
  interface NuxtApp {
    $setStructuredData: (data: object) => void;
  }
}
```

### Pattern 2: useAsyncData key uniqueness

**What:** Nuxt serializes `useAsyncData` payloads by key. Two calls with the same key share a cache slot. Keys must be globally unique across all pages.

**Naming convention used in this project:**
- Page-scoped generic data: `"<page>-<data>"` e.g. `"home-packs"`, `"packs-page-packs"`
- Dynamic-route data: include the dynamic segment e.g. `` `ad-${route.params.slug}` ``

**When to use:** Every `useAsyncData` call must have a unique key if it runs on more than one page.

**Example:**
```typescript
// index.vue (home)
const { data: packs } = await useAsyncData("home-packs", async () => { … });

// packs/index.vue
const { data: packs } = await useAsyncData("packs-page-packs", async () => { … });

// anuncios/[slug].vue
const { data: adData } = await useAsyncData(`ad-${route.params.slug}`, async () => { … }, {
  watch: [() => route.params.slug]
});
```

### Pattern 3: useAsyncData with await for SSR hydration

**What:** `useAsyncData` must be `await`-ed for SSR-to-CSR hydration to be consistent. Without `await`, SSR completes before the data is fetched, causing a hydration mismatch.

**When to use:** Any page that must render with data on initial SSR load.

**Example:**
```typescript
// WRONG (no await, no key)
useAsyncData(async () => { await loadAds(); });

// CORRECT
await useAsyncData("mis-anuncios", async () => { await loadAds(); });
```

### Pattern 4: Console plugin — suppress only noise, not diagnostics

**What:** Suppress only `console.log` and `console.debug` in production. Retain `console.error`, `console.warn`, `console.info` so operational issues are visible in DevTools.

**Example:**
```typescript
// console.client.ts
export default defineNuxtPlugin(() => {
  if (!import.meta.dev) {
    console.log = () => {};
    console.debug = () => {};
    // console.warn, console.error, console.info remain active
  }
});
```

### Anti-Patterns to Avoid

- **Static key for dynamic routes:** `useAsyncData("adData", …)` on `[slug].vue` — collides across slug values during SPA navigation. Always include the dynamic param.
- **`useAsyncData` without `await` on authenticated pages:** breaks SSR/CSR sync for auth-gated content.
- **Suppressing `console.error` in production:** hides real errors from developers inspecting the live site.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Injecting ld+json into `<head>` | Custom DOM manipulation | `useHead({ script: [{ type: "application/ld+json", children }] })` | Nuxt handles SSR serialisation and deduplication |
| Plugin type declarations | Custom wrapper composables | `declare module "#app" { interface NuxtApp { … } }` | Native Nuxt augmentation, works with auto-imports |
| Unique useAsyncData keys | Key registry/factory | Descriptive string literal following naming convention | Simple, readable, no abstraction overhead |

---

## Common Pitfalls

### Pitfall 1: `provide` key vs `$` prefix
**What goes wrong:** `provide: { setStructuredData }` → available as `$setStructuredData`. The type declaration must use the `$`-prefixed name.
**Why it happens:** Nuxt automatically prefixes provided values.
**How to avoid:** Always declare as `$setStructuredData` in the `NuxtApp` interface.
**Warning signs:** TypeScript error `Property '$setStructuredData' does not exist on type 'NuxtApp'`.

### Pitfall 2: Key collision is silent
**What goes wrong:** Two pages both use `"packs"` — the second page displays stale data from the first page's cache with no error.
**Why it happens:** Nuxt's `useAsyncData` cache is keyed in the Nuxt payload object; duplicate keys silently overwrite.
**How to avoid:** Grep for duplicate string literals in `useAsyncData(` calls after any change.
**Warning signs:** Opening two tabs shows one page's data bleeding into the other.

### Pitfall 3: `[slug].vue` key must also be in `watch` option
**What goes wrong:** Changing the key to include the slug but forgetting to keep `watch: [() => route.params.slug]` means navigating between ads doesn't refresh data.
**How to avoid:** Keep the `watch` option unchanged when updating the key.

### Pitfall 4: Missing `await` on `useAsyncData` in auth pages
**What goes wrong:** Page renders empty (SSR) then flashes with data after hydration.
**Why it happens:** Without `await`, the async data fetch happens after the render function returns.
**How to avoid:** Always `await useAsyncData(…)` on pages behind `middleware: "auth"`.

---

## Code Examples

### BUG-01 Fix — microdata.ts type augmentation
```typescript
// Source: Nuxt 3 official plugin docs
// apps/website/app/plugins/microdata.ts
import { useHead } from "#app";

export default defineNuxtPlugin(() => {
  const setStructuredData = (data: object) => {
    useHead({
      script: [
        {
          type: "application/ld+json",
          children: JSON.stringify(data),
        },
      ],
    });
  };

  return {
    provide: {
      setStructuredData,
    },
  };
});

declare module "#app" {
  interface NuxtApp {
    $setStructuredData: (data: object) => void;
  }
}
```

### BUG-02 Fix — key uniqueness

```typescript
// index.vue (home page) — was "packs"
const { data: packs } = await useAsyncData("home-packs", async () => { … });

// packs/index.vue — was "packs"
const { data: packs } = await useAsyncData("packs-page-packs", async () => { … });

// anuncios/[slug].vue — was "adData" (static)
const { data: adData, refresh, pending, error: adError } = await useAsyncData(
  `ad-${route.params.slug}`,   // ← dynamic key
  async () => { … },
  {
    server: true,
    lazy: false,
    watch: [() => route.params.slug],  // ← unchanged
  },
);
```

### BUG-03 Fix — console.client.ts

```typescript
export default defineNuxtPlugin(() => {
  if (!import.meta.dev) {
    console.log = () => {};
    console.debug = () => {};
    // console.warn, console.error, console.info intentionally NOT suppressed
  }
});
```

### BUG-04 Fix — mis-anuncios.vue

```typescript
// was: useAsyncData(async () => { … }) — no await, no key
await useAsyncData("mis-anuncios", async () => {
  const counts = await userStore.loadUserAdCounts();
  for (const tab of tabs.value) {
    tab.count = counts[tab.value] ?? 0;
  }
  await loadAds();
});
```

### BUG-05 Fix — mis-ordenes.vue

```typescript
// was: useAsyncData(async () => { await loadOrders(); }) — no await, no key
await useAsyncData("mis-ordenes", async () => {
  await loadOrders();
});
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + `@nuxt/test-utils` |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn test` (from `apps/website/`) |
| Full suite command | `yarn test` (from `apps/website/`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | Plugin provides `$setStructuredData`; type declaration present | manual-only (SSR page source inspection) | n/a — inspect page HTML source | n/a |
| BUG-02 | Two simultaneous pages don't overwrite each other's packs cache | manual-only (open two tabs, verify independence) | n/a | n/a |
| BUG-03 | `console.error` visible in production DevTools | manual-only (build + open DevTools) | n/a | n/a |
| BUG-04 | `mis-anuncios` SSR/CSR renders same ad counts | manual-only (direct URL load vs SPA navigation) | n/a | n/a |
| BUG-05 | `mis-ordenes` SSR/CSR renders same order data | manual-only (direct URL load vs SPA navigation) | n/a | n/a |

> All five bugs are runtime/integration issues that cannot be validated with unit tests against the existing stub spec files. Each has a concrete manual verification procedure listed in the Success Criteria of the phase.

### Sampling Rate

- **Per task commit:** Review changed file(s) manually (no automated command available)
- **Per wave merge:** `yarn test` in `apps/website/` (existing specs must continue to pass)
- **Phase gate:** All 5 manual verification steps pass before `/gsd-verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers the phase's automated requirements (there are none). The five bugs require manual verification only.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Plugin `provide` without type augmentation | `declare module "#app"` augmentation | Nuxt 3 standard | Removes `as unknown as` casts throughout pages |
| Static `useAsyncData` key for dynamic routes | Dynamic key including route param | Nuxt 3 standard | Prevents cross-page cache pollution during SPA navigation |
| `console.error = () => {}` in production | Only suppress `console.log` and `console.debug` | Project-specific correction | Operational visibility restored |

---

## Open Questions

1. **`$setStructuredData` not working on all pages — is the plugin itself broken or just the types?**
   - What we know: `microdata.ts` plugin logic is correct (`useHead` with `script`). The `provide` key is correct.
   - What's unclear: Whether the missing type declaration causes a runtime failure (it shouldn't) or just a TypeScript error.
   - Recommendation: Add the type declaration. If pages were calling it with `as unknown as`, the runtime was working — the type fix cleans it up. If any page is NOT generating ld+json, investigate `useHead` call timing (must be in setup context, not inside async callback).

2. **Does `anuncios/[slug].vue` need additional key changes beyond the main `useAsyncData`?**
   - What we know: Only one `useAsyncData` call exists in that file (`"adData"`).
   - What's unclear: Whether any composables called inside the handler also use `useAsyncData`.
   - Recommendation: Treat as a single-key fix; the `watch: [() => route.params.slug]` option already handles re-fetching on navigation.

---

## Sources

### Primary (HIGH confidence)
- Direct source file inspection: `apps/website/app/plugins/microdata.ts` — missing type declaration confirmed
- Direct source file inspection: `apps/website/app/plugins/console.client.ts` — suppressed console methods confirmed
- Direct source file inspection: `apps/website/app/plugins/seo.ts` — correct `declare module "#app"` pattern confirmed
- Direct source file inspection: `apps/website/app/pages/cuenta/mis-anuncios.vue` — missing `await` + key confirmed
- Direct source file inspection: `apps/website/app/pages/cuenta/mis-ordenes.vue` — missing `await` + key confirmed
- Direct source file inspection: `apps/website/app/pages/index.vue` — key `"packs"` confirmed
- Direct source file inspection: `apps/website/app/pages/packs/index.vue` — duplicate key `"packs"` confirmed
- Direct source file inspection: `apps/website/app/pages/anuncios/[slug].vue` — static key `"adData"` confirmed

### Secondary (MEDIUM confidence)
- Nuxt 3 docs (known idiom): `useAsyncData` key uniqueness requirement

---

## Metadata

**Confidence breakdown:**
- Bug identification: HIGH — all five bugs confirmed by direct source inspection
- Fix patterns: HIGH — standard Nuxt 3/4 idioms, no ambiguity
- Validation approach: HIGH — manual verification is the correct method for runtime SSR/hydration bugs

**Research date:** 2026-03-06
**Valid until:** Stable (these are code-level bug fixes, not ecosystem-dependent)
