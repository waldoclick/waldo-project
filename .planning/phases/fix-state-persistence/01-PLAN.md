---
phase: fix-state-persistence
plan: 01
wave: 1
depends_on: []
files_modified:
  - apps/website/app/stores/ad.store.ts
  - apps/website/app/pages/anunciar/resumen.vue
autonomous: true
requirements: []
must_haves:
  truths:
    - "State rehydrates on page reloads in `/anunciar/resumen`."
    - "Ad wizard data remains intact during navigation to `/pagar`."
  artifacts:
    - path: "apps/website/app/stores/ad.store.ts"
      provides: "Persistent and resilient state management for ad creation flow."
    - path: "apps/website/app/pages/anunciar/resumen.vue"
      provides: "Safe rendering logic using the rehydrated state."
  key_links:
    - from: "apps/website/app/stores/ad.store.ts"
      to: "apps/website/app/pages/anunciar/resumen.vue"
      via: "Reactive property access with proper hydration checks."
---

<objective>
Fix the issue of state loss in the `/anunciar/resumen` page by ensuring proper persistence and rehydration of the ad data managed by Pinia's ad store. 

Purpose: Prevent user frustration caused by data loss during ad confirmation stages.
Output: Enhanced state persistence logic and safety checks for consumption in `/resumen`.
</objective>

<execution_context>
@/planning/ROADMAP.md
@utils/persistence.spec.ts
</execution_context>

<context>
Relevant files:
- `apps/website/app/pages/anunciar/resumen.vue`
- `apps/website/app/stores/ad.store.ts`
</context>

<tasks>
<task type="auto">
<name>Ensure Robust Hydration in `ad.store.ts`</name>
<files>apps/website/app/stores/ad.store.ts</files>
<action>
Refactor hydration logic to handle potential corruption in `localStorage` saved state. Add unit tests for the store’s resilience to edge cases, such as partial or undefined `ad` objects. Modify the existing `persist` options (Line 233) to explicitly validate and merge defaults upon initialization.
</action>
<verify>
<automated>vitest apps/website/app/tests/persistence.test.ts</automated>
</verify>
<done>The `adStore` survives state reloads and correctly initializes even with incomplete saved data.</done>
</task>

<task type="auto">
<name>Add Safety Checks in `/resumen.vue`</name>
<files>apps/website/app/pages/anunciar/resumen.vue</files>
<action>
Update `prepareSummary` and other `adStore.ad` references to validate the presence of required fields before rendering. Show a warning message when any critical field is missing from the state. Add tests to confirm flow robustness when partially filled data is encountered.
</action>
<verify>
<automated>vitest apps/website/app/tests/pages/resumen.test.ts</automated>
</verify>
<done>The `/resumen` page does not throw errors when encountering incomplete store data and behaves predictably in edge cases.</done>
</task>
</tasks>

<verification>
- Verify functional regression tests pass without issues.
- Ensure page reloads and navigation work seamlessly with state intact.
</verification>

<success_criteria>
The ad creation wizard retains state across reloads and handles user flows predictably during navigation to payment.
</success_criteria>
