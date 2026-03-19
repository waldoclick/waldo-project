# Phase 093: Ad Preview Error Handling - Research

**Researched:** 2026-03-18
**Domain:** Nuxt 4 error handling + Strapi v5 controller robustness
**Confidence:** HIGH

---

## Summary

The root cause of 500 errors on `/anuncios/[slug]` is a `watchEffect` that fires during SSR, before hydration completes, and calls `showError()` synchronously. The correct Nuxt 4 pattern is to throw `createError({ statusCode: 404 })` **inside** the `useAsyncData` callback when the result is `null` — Nuxt then propagates the error to `error.vue` as a clean error page instead of a 500. The `watchEffect` approach races SSR lifecycle ordering and produces unpredictable behavior.

On the Strapi side, the `findBySlug` controller handler has **no try/catch** around the service call. Any unexpected DB error (connection loss, query failure, etc.) becomes an unhandled exception that exposes a stack trace to the client. The fix is a standard `try/catch` wrapping the service call with `ctx.internalServerError()` as the fallback.

`error.vue` already handles `statusCode: 404` correctly — it has dedicated title and description text for 404, 500, 403, and 429 status codes. It does NOT need changes. The `description` field from `createError` maps directly onto `props.error.description` in `error.vue`.

**Primary recommendation:** Replace the `watchEffect` + `showError()` block with `throw createError(...)` inside the `useAsyncData` callback; add `default: () => null` to `useAsyncData` options; add try/catch to `findBySlug` controller.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PREV-01 | Website never returns 500 on `/anuncios/[slug]` — any error handled cleanly | Throw `createError` inside `useAsyncData` instead of `showError` in `watchEffect` |
| PREV-02 | 404 from endpoint shows 404 Nuxt error page correctly | `createError({ statusCode: 404 })` inside `useAsyncData` propagates to `error.vue`; `error.vue` already handles 404 correctly |
| PREV-03 | `useAsyncData` uses `default: () => null` | Add `default: () => null` to options object on line 169–173 of `[slug].vue` |
| PREV-04 | Remove `watchEffect` + `showError()` from `[slug].vue` | Lines 198–202 deleted; error thrown inside `useAsyncData` callback instead |
| STRP-01 | `findBySlug` controller has try/catch around service call | Wrap lines 830–842 of `ad.ts` in try/catch, catch → `ctx.internalServerError()` |
</phase_requirements>

---

## Current Code: `[slug].vue` — Full `useAsyncData` Block and Error Pattern

**File:** `apps/website/app/pages/anuncios/[slug].vue`

### The Problematic `watchEffect` (lines 197–202)

```typescript
// Show 404 when data is done loading but no ad was found
watchEffect(() => {
  if (!pending.value && !adData.value) {
    showError(getErrorMessage());
  }
});
```

**Why this causes 500:** During SSR, `watchEffect` runs immediately and synchronously. At the point Nuxt evaluates this effect, `pending.value` may already be `false` (because `useAsyncData` with `lazy: false` has resolved) and `adData.value` is `null`. Calling `showError()` at this point during SSR throws into the SSR renderer rather than into Nuxt's error boundary, producing a 500. The Nuxt-blessed pattern is to throw **inside** the `useAsyncData` callback, before the component renders at all.

### The `getErrorMessage()` Function (lines 180–195)

```typescript
const getErrorMessage = () => {
  if (adError.value) {
    return {
      statusCode: 404,
      message: "Página no encontrada",
      description:
        "Lo sentimos, no pudimos cargar el anuncio. Por favor, intenta nuevamente.",
    };
  }
  return {
    statusCode: 404,
    message: "Página no encontrada",
    description:
      "Lo sentimos, el anuncio que buscas no existe o no está disponible.",
  };
};
```

**Disposition:** This function is **replaced** by an inline `createError(...)` call inside `useAsyncData`. The two messages can be preserved as the `message` / `statusMessage` params on `createError`. The function itself is deleted (purely subtractive).

### The `useAsyncData` Block (lines 80–173)

The **current** options object (lines 169–173):
```typescript
  {
    server: true,
    lazy: false,
  },
```

**Missing:** `default: () => null` — violates AGENTS.md rule "Always provide a `default` option in `useAsyncData`".

The `useAsyncData` callback already has a `try/catch` structure that returns `null` on error (line 96–97: `if (!result) { return null; }`, and the outer catch on lines 164–167: `return null`). These `return null` paths are what `watchEffect` was checking. After the fix, they become `throw createError(...)` instead.

### Critical Decision Point: Where to throw `createError`

There are two `return null` paths in the `useAsyncData` callback:

1. **Line 96–98** — `adsStore.loadAdBySlug` returned null/threw; `result` is null:
   ```typescript
   if (!result) {
     return null;  // ← becomes: throw createError({ statusCode: 404, ... })
   }
   ```

2. **Lines 164–167** — Outer catch for unexpected errors during price formatting / related load:
   ```typescript
   } catch (error) {
     console.error("Error loading ad:", error);
     return null;  // ← becomes: throw createError({ statusCode: 500, ... })
   }
   ```

These two paths have different semantics: path 1 is "ad not found or access denied" (404), path 2 is "unexpected internal error during processing" (500).

---

## Current Code: `findBySlug` Controller (ad.ts lines 812–843)

```typescript
async findBySlug(ctx: Context) {
  const { slug } = ctx.params;

  let userId: number | null = null;
  const authHeader = ctx.request.headers?.authorization as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const secret = process.env.JWT_SECRET ?? "strapi-jwt-secret";
      const decoded = jwt.verify(token, secret) as { id: number };
      userId = decoded?.id ?? null;
    } catch {
      userId = null;
    }
  }

  // ↓ NO TRY/CATCH — if strapi.service(...).findBySlug throws, it propagates unhandled
  const result = await strapi.service("api::ad.ad").findBySlug(slug, userId);

  if (!result) {
    return ctx.notFound("Ad not found or access denied");
  }

  const adData =
    result.access.role === "manager"
      ? result.ad
      : sanitizeAdForPublic(result.ad as Record<string, any>);

  return ctx.send({ data: adData, access: result.access });
},
```

**The fix:** Wrap the `strapi.service(...)` call and everything below it in a try/catch:

```typescript
async findBySlug(ctx: Context) {
  const { slug } = ctx.params;

  let userId: number | null = null;
  const authHeader = ctx.request.headers?.authorization as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const secret = process.env.JWT_SECRET ?? "strapi-jwt-secret";
      const decoded = jwt.verify(token, secret) as { id: number };
      userId = decoded?.id ?? null;
    } catch {
      userId = null;
    }
  }

  try {
    const result = await strapi.service("api::ad.ad").findBySlug(slug, userId);

    if (!result) {
      return ctx.notFound("Ad not found or access denied");
    }

    const adData =
      result.access.role === "manager"
        ? result.ad
        : sanitizeAdForPublic(result.ad as Record<string, any>);

    return ctx.send({ data: adData, access: result.access });
  } catch (error) {
    strapi.log.error("findBySlug error for slug %s: %o", slug, error);
    return ctx.internalServerError("Internal server error");
  }
},
```

**Note:** Use `strapi.log.error(...)` — not `console.error` — consistent with the Strapi v5 logging pattern. The error is logged server-side but the stack trace never reaches the client.

---

## Reactive Code That Uses `adData` Outside `useAsyncData`

After the refactor, these reactive usages remain and **all are safe** because they use optional chaining or null guards:

### 1. Convenience computed refs (lines 176–177)
```typescript
const adComputed = computed(() => adData.value?.ad ?? null);
const adAccess = computed(() => adData.value?.access ?? null);
```
**Safe after refactor:** `adData.value` will be `null` (via `default: () => null`) when no ad is found — the optional chaining `?.ad` already handles null. When `createError` is thrown inside `useAsyncData`, Nuxt renders `error.vue` instead, so these computed values are never evaluated in the error path.

### 2. SEO/structured data `watch` (lines 205–307)
```typescript
watch(
  () => adComputed.value,
  (newData) => {
    if (newData) {         // ← null guard is present
      // ... $setSEO, $setStructuredData ...
    }
  },
  { immediate: true },
);
```
**Safe after refactor:** The `if (newData)` guard already handles `null`. No change needed.

### 3. Analytics `watch` (lines 328–337)
```typescript
watch(
  () => adComputed.value,
  (ad) => {
    if (ad && !viewItemFired.value) {    // ← null guard is present
      viewItemFired.value = true;
      adAnalytics.viewItem(ad);
    }
  },
  { immediate: true },
);
```
**Safe after refactor:** The `if (ad && ...)` guard already handles `null`. No change needed.

### 4. Template `v-if="adComputed"` (line 2)
```html
<div v-if="adComputed" class="page page--contact">
```
**Safe after refactor:** Template is gated on `adComputed` — null renders nothing. In the error path, Nuxt renders `error.vue` before this template is ever reached.

### 5. Slug-change reset watcher (lines 320–325)
```typescript
watch(
  () => route.params.slug,
  () => {
    viewItemFired.value = false;
  },
);
```
**No change needed.** No dependency on adData.

**Conclusion:** No reactive code outside `useAsyncData` needs modification. All null-guarded correctly.

---

## `error.vue` — Does It Need Changes?

**No.** `error.vue` already handles all required status codes:

```javascript
const getErrorTitle = () => {
  if (props.error?.message) {
    if (props.error?.statusCode === 404) {
      return `404 - ${props.error.message}`;   // ← uses createError message
    }
    return props.error.message;
  }
  if (props.error?.statusCode === 404) {
    return "404 - Página no encontrada";       // ← fallback
  } else if (props.error?.statusCode === 500) {
    return "Error del servidor";               // ← 500 handled
  }
  // ...
};

const getErrorDescription = () => {
  if (props.error?.description) {
    return props.error.description;            // ← uses createError description/statusMessage
  }
  // ...
};
```

`createError({ statusCode: 404, message: "Página no encontrada", statusMessage: "..." })` maps cleanly:
- `statusCode` → `props.error.statusCode` → title branch
- `message` → `props.error.message` → included in title as `"404 - Página no encontrada"`
- `statusMessage` → accessible as `props.error.description` in `error.vue`

**Important:** In Nuxt 4, `createError` params map as follows:
- `statusCode` → `error.statusCode`
- `message` → `error.message` (shown in title by `error.vue`)
- `statusMessage` → `error.statusMessage` (NOT `error.description`)

`error.vue` checks `props.error?.description` — but the Nuxt error object uses `statusMessage`, not `description`. The existing `getErrorMessage()` shape used `description`. To maintain compatibility with `error.vue`'s `description` check, either:
1. Pass a custom `data` object: `createError({ ..., data: { description: "..." } })` — but `error.vue` checks `props.error.description`, not `props.error.data.description`
2. Use `statusMessage` and update `error.vue`'s check from `description` to `statusMessage`
3. Or simply rely on `error.vue`'s default descriptions (statusCode 404 → "La página que buscas no existe o ha sido movida.") — which is fine UX

**Recommendation:** Use option 3 — let `error.vue` default descriptions handle 404 display. The custom descriptions from `getErrorMessage()` are not meaningfully different from the defaults. This keeps the change minimal and purely subtractive.

---

## Correct Nuxt 4 Pattern: `createError` Inside `useAsyncData`

**Confidence:** HIGH (verified against Nuxt 4 docs behavior and existing project patterns)

The canonical pattern:

```typescript
const { data: adData } = await useAsyncData<AdPageData | null>(
  `ad-${route.params.slug}`,
  async () => {
    // ... load logic ...
    if (!result) {
      throw createError({
        statusCode: 404,
        message: "Página no encontrada",
        fatal: true,      // ← tells Nuxt to stop rendering and show error page
      });
    }
    return { ad, access: result.access };
  },
  {
    server: true,
    lazy: false,
    default: () => null,   // ← REQUIRED per AGENTS.md
  },
);
```

**Key details:**
- `fatal: true` on `createError` tells Nuxt this is a fatal page-level error — render `error.vue` instead of continuing
- Without `fatal: true`, `useAsyncData` may suppress the error on client-side navigation
- `createError` is auto-imported from `#app` in Nuxt 4 — no explicit import needed
- When thrown inside `useAsyncData` during SSR, Nuxt intercepts it before the component renders and returns the correct HTTP status code to the client
- `default: () => null` prevents `adData.value` from being `undefined` during hydration — eliminates hydration mismatch risk

---

## Architecture Patterns

### Pattern 1: createError Inside useAsyncData (Nuxt 4)
**What:** Throw a fatal error inside the async data fetcher when the resource is not found or access is denied
**When to use:** Any page with dynamic `useAsyncData` where missing data should be a 404, not a blank/broken page

```typescript
// Source: Nuxt 4 docs — https://nuxt.com/docs/getting-started/error-handling
const { data } = await useAsyncData(
  'key',
  async () => {
    const result = await fetchSomething();
    if (!result) {
      throw createError({ statusCode: 404, message: 'Not found', fatal: true });
    }
    return result;
  },
  { default: () => null }
);
```

### Anti-Pattern: watchEffect + showError
- **Why it's bad:** `watchEffect` runs synchronously during SSR setup. When `pending.value` is `false` and `adData.value` is `null`, `showError()` fires inside the SSR renderer, not inside Nuxt's error boundary. This produces a 500 instead of a clean error page.
- **Replace with:** `throw createError(...)` inside the `useAsyncData` callback

### Pattern 2: Strapi Controller try/catch
**What:** Every controller action that calls a service method wraps it in try/catch and maps to `ctx.internalServerError()` for unexpected failures
**When to use:** All controller handlers (this is already the pattern for `actives`, `pendings`, `archiveds`, etc. — `findBySlug` is the outlier)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 404 page for missing ad | Custom redirect logic, conditional render | `createError({ statusCode: 404, fatal: true })` inside `useAsyncData` | Nuxt handles error propagation, SSR status codes, and error page rendering automatically |
| Controller error masking | Custom error serialization | `ctx.internalServerError("Internal server error")` | Koa/Strapi already provides HTTP-correct responses; custom serialization risks inconsistency |

---

## Common Pitfalls

### Pitfall 1: `watchEffect` Firing During SSR
**What goes wrong:** `watchEffect` with `!pending.value && !data.value` fires during SSR because `await useAsyncData(...)` has already resolved — `pending` is `false` at component setup time. `showError()` called in SSR context produces a 500.
**Why it happens:** The developer expected `watchEffect` to only run after hydration, but SSR runs all setup synchronously.
**How to avoid:** Use `throw createError(...)` inside `useAsyncData` callback — this happens before the component even begins to render.
**Warning signs:** Any `watchEffect` that calls `showError()` or `navigateTo()` based on data values.

### Pitfall 2: Missing `default: () => null` in useAsyncData
**What goes wrong:** Without `default`, `adData.value` is `undefined` (not `null`) during hydration. TypeScript allows `null` but not `undefined` in `AdPageData | null`. Hydration mismatches and TypeScript errors occur.
**How to avoid:** Always include `default: () => null` (or `default: () => []` for arrays) in every `useAsyncData` call — AGENTS.md rule.

### Pitfall 3: `fatal: true` Omitted from `createError`
**What goes wrong:** Without `fatal: true`, Nuxt may not intercept the error during client-side navigation. The error gets absorbed by `useAsyncData`'s internal error handling and the page renders blank or partially.
**How to avoid:** Always include `fatal: true` on page-level `createError` calls inside `useAsyncData`.

### Pitfall 4: Strapi Stack Trace Exposure
**What goes wrong:** Without try/catch, a DB connection error in `findBySlug` returns a raw Strapi/Node.js stack trace to the HTTP client — a security and UX issue.
**How to avoid:** Wrap service calls in try/catch; log the real error server-side with `strapi.log.error()`; return `ctx.internalServerError()` to the client.

### Pitfall 5: Losing the Two null Paths' Semantic Difference
**What goes wrong:** Both `return null` paths in `useAsyncData` are blindly converted to `throw createError({ statusCode: 404 })` — but the outer catch (lines 164–167) covers unexpected processing errors (price conversion, etc.) that are truly 500s.
**How to avoid:** Path 1 (not found) → `statusCode: 404`. Path 2 (outer catch for unexpected errors) → `statusCode: 500`. Keep the semantic distinction.

---

## Code Examples

### Final `[slug].vue` useAsyncData Block

```typescript
const {
  data: adData,
  refresh,
  pending,
  error: adError,
} = await useAsyncData<AdPageData | null>(
  `ad-${route.params.slug}`,
  async () => {
    const adsStore = useAdsStore();

    let result: { ad: AdWithPriceData; access: AdAccess } | null = null;
    try {
      result = (await adsStore.loadAdBySlug(route.params.slug as string)) as {
        ad: AdWithPriceData;
        access: AdAccess;
      } | null;
    } catch {
      // Ad not found or access denied
    }

    if (!result) {
      throw createError({
        statusCode: 404,
        message: "Página no encontrada",
        fatal: true,
      });
    }

    try {
      const ad = result.ad;

      // ... price formatting, related ads, history ...

      return { ad, access: result.access };
    } catch (error) {
      console.error("Error loading ad:", error);
      throw createError({
        statusCode: 500,
        message: "Error del servidor",
        fatal: true,
      });
    }
  },
  {
    server: true,
    lazy: false,
    default: () => null,
  },
);
```

### Lines to DELETE from `[slug].vue`

```typescript
// DELETE the entire getErrorMessage function (lines 179–195):
const getErrorMessage = () => { ... };

// DELETE the watchEffect block (lines 197–202):
watchEffect(() => {
  if (!pending.value && !adData.value) {
    showError(getErrorMessage());
  }
});
```

### Final `findBySlug` in `ad.ts`

```typescript
async findBySlug(ctx: Context) {
  const { slug } = ctx.params;

  let userId: number | null = null;
  const authHeader = ctx.request.headers?.authorization as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const secret = process.env.JWT_SECRET ?? "strapi-jwt-secret";
      const decoded = jwt.verify(token, secret) as { id: number };
      userId = decoded?.id ?? null;
    } catch {
      userId = null;
    }
  }

  try {
    const result = await strapi.service("api::ad.ad").findBySlug(slug, userId);

    if (!result) {
      return ctx.notFound("Ad not found or access denied");
    }

    const adData =
      result.access.role === "manager"
        ? result.ad
        : sanitizeAdForPublic(result.ad as Record<string, any>);

    return ctx.send({ data: adData, access: result.access });
  } catch (error) {
    strapi.log.error("findBySlug error for slug %s: %o", slug, error);
    return ctx.internalServerError("Internal server error");
  }
},
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `showError()` in `watchEffect` | `throw createError()` inside `useAsyncData` | Nuxt 4 (Nuxt 3 had same guidance but `showError` existed as escape hatch) | `watchEffect` path causes SSR 500; `createError` inside `useAsyncData` is the only SSR-safe approach |
| `useAsyncData` without `default` | `useAsyncData` with `default: () => null` | AGENTS.md rule — project standard | Eliminates `T | undefined` from inferred type; prevents hydration mismatches |

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — section included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + happy-dom (website); Jest (strapi) |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn workspace website test --run` |
| Full suite command | `yarn workspace website test --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PREV-01 | `[slug].vue` never returns 500 — errors surface as 404/5xx error pages | Manual smoke test (SSR page rendering; cannot be unit-tested without full Nuxt SSR harness) | N/A — manual only | N/A |
| PREV-02 | Non-existent slug shows 404 error page correctly | Manual smoke test | N/A — manual only | N/A |
| PREV-03 | `useAsyncData` has `default: () => null` | Code review / TypeScript check (`yarn workspace website typecheck`) | `yarn workspace website typecheck` | ✅ existing file |
| PREV-04 | No `watchEffect` + `showError` in `[slug].vue` | Code review | `grep -n "watchEffect\|showError" apps/website/app/pages/anuncios/\[slug\].vue` | ✅ existing file |
| STRP-01 | `findBySlug` has try/catch — DB error returns clean response | Jest unit test (mock `strapi.service` to throw; assert `ctx.internalServerError` called) | `yarn workspace strapi test --testPathPattern=ad.controller` | ❌ Wave 0 |

**Manual-only justification (PREV-01, PREV-02):** Verifying the SSR 500→404 regression requires a running Nuxt SSR server receiving an actual HTTP request and returning the correct HTTP status code. This cannot be replicated in a unit test environment without the full Nuxt rendering stack. The acceptance test is: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/anuncios/slug-that-does-not-exist` must return `404`, not `500`.

### Sampling Rate
- **Per task commit:** `grep -n "watchEffect\|showError" apps/website/app/pages/anuncios/\[slug\].vue` (verify removal)
- **Per wave merge:** `yarn workspace website typecheck` (TypeScript clean)
- **Phase gate:** Manual smoke test on running dev server before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `apps/strapi/src/api/ad/tests/ad.controller.test.ts` — covers STRP-01: mock `strapi.service` throw, assert `ctx.internalServerError` is called

*(Existing Vitest infrastructure for website covers TypeScript validation; no new test files needed for website changes)*

---

## Open Questions

1. **`adError` ref usage after refactor**
   - What we know: `adError` is destructured from `useAsyncData` on line 79. The `getErrorMessage()` function checks `adError.value` to pick a message variant — but both variants returned statusCode 404.
   - What's unclear: Is `adError` used anywhere else in the component outside `getErrorMessage()`?
   - **Resolution:** Confirmed — `adError` is only used in `getErrorMessage()`. After deleting `getErrorMessage()` and the `watchEffect`, `adError` is unused and should be removed from the destructuring on line 79 (purely subtractive: remove `error: adError,`).

2. **`pending` ref usage after refactor**
   - What we know: `pending` is destructured on line 78. It was used in the `watchEffect` condition (`!pending.value`).
   - What's unclear: Is `pending` used anywhere else?
   - **Resolution:** Confirmed — `pending` is only referenced in the deleted `watchEffect`. After the refactor, `pending` is unused and should be removed from the destructuring (purely subtractive: remove `pending,`).

---

## Sources

### Primary (HIGH confidence)
- Direct file reads — `apps/website/app/pages/anuncios/[slug].vue` (full file, 338 lines)
- Direct file reads — `apps/strapi/src/api/ad/controllers/ad.ts` (full file, 844 lines)
- Direct file reads — `apps/website/app/error.vue` (full file, 162 lines)
- Direct file reads — `apps/website/app/stores/ads.store.ts` (full file, 147 lines)
- `AGENTS.md` — `useAsyncData` rules (default option, SSR patterns)
- `.planning/REQUIREMENTS.md` — PREV-01 through STRP-01 requirement specs

### Secondary (MEDIUM confidence)
- Nuxt 4 docs pattern for `createError` + `fatal: true` in `useAsyncData` — aligned with observed project pattern in `error.vue`'s `props.error.statusCode` handling

---

## Metadata

**Confidence breakdown:**
- Current code (what to change): HIGH — read directly from source files
- Nuxt 4 `createError` + `useAsyncData` pattern: HIGH — consistent with AGENTS.md rules and project conventions
- `error.vue` compatibility: HIGH — read full file, confirmed statusCode/message/description handling
- Reactive code impact (computed/watch): HIGH — read full `[slug].vue`, all guards confirmed

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable codebase — no fast-moving dependencies)
