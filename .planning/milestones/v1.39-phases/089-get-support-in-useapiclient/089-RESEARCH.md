# Phase 089: GET Support in useApiClient - Research

**Researched:** 2026-03-15
**Domain:** Nuxt 4 composable extension — `useApiClient` HTTP method routing
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| API-05 | `useApiClient` supports GET requests (without reCAPTCHA injection) | Implementation already has GET passthrough (line 50); existing tests cover it; phase needs explicit GET tests + verification that existing POST/PUT/DELETE behaviour is unchanged |
</phase_requirements>

---

## Summary

`useApiClient` already contains a complete GET passthrough implementation. Line 50 of the current file (`return client<T>(url, options)`) executes for any method not in `MUTATING_METHODS = ["POST", "PUT", "DELETE"]`. The existing test file already contains two GET-related tests (lines 66-78) that verify no reCAPTCHA injection and no token when method is omitted. The code is correct as written — GET requests flow through cleanly to `useStrapiClient()` without touching the reCAPTCHA logic.

**The real work of this phase is clarification and hardening, not new logic.** Specifically:

1. The current function signature is `useApiClient()` (factory) → returns `apiClient(url, options)`. The success criteria notation `useApiClient('GET', '/api/filters')` is shorthand for `const client = useApiClient(); client('/api/filters', { method: 'GET' })` — **no API signature change is needed**.
2. The calling convention for GET requests with Strapi query params (filters, populate) uses `params` or `query` in `FetchOptions` (ofetch), passed as the second argument: `client('/api/filters', { method: 'GET', params: { populate: '*' } })`.
3. The existing two GET tests pass — the phase gate is confirming zero regressions (`typeCheck: true` + full Vitest suite green).

**Primary recommendation:** This phase requires adding explicit GET tests with query-param scenarios, then committing — the implementation itself is already correct.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@nuxtjs/strapi` | v2 | `useStrapiClient()` — the underlying HTTP client | Project standard; `useApiClient` wraps it |
| `ofetch` | (bundled with Nuxt) | HTTP fetch; `FetchOptions` type includes `params`/`query` for GET | Industry-standard fetch abstraction |
| Vitest | (website's `vitest.config.ts`) | Test runner with `vi.mock`, `vi.hoisted` | Project standard for website composables |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `#imports` | Nuxt virtual | `useStrapiClient`, `useNuxtApp` — must be explicitly imported | Required for Vitest `vi.mock()` interception (087-01 decision) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Keeping `(url, options)` call signature | Changing to `(method, url, options)` | Would break 20 existing call sites and all existing tests — not worth it for Phase 089 |

**Installation:** No new dependencies needed.

---

## Architecture Patterns

### Current useApiClient Shape

```
useApiClient() — factory composable, called at store/component setup level
└── returns apiClient(url, FetchOptions?) — async function
    ├── if method is POST/PUT/DELETE → execute reCAPTCHA → inject X-Recaptcha-Token header → call useStrapiClient
    └── else (GET, HEAD, or omitted) → passthrough directly to useStrapiClient
```

### Existing Call Sites (20 total)

All current callers follow this pattern (all mutations):

```typescript
// At store/component setup level (not inside functions — composable rule)
const client = useApiClient();

// Inside action:
const response = await client(`/api/endpoint`, {
  method: "PUT",
  body: { ... },
});
```

### GET Usage Pattern for Phase 090

Phase 090 will need GET calls like this (to replace `strapi.find()`):

```typescript
// Replacing: await strapi.find('filters', { populate: '*' })
const response = await client('/api/filters', {
  method: 'GET',
  params: {
    populate: '*',
    filters: { category: { $eq: 'cars' } },
  },
});
```

**Source:** `ofetch` `FetchOptions.params` / `FetchOptions.query` — both are `Record<string, any>` and serialize to query string. `params` is deprecated in favour of `query` per ofetch types (line 16-17 of `ofetch.BbrTaNPp.d.ts`).

### Recommended Project Structure

No structural changes — the composable file stays at:

```
apps/website/app/composables/useApiClient.ts     # no changes needed
apps/website/app/composables/useApiClient.test.ts # add GET+params tests
```

### Anti-Patterns to Avoid

- **Changing the factory signature to `useApiClient(method, url)`:** Would break all 20 existing call sites and contradict the `useStrapiClient`-compatible interface that Phase 090 depends on.
- **Re-reading `useApiClient` inside action functions:** Composable rules require calling `useApiClient()` at setup level (STATE.md 088-01: "client = useApiClient() moved to store root level").
- **Adding a new overload for GET-first params:** The `(url, FetchOptions)` order is already consistent with `useStrapiClient`'s own signature — keep it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Query string serialization | Custom URL builder for filters | `ofetch` `params`/`query` option | ofetch handles nested objects, arrays, and encoding |
| HTTP method dispatch | Custom switch/if chain | The existing `MUTATING_METHODS` set + array `.includes()` check | Already implemented; correct |
| Token injection | Re-implementing in a GET branch | Nothing — GET branch already skips all reCAPTCHA logic | |

**Key insight:** The implementation is already correct. The only gap is test coverage for GET-with-params scenarios and formal documentation of the `params` vs `query` convention for Phase 090.

---

## Common Pitfalls

### Pitfall 1: Assuming `params` is deprecated everywhere

**What goes wrong:** Developer sees `@deprecated use query instead` on `FetchOptions.params` and always uses `query`, but then finds some ofetch versions or Strapi SDK internals still use `params` internally.
**Why it happens:** `ofetch` marked `params` deprecated in favour of `query` but both work identically.
**How to avoid:** Use `params` for now (it's what existing Strapi SDK helpers emit); plan to standardise on `query` in Phase 090 migration.
**Warning signs:** TypeScript `@deprecated` squiggle in IDE — safe to use, not a runtime error.

### Pitfall 2: Calling `useApiClient()` inside an action function

**What goes wrong:** Runtime error — Nuxt composable called outside setup context.
**Why it happens:** `useStrapiClient()` internally uses Nuxt plugin context, which is only available at component/store setup time.
**How to avoid:** Always call `const client = useApiClient()` at the top of the store factory or `<script setup>` — **never** inside `async` action functions.
**Warning signs:** `[nuxt] A composable that requires access to the Nuxt instance was called outside...` console error.

### Pitfall 3: Expecting GET response to have `.data` wrapper

**What goes wrong:** `const response = await client('/api/ads', { method: 'GET' })` — caller then does `response.data[0]` and gets `undefined`.
**Why it happens:** `useStrapiClient` (unlike `strapi.find()`) returns the raw body — no `.data` wrapper.
**How to avoid:** Documented in STATE.md (088-01): "useApiClient returns raw body — no .data wrapper". GET responses will also be raw.
**Warning signs:** `Cannot read properties of undefined (reading '0')` errors after migrating `strapi.find()` calls.

### Pitfall 4: Confusing the factory call with the inner call

**What goes wrong:** Calling `await useApiClient()('/api/filters')` inline — works but violates composable rules.
**Why it happens:** The factory+returned-function pattern is unusual.
**How to avoid:** Always destructure: `const client = useApiClient()` at setup level; call `client(url, opts)` inside actions.

---

## Code Examples

Verified patterns from the existing codebase:

### GET call (no reCAPTCHA, raw body)

```typescript
// Source: apps/website/app/composables/useApiClient.ts — line 50
// For any method NOT in ["POST", "PUT", "DELETE"]:
return client<T>(url, options);

// Caller example (Phase 090 pattern):
const client = useApiClient();
const filters = await client<FilterResponse>('/api/filters', {
  method: 'GET',
  params: { populate: '*' },
});
```

### GET test pattern (source: useApiClient.test.ts lines 66-78)

```typescript
it("does NOT inject header on GET", async () => {
  const apiClient = useApiClient();
  await apiClient("/items", { method: "GET" });
  expect(mockExecute).not.toHaveBeenCalled();
  const callArgs = mockClient.mock.calls[0]?.[1];
  expect(callArgs?.headers?.["X-Recaptcha-Token"]).toBeUndefined();
});

it("defaults to GET when method is not specified", async () => {
  const apiClient = useApiClient();
  await apiClient("/items");
  expect(mockExecute).not.toHaveBeenCalled();
});
```

### New test: GET with query params passes through untouched

```typescript
// Pattern to add in useApiClient.test.ts:
it("passes params through on GET without modification", async () => {
  const apiClient = useApiClient();
  await apiClient("/api/ads", { method: "GET", params: { populate: "*", "pagination[pageSize]": 20 } });
  expect(mockExecute).not.toHaveBeenCalled();
  expect(mockClient).toHaveBeenCalledWith(
    "/api/ads",
    expect.objectContaining({ params: { populate: "*", "pagination[pageSize]": 20 } }),
  );
  const callArgs = mockClient.mock.calls[0]?.[1];
  expect(callArgs?.headers?.["X-Recaptcha-Token"]).toBeUndefined();
});
```

### Mutation call is unchanged (regression guard)

```typescript
// Source: useApiClient.test.ts lines 24-36 — POST still injects token
it("injects X-Recaptcha-Token on POST", async () => {
  const apiClient = useApiClient();
  await apiClient("/auth/local", { method: "POST", body: { foo: "bar" } });
  expect(mockExecute).toHaveBeenCalledWith("submit");
  expect(mockClient).toHaveBeenCalledWith(
    "/auth/local",
    expect.objectContaining({
      headers: expect.objectContaining({ "X-Recaptcha-Token": "test-token-abc" }),
    }),
  );
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useStrapiClient()` directly (no reCAPTCHA) | `useApiClient()` — mutation-aware wrapper | Phase 087 (087-01) | All POST/PUT/DELETE now get reCAPTCHA header |
| `strapi.find()` / `strapi.findOne()` (SDK) | `useApiClient()` with GET (Phase 089–090) | v1.39 | Unified API client, raw body, no `.data` wrapper |
| `vi.mock()` with inline variables | `vi.hoisted()` + `vi.mock()` factory | Phase 087 (087-01) | Required pattern for all `#imports` mocks |

**Deprecated/outdated:**
- `useStrapiClient()` called directly by components: superseded by `useApiClient()` (088-01)
- `strapi.find()` / `strapi.findOne()` for data fetching: being replaced in Phase 090

---

## Open Questions

1. **Does Phase 089 need any source code change, or just tests?**
   - What we know: Implementation is already correct (GET passthrough exists, two tests pass)
   - What's unclear: Whether the phase acceptance criteria literally means "add more tests" or "change something"
   - Recommendation: Planner should write a single plan — (1) add GET+params test, (2) run full suite, (3) run `nuxt typecheck`. If all pass with zero changes to `useApiClient.ts`, the phase is done. If typecheck reveals gaps, fix those.

2. **Should `params` or `query` be the standard for Phase 090 GET calls?**
   - What we know: `query` is the non-deprecated option; both work identically in ofetch
   - What's unclear: Whether strapi-specific serialization depends on `params`
   - Recommendation: Use `params` in Phase 089 tests to match how Strapi SDK serializes internally; document that Phase 090 should standardise on `query`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (via `vitest.config.ts`) |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn workspace website vitest run app/composables/useApiClient.test.ts` |
| Full suite command | `yarn workspace website vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| API-05 | GET request passes through without X-Recaptcha-Token | unit | `yarn workspace website vitest run app/composables/useApiClient.test.ts` | ✅ (2 tests exist: lines 66-78) |
| API-05 | GET request with `params` passes options through untouched | unit | `yarn workspace website vitest run app/composables/useApiClient.test.ts` | ❌ Wave 0 — needs new test |
| API-05 | POST still injects X-Recaptcha-Token (regression guard) | unit | `yarn workspace website vitest run app/composables/useApiClient.test.ts` | ✅ (line 24-36) |
| API-05 | `typeCheck: true` passes with zero errors | type-check | `yarn workspace website nuxt typecheck` | N/A — run as gate |

### Sampling Rate

- **Per task commit:** `yarn workspace website vitest run app/composables/useApiClient.test.ts`
- **Per wave merge:** `yarn workspace website vitest run`
- **Phase gate:** Full Vitest suite green + `yarn workspace website nuxt typecheck` exits 0 before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `apps/website/app/composables/useApiClient.test.ts` — add "GET with params passes through" test (new `it()` block, no new file)

*(All other infrastructure exists — no new files needed)*

---

## Sources

### Primary (HIGH confidence)

- `apps/website/app/composables/useApiClient.ts` — live implementation, read directly
- `apps/website/app/composables/useApiClient.test.ts` — existing test suite, read directly
- `node_modules/ofetch/dist/shared/ofetch.BbrTaNPp.d.ts` — `FetchOptions` type (`params`/`query` fields), read directly
- `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiClient.d.ts` — confirms `FetchOptions` passthrough
- `.planning/STATE.md` — decisions 087-01, 088-01 (calling conventions, vi.hoisted, raw body)
- `apps/website/vitest.config.ts` — test runner config, `#imports` alias

### Secondary (MEDIUM confidence)

- `.planning/REQUIREMENTS.md` — API-05 definition
- `.planning/ROADMAP.md` — Phase 089 success criteria

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**

- Implementation status: HIGH — read the actual source code; GET passthrough exists at line 50
- Test coverage status: HIGH — read test file; two GET tests exist, one new test needed
- Calling convention: HIGH — consistent with all 20 existing call sites across website stores/components
- `params` vs `query` recommendation: MEDIUM — ofetch types confirm both work; prefer `params` for compatibility

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable domain — `useApiClient` and `ofetch` APIs unlikely to change)
