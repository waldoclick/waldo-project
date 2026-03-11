---
phase: quick-13
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/pages/pagar/gracias.vue
  - apps/website/app/pages/anunciar/gracias.vue
autonomous: true
requirements: []

must_haves:
  truths:
    - "Navigating away from /pagar/gracias does NOT trigger a 404 error"
    - "Navigating away from /anunciar/gracias does NOT trigger a 404 error"
    - "Order/ad data still loads correctly on initial page visit"
  artifacts:
    - path: "apps/website/app/pages/pagar/gracias.vue"
      provides: "Static useAsyncData key 'pagar-gracias'"
    - path: "apps/website/app/pages/anunciar/gracias.vue"
      provides: "Static useAsyncData key 'anunciar-gracias'"
  key_links:
    - from: "useAsyncData key"
      to: "route.query.order / route.query.ad"
      via: "fetcher body (not the key)"
      pattern: "useAsyncData\\(\"[a-z-]+\","
---

<objective>
Fix phantom 404 errors triggered when navigating away from /pagar/gracias and /anunciar/gracias.

Purpose: Both pages use a function as the useAsyncData key, making it reactive. When the user navigates away, the route query clears, the key changes to e.g. "gracias-undefined", the fetcher re-runs with no documentId, returns `{ error: "INVALID_URL" }`, and watchEffect fires showError() — intercepting the outgoing navigation with a 404.

Output: Both keys become static strings. The fetcher runs once on arrival and never again on navigation.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Key rule from AGENTS.md: "useAsyncData keys must be unique per page: '<page>-<data>' for static pages" -->
<!-- A function key `() => \`gracias-${route.query.order}\`` makes useAsyncData REACTIVE in Nuxt 4. -->
<!-- A static string key runs the fetch exactly once — no re-trigger on route changes. -->
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix reactive useAsyncData keys in both gracias pages</name>
  <files>apps/website/app/pages/pagar/gracias.vue, apps/website/app/pages/anunciar/gracias.vue</files>
  <action>
Make two targeted one-line changes — nothing else.

**pagar/gracias.vue** — line 101:
Change:
```
  () => `gracias-${route.query.order}`,
```
To:
```
  "pagar-gracias",
```

**anunciar/gracias.vue** — line 43:
Change:
```
  () => `anunciar-gracias-${route.query.ad}`,
```
To:
```
  "anunciar-gracias",
```

Do NOT touch the fetcher body — `route.query.order` and `route.query.ad` are still read inside the async function and remain correct. Do NOT change watchEffect, error handling, computed values, or any other logic.
  </action>
  <verify>
    <automated>grep -n "useAsyncData" apps/website/app/pages/pagar/gracias.vue apps/website/app/pages/anunciar/gracias.vue</automated>
  </verify>
  <done>
    - pagar/gracias.vue: useAsyncData first arg is the string `"pagar-gracias"` (not a function)
    - anunciar/gracias.vue: useAsyncData first arg is the string `"anunciar-gracias"` (not a function)
    - No other lines changed in either file
  </done>
</task>

</tasks>

<verification>
After the fix, confirm:
1. `grep "() =>" apps/website/app/pages/pagar/gracias.vue apps/website/app/pages/anunciar/gracias.vue` — returns NO useAsyncData arrow-function keys
2. `grep '"pagar-gracias"' apps/website/app/pages/pagar/gracias.vue` — returns a match
3. `grep '"anunciar-gracias"' apps/website/app/pages/anunciar/gracias.vue` — returns a match
</verification>

<success_criteria>
- Both useAsyncData keys are static strings following AGENTS.md convention (`'<page>-<data>'`)
- Navigating away from either page no longer triggers showError() / 404
- Initial page load with valid query params still fetches and displays data correctly
</success_criteria>

<output>
After completion, create `.planning/quick/13-fix-404-error-triggered-when-leaving-pag/13-SUMMARY.md`
</output>
