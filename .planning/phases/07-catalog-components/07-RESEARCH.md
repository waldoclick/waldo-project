# Phase 7: Catalog Components - Research

**Researched:** 2026-03-05
**Domain:** Vue 3 Composition API — watch/onMounted fetch lifecycle, Nuxt 4 dashboard components
**Confidence:** HIGH

## Summary

All six catalog components (`PacksDefault.vue`, `UsersDefault.vue`, `RegionsDefault.vue`, `FaqsDefault.vue`, `CommunesDefault.vue`, `ConditionsDefault.vue`) exhibit an identical bug: they declare both `watch([...storeFields], fetchFn, { immediate: true })` and `onMounted(() => { fetchFn() })`. Because `watch({ immediate: true })` runs synchronously during component setup — before `onMounted` — both hooks fire on every mount, producing two identical network requests.

The fix is purely subtractive: remove the `onMounted` block and remove `onMounted` from the import list. No new code is added. No store changes are required. The settings store already has dedicated `SectionSettings` keys for all six entities (`packs`, `users`, `regions`, `faqs`, `communes`, `conditions`). The canonical correct pattern lives in `AdsTable.vue`, established in v1.1.

Secondary finding: `RegionsDefault.vue`, `FaqsDefault.vue`, `CommunesDefault.vue`, and `ConditionsDefault.vue` type `searchParams` as `any` rather than `Record<string, unknown>`. Since `typeCheck: true` is active in `nuxt.config.ts`, these must be corrected in the same pass to avoid future TypeScript errors (though they do not currently cause build failures, tightening them is consistent with the v1.1 Strapi SDK cast pattern).

**Primary recommendation:** Remove `onMounted(() => { fetchFn() })` and the `onMounted` import from all six components. Simultaneously replace `searchParams: any` with `searchParams: Record<string, unknown>` in the four components that use `any`. Run `nuxt build` (which executes `typeCheck: true`) to verify.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DFX-01 | `PacksDefault.vue` no ejecuta fetch doble al montar | Component confirmed: has both `watch({ immediate: true })` and `onMounted`. Fix: delete `onMounted` block + remove from import. |
| DFX-02 | `UsersDefault.vue` no ejecuta fetch doble al montar | Component confirmed: same pattern. Fix: delete `onMounted` block + remove from import. |
| DFX-03 | `RegionsDefault.vue` no ejecuta fetch doble al montar | Component confirmed: same pattern + `searchParams: any`. Fix: delete `onMounted` + fix type. |
| DFX-04 | `FaqsDefault.vue` no ejecuta fetch doble al montar | Component confirmed: same pattern + `searchParams: any`. Fix: delete `onMounted` + fix type. |
| DFX-05 | `CommunesDefault.vue` no ejecuta fetch doble al montar | Component confirmed: same pattern + `searchParams: any`. Fix: delete `onMounted` + fix type. |
| DFX-06 | `ConditionsDefault.vue` no ejecuta fetch doble al montar | Component confirmed: same pattern + `searchParams: any`. Fix: delete `onMounted` + fix type. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 Composition API | (Nuxt 4 bundled) | `watch`, `onMounted`, `ref`, `computed` | Project baseline |
| Pinia (`useSettingsStore`) | (Nuxt 4 bundled) | Per-section filter/pagination state | Already in use, all 6 sections have dedicated keys |
| @nuxtjs/strapi v2 | (installed) | `useStrapi().find()` — server-paginated fetch | Already in use in all 6 components |
| TypeScript strict + typeCheck | nuxt.config `typescript.typeCheck: true` | Compile-time type safety on build | Enabled since v1.1 — must not regress |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Removing `onMounted` | Removing `watch({ immediate })` and keeping `onMounted` | Wrong: breaks filter/pagination reactivity — watch is the reactive trigger |
| Keeping `any` on searchParams | `Record<string, unknown>` | `any` bypasses typeCheck; `Record<string,unknown>` is the v1.1 Strapi SDK cast pattern |

## Architecture Patterns

### The Bug — Exact Sequence

When a component mounts with `watch({ immediate: true })` and `onMounted`:

1. Component setup runs → `watch` is registered with `immediate: true` → `fetchFn()` called (fetch #1)
2. DOM mounts → `onMounted` fires → `fetchFn()` called again (fetch #2)

Both calls read the same store values, send identical requests, and write the same response. The second call is always wasteful.

### The Fix — Canonical Pattern (from AdsTable.vue)

```typescript
// Source: apps/dashboard/app/components/AdsTable.vue lines 282-294
// watch(immediate:true) es el único trigger de carga de datos — no onMounted
watch(
  [
    () => sectionSettings.value.searchTerm,
    () => sectionSettings.value.sortBy,
    () => sectionSettings.value.pageSize,
    () => sectionSettings.value.currentPage,
  ],
  () => {
    fetchAds();
  },
  { immediate: true },
);
// NO onMounted block follows
```

### Per-Component Diff Summary

**PacksDefault.vue** (DFX-01):
- Import: `import { ref, computed, onMounted, watch }` → `import { ref, computed, watch }`
- Delete lines 231-233: `onMounted(() => { fetchPacks(); });`
- `searchParams` is already typed as `Record<string, unknown>` — no type change needed

**UsersDefault.vue** (DFX-02):
- Import: `import { ref, computed, onMounted, watch }` → `import { ref, computed, watch }`
- Delete lines 265-267: `onMounted(() => { fetchUsers(); });`
- `searchParams` is already typed as `Record<string, unknown>` — no type change needed

**RegionsDefault.vue** (DFX-03):
- Import: `import { ref, computed, onMounted, watch }` → `import { ref, computed, watch }`
- Delete lines 226-228: `onMounted(() => { fetchRegions(); });`
- Change `searchParams: any` → `searchParams: Record<string, unknown>` (line 132)

**FaqsDefault.vue** (DFX-04):
- Import: `import { ref, computed, onMounted, watch }` → `import { ref, computed, watch }`
- Delete lines 264-266: `onMounted(() => { fetchFaqs(); });`
- Change `searchParams: any` → `searchParams: Record<string, unknown>` (line 153)

**CommunesDefault.vue** (DFX-05):
- Import: `import { ref, computed, onMounted, watch }` → `import { ref, computed, watch }`
- Delete lines 220-222: `onMounted(() => { fetchCommunes(); });`
- Change `searchParams: any` → `searchParams: Record<string, unknown>` (line 129)

**ConditionsDefault.vue** (DFX-06):
- Import: `import { ref, computed, onMounted, watch }` → `import { ref, computed, watch }`
- Delete lines 214-216: `onMounted(() => { fetchConditions(); });`
- Change `searchParams: any` → `searchParams: Record<string, unknown>` (line 126)

### Anti-Patterns to Avoid

- **Keeping both triggers:** "I'll keep onMounted as a fallback in case watch doesn't fire" — watch({ immediate: true }) always fires synchronously during setup, onMounted is never a fallback.
- **Swapping triggers (removing watch, keeping onMounted):** This would break filter/pagination reactivity — changing page or sort would no longer trigger a new fetch.
- **Adding a guard flag:** Introducing a `hasMounted` ref or similar to de-duplicate is unnecessary complexity — the correct fix is purely removing code.
- **Batching into one plan with Phase 8 components:** Phase 7 components have no shared state with Phase 8 components; they should be treated independently.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deduplication guard | `const hasMounted = ref(false)` guard inside fetch | Remove `onMounted` entirely | Adding state to paper over a structural problem; the fix is purely subtractive |
| Custom debounce on watch | `watchWithDebounce()` wrapper | `watch({ immediate: true })` as-is | No debounce is needed — each store mutation (setFilters, setSearchTerm) already resets `currentPage` before triggering watch |

## Common Pitfalls

### Pitfall 1: Unused `onMounted` Import Left Behind
**What goes wrong:** TypeScript/ESLint reports an unused import warning; may not fail `typeCheck` but creates lint noise and signals incomplete cleanup.
**Why it happens:** Developer removes the function call but forgets the import line.
**How to avoid:** Always update the import statement in the same edit as removing the `onMounted` call.
**Warning signs:** `import { ref, computed, onMounted, watch }` with no `onMounted(` in the file body.

### Pitfall 2: `searchParams: any` Causing Latent TypeScript Issues
**What goes wrong:** Passing `any`-typed params to `strapi.find()` bypasses type checking on the params object; future changes may silently pass wrong types.
**Why it happens:** Four of the six components typed searchParams as `any` instead of `Record<string, unknown>`.
**How to avoid:** Replace `any` with `Record<string, unknown>` (the established v1.1 Strapi SDK cast pattern from PROJECT.md Key Decisions).
**Warning signs:** `const searchParams: any = {` in the fetch function body.

### Pitfall 3: Verifying with Dev Server Instead of Build
**What goes wrong:** Dev server (Vite) does not run TypeScript type checking by default; a change can appear fine in dev but fail `nuxt build` (which runs vue-tsc via `typeCheck: true`).
**Why it happens:** Developers test by running `yarn dev` rather than `yarn build`.
**How to avoid:** After all six components are modified, run `yarn build` from `apps/dashboard/` to confirm typeCheck passes.
**Warning signs:** Success in dev mode but untested build.

## Code Examples

### Correct Final State — Fetch Block (all 6 components follow this shape)

```typescript
// Source: apps/dashboard/app/components/AdsTable.vue (v1.1 canonical reference)
// Imports — onMounted NOT present
import { ref, computed, watch } from "vue";

// ... fetch function defined ...

// Sole data-loading trigger
watch(
  [
    () => settingsStore.packs.searchTerm,   // substitute per-entity field
    () => settingsStore.packs.sortBy,
    () => settingsStore.packs.pageSize,
    () => settingsStore.packs.currentPage,
  ],
  () => {
    fetchPacks();  // substitute per-entity fetch function
  },
  { immediate: true },
);
// EOF — no onMounted block
```

### Strapi SDK v5 Cast Pattern (for searchParams: any replacements)

```typescript
// Source: apps/dashboard/app/components/PacksDefault.vue (already correct)
// and PROJECT.md Key Decisions: "Strapi SDK v5 cast pattern"
const searchParams: Record<string, unknown> = {
  pagination: {
    page: settingsStore.conditions.currentPage,
    pageSize: settingsStore.conditions.pageSize,
  },
  sort: settingsStore.conditions.sortBy,
};

if (settingsStore.conditions.searchTerm) {
  searchParams.filters = { /* ... */ };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `onMounted` + `watch({ immediate })` | `watch({ immediate })` only | v1.1 (AdsTable) | Single fetch on mount; reactive on filter/pagination changes |
| `searchParams: any` | `searchParams: Record<string, unknown>` | v1.1 (Strapi SDK pattern) | TypeScript catches bad param shapes at compile time |
| typeCheck disabled | `typeCheck: true` in nuxt.config | v1.1 | All builds validate types — regressions caught before deploy |

**Deprecated/outdated:**
- `onMounted` as a data-loading hook when `watch({ immediate: true })` is already present: replaced by watch-only pattern per v1.1 Key Decision.

## Open Questions

None. The bug, the fix, and the verification method are all fully determined by code inspection and project history.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest via `@nuxt/test-utils` |
| Config file | `apps/dashboard/vitest.config.ts` |
| Quick run command | `cd apps/dashboard && yarn test` |
| Full suite command | `cd apps/dashboard && yarn build` (typeCheck: true validates all .vue files) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DFX-01 | PacksDefault fetch fires exactly once on mount | manual-only* | N/A | N/A |
| DFX-02 | UsersDefault fetch fires exactly once on mount | manual-only* | N/A | N/A |
| DFX-03 | RegionsDefault fetch fires exactly once on mount | manual-only* | N/A | N/A |
| DFX-04 | FaqsDefault fetch fires exactly once on mount | manual-only* | N/A | N/A |
| DFX-05 | CommunesDefault fetch fires exactly once on mount | manual-only* | N/A | N/A |
| DFX-06 | ConditionsDefault fetch fires exactly once on mount | manual-only* | N/A | N/A |
| All DFX | No TypeScript errors introduced | smoke | `cd apps/dashboard && yarn build` | ✅ (nuxt.config typeCheck:true) |

*Unit tests for dashboard components are explicitly Out of Scope per REQUIREMENTS.md and PROJECT.md (milestone dedicated posterior: TEST-02). Network-level double-fetch verification is done by code inspection (absence of `onMounted` in component) + build gate.

### Sampling Rate
- **Per task commit:** Code inspection — confirm `onMounted` is absent from modified file
- **Per wave merge:** `cd apps/dashboard && yarn build` — typeCheck must pass clean
- **Phase gate:** Full build green before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure (vitest + nuxt build typeCheck) covers the phase gate. No new test files are required because unit tests for these components are deferred to a future milestone.

## Sources

### Primary (HIGH confidence)
- Direct code inspection of all 6 target components — confirmed double-fetch pattern in each
- `apps/dashboard/app/components/AdsTable.vue` — canonical v1.1 reference implementation (watch-only)
- `apps/dashboard/app/stores/settings.store.ts` — confirmed dedicated section keys for all 6 entities
- `apps/dashboard/nuxt.config.ts` — confirmed `typescript.typeCheck: true`
- `.planning/PROJECT.md` Key Decisions table — Strapi SDK v5 cast pattern, watch-only trigger decision

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` and `.planning/ROADMAP.md` — phase scope and success criteria
- `.planning/REQUIREMENTS.md` — requirement IDs and traceability

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Bug identification: HIGH — directly observed in all 6 component files
- Fix pattern: HIGH — canonical reference in AdsTable.vue, established in v1.1
- TypeScript side-fix (`any` → `Record<string,unknown>`): HIGH — four components confirmed, pattern established in PROJECT.md
- No store changes needed: HIGH — settings store already has all 6 section keys
- Build verification command: HIGH — `typeCheck: true` confirmed in nuxt.config.ts

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable codebase; no external dependency changes expected)
