# Phase 115: Fix Remaining any and Function Type Violations - Research

**Researched:** 2026-04-06
**Domain:** TypeScript best practices — residual `any` type annotations missed by Phase 114
**Confidence:** HIGH

---

## Summary

Phase 114 fixed approximately 83 `any` violations and 6 `Function` type violations across the monorepo. Its final verification sweep confirmed zero violations via a regex grep against the `: any`, `as any`, and `: Function` patterns it tracked. However, that grep missed two additional patterns that Codacy flags: `Array<any>` generic syntax (two components — `IntroduceAuth.vue` in both website and dashboard) and `ref<any>(null)` patterns (ten dashboard detail pages).

A full scan of the current codebase reveals exactly **12 residual violations**:

- **2 website/dashboard shared** — `IntroduceAuth.vue` prop typed as `Array<any>` (list is a `string[]`)
- **10 dashboard detail pages** — `ref<any>(null)` for item state on pages that load a single entity

Strapi source is clean. No `Function` type violations remain. The Strapi `media-cleanup.cron.ts` regex hit at line 124 is a confirmed JSDoc false positive ("any file URL").

All 12 violations have known correct fix types. Every detail page already has a corresponding typed interface defined in its list component or form component — no new interfaces need to be invented. The only missing type is for `FeaturedReservation` (the `featured/[id].vue` page) and the `Reservation` in `reservations/[id].vue`, which can be defined inline or imported from their list components.

**Primary recommendation:** Fix all 12 violations in a single plan. Group by pattern: (1) `Array<any>` → `string[]` in both `IntroduceAuth.vue` files, (2) `ref<any>(null)` → `ref<TypeName | null>(null)` in 10 dashboard detail pages importing their type from the nearest existing interface source.

---

## Standard Stack

### Core (no new dependencies needed)

| Library | Version | Purpose | Note |
|---------|---------|---------|------|
| `vue` | installed | `ref<T>` generic for typed reactive state | Already in project |
| Existing dashboard type files | n/a | `Pack`, `Category` from `@/types/` | Already in project |
| Existing form components | n/a | `FaqData`, `PolicyData`, `TermData`, `RegionData`, `CommuneData`, `ConditionData`, `CategoryData` | Already exported from form components |

No new dependencies. All fixes are pure TypeScript annotation changes.

---

## Architecture Patterns

### Recommended Project Structure

No structural changes needed. All violations are in-place annotation fixes.

### Pattern 1: `Array<any>` prop → `string[]`

**What:** `IntroduceAuth.vue` accepts an optional `list` prop typed as `Array<any>`. All call sites pass `string[]` literals.
**When to use:** Any prop that accepts an array of strings.
**Fix:**
```typescript
// Before
list?: Array<any>;

// After
list?: string[];
```
**Files affected:**
- `apps/website/app/components/IntroduceAuth.vue` (line 41)
- `apps/dashboard/app/components/IntroduceAuth.vue` (line 41)

### Pattern 2: `ref<any>(null)` → `ref<TypeName | null>(null)` with typed import

**What:** Dashboard detail pages store the fetched entity in a local `ref<any>(null)`. Each page has a corresponding typed interface in its list component or form component.
**When to use:** Any page-level reactive variable holding a single fetched entity.
**Fix pattern:**
```typescript
// Before
const item = ref<any>(null);

// After (example for faqs/[id]/index.vue)
import type { FaqData } from "@/components/FormFaq.vue";
interface FaqRecord extends FaqData {
  createdAt: string;
  updatedAt: string;
}
const item = ref<FaqRecord | null>(null);
```

**Note on interface strategy:** The `FaqData` / `PolicyData` / `TermData` etc. interfaces are already exported from their Form components (marked `export interface`). The detail pages can extend them with `createdAt`/`updatedAt` fields that are not in the form interface. This is the same pattern already established in the edit pages (e.g., `faqs/[id]/edit.vue` uses `interface FaqRecord extends FaqData { id: number; documentId: string; }`).

### Pattern 3: `commune = ref<any>(null)` → typed with `CommuneData`

Same as Pattern 2 but the variable is named `commune` instead of `item`. The fix is identical in approach.

---

### Violation Inventory (Complete)

| File | Line | Violation | Fix Type |
|------|------|-----------|----------|
| `apps/website/app/components/IntroduceAuth.vue` | 41 | `list?: Array<any>` | `string[]` |
| `apps/dashboard/app/components/IntroduceAuth.vue` | 41 | `list?: Array<any>` | `string[]` |
| `apps/dashboard/app/pages/featured/[id].vue` | 68 | `const item = ref<any>(null)` | Local `FeaturedReservation` interface |
| `apps/dashboard/app/pages/packs/[id]/index.vue` | 76 | `const item = ref<any>(null)` | Import `Pack` from `@/types/pack` |
| `apps/dashboard/app/pages/faqs/[id]/index.vue` | 56 | `const item = ref<any>(null)` | Import `FaqData` from `FormFaq.vue`, extend with dates |
| `apps/dashboard/app/pages/reservations/[id].vue` | 68 | `const item = ref<any>(null)` | Local `ReservationRecord` interface |
| `apps/dashboard/app/pages/policies/[id]/index.vue` | 56 | `const item = ref<any>(null)` | Import `PolicyData` from `FormPolicy.vue`, extend |
| `apps/dashboard/app/pages/conditions/[id]/index.vue` | 51 | `const item = ref<any>(null)` | Import `ConditionData` from `FormCondition.vue`, extend |
| `apps/dashboard/app/pages/regions/[id]/index.vue` | 51 | `const item = ref<any>(null)` | Import `RegionData` from `FormRegion.vue`, extend |
| `apps/dashboard/app/pages/categories/[id]/index.vue` | 56 | `const item = ref<any>(null)` | Import `CategoryData` from `FormCategory.vue`, extend |
| `apps/dashboard/app/pages/terms/[id]/index.vue` | 56 | `const item = ref<any>(null)` | Import `TermData` from `FormTerm.vue`, extend |
| `apps/dashboard/app/pages/communes/[id]/index.vue` | 56 | `const commune = ref<any>(null)` | Import `CommuneData` from `FormCommune.vue`, extend |

**Total: 12 violations.**

---

### Interface Sources for Each Detail Page

| Page | Existing Export | Source File | Fields to Add in Extension |
|------|----------------|-------------|---------------------------|
| `faqs/[id]/index.vue` | `export interface FaqData` | `FormFaq.vue` | `createdAt: string; updatedAt: string` |
| `packs/[id]/index.vue` | `export interface Pack` | `@/types/pack.ts` | Already has `createdAt/updatedAt` — use directly |
| `policies/[id]/index.vue` | `export interface PolicyData` | `FormPolicy.vue` | `createdAt: string; updatedAt: string` |
| `conditions/[id]/index.vue` | `export interface ConditionData` | `FormCondition.vue` | `updatedAt: string` |
| `regions/[id]/index.vue` | `export interface RegionData` | `FormRegion.vue` | `updatedAt: string; communes?: Array<{ id: number; name: string }>` |
| `categories/[id]/index.vue` | `export interface CategoryData` | `FormCategory.vue` | `createdAt: string; updatedAt: string; slug?: string` |
| `terms/[id]/index.vue` | `export interface TermData` | `FormTerm.vue` | `createdAt: string; updatedAt: string` |
| `communes/[id]/index.vue` | `export interface CommuneData` | `FormCommune.vue` | `updatedAt: string; region?: { name: string }` |
| `featured/[id].vue` | `interface Featured` (not exported) | `FeaturedFree.vue` | Define inline: `{ id: number; price: number; total_days: number; description?: string; createdAt: string; updatedAt: string; user?: { username: string }; ad?: { name: string } \| null }` |
| `reservations/[id].vue` | `interface Reservation` (not exported) | `ReservationsFree.vue` | Define inline: `{ id: number; price: number; total_days: number; description?: string; createdAt: string; updatedAt: string; user?: { username: string }; ad?: { name: string } \| null }` |

**Note for featured and reservations:** The `Featured` and `Reservation` interfaces in the list components are not exported. Rather than exporting them (which changes the API of those components), define a local typed interface in the detail page directly. Check what fields the template uses and type only those.

---

### Anti-Patterns to Avoid

- **Don't change `ref<any>(null)` to `ref<unknown>(null)`** — `unknown` requires narrowing at every access and breaks the template's `item.field` syntax. Use the correct concrete type.
- **Don't use `Record<string, unknown>` as the ref type for entities** — it loses field-level type information. Use the typed interface.
- **Don't export `Featured` or `Reservation` from list components** — these interfaces are implementation details of list/table views with different shapes from the detail view. Define separate interfaces in the detail pages.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Faq type shape | New standalone type file | Extend exported `FaqData` from `FormFaq.vue` | Already exported, already used in edit page |
| Category type with icon | Custom interface | Extend `CategoryData` from `FormCategory.vue` | Has icon field already |
| Pack type | Custom interface | Import `Pack` from `@/types/pack.ts` | Complete type already in types directory |

---

## Common Pitfalls

### Pitfall 1: `ref<FaqData | null>` vs `ref<FaqRecord | null>`
**What goes wrong:** `FaqData` has all optional fields (`id?`, `documentId?`, `title?`). The detail page accesses `item.value.title` without null checks in computed properties. TypeScript will complain if `title` is typed as `string | undefined`.
**How to avoid:** Define `FaqRecord extends FaqData` with `id: number` (not optional) and `createdAt: string` (required). Match the actual shape returned by the API.

### Pitfall 2: `Array<any>` vs `any[]` — both are flagged by Codacy
**What goes wrong:** Phase 114 grep only searched for `: any` and `as any` patterns, missing the `<any>` generic syntax.
**How to avoid:** The fix is `string[]` — this phase uses targeted grep patterns to catch all forms: `Array<any>`, `ref<any>`, `<any>`.

### Pitfall 3: Template `item.field` access failing after typing
**What goes wrong:** After typing `item` as `FaqRecord | null`, Vue template expressions like `item.title` (without `?.`) may trigger type errors.
**How to avoid:** All 10 detail pages already guard with `v-if="item"` before every field access — this satisfies TypeScript's null check inside the `v-if` block. No access pattern changes needed.

### Pitfall 4: `CommuneData` export from `FormCommune.vue`
**What goes wrong:** `FormCommune.vue` has two interfaces: `RegionOption` (not exported) and `CommuneData` (exported). Import only `CommuneData`.
**How to avoid:** `import type { CommuneData } from "@/components/FormCommune.vue"`.

---

## Code Examples

### `IntroduceAuth.vue` fix
```typescript
// Source: IntroduceAuth.vue call sites — list is always string[]
const props = defineProps<{
  title: string;
  subtitle?: string;
  list?: string[];
}>();
```

### Detail page fix (faqs/[id]/index.vue)
```typescript
// Source: Established pattern from faqs/[id]/edit.vue
import type { FaqData } from "@/components/FormFaq.vue";

interface FaqRecord extends FaqData {
  createdAt: string;
  updatedAt: string;
}

const item = ref<FaqRecord | null>(null);
```

### Pack detail page fix (uses existing type directly)
```typescript
// Source: apps/dashboard/app/types/pack.ts — Pack has all required fields
import type { Pack } from "@/types/pack";

const item = ref<Pack | null>(null);
```

### Category detail page fix (icon field already in CategoryData)
```typescript
// Source: apps/dashboard/app/components/FormCategory.vue
import type { CategoryData } from "@/components/FormCategory.vue";

interface CategoryRecord extends CategoryData {
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

const item = ref<CategoryRecord | null>(null);
```

### Featured/Reservation — define inline (not exported from list component)
```typescript
// Define locally in apps/dashboard/app/pages/featured/[id].vue
interface FeaturedRecord {
  id: number;
  price: number;
  total_days: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  user?: { username: string };
  ad?: { name: string } | null;
}

const item = ref<FeaturedRecord | null>(null);
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Website framework | Vitest + @nuxt/test-utils |
| Dashboard framework | Vitest + @nuxt/test-utils |
| Strapi framework | Jest |
| Website quick run | `cd apps/website && npx vitest run` |
| Dashboard quick run | `cd apps/dashboard && npx vitest run` |
| TypeScript check (website) | `cd apps/website && npx nuxt typecheck` |
| TypeScript check (dashboard) | `cd apps/dashboard && npx vue-tsc --noEmit` |
| TypeScript check (strapi) | `cd apps/strapi && npx tsc --noEmit` |
| Full suite | `yarn test` from root |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| ATV-01 | Zero `any` violations in website source | Type check | `cd apps/website && npx nuxt typecheck` | N/A — build check |
| ATV-02 | Zero `any` violations in dashboard source | Type check | `cd apps/dashboard && npx vue-tsc --noEmit` | N/A — build check |
| ATV-03 | Zero `any` violations in Strapi source | Type check | `cd apps/strapi && npx tsc --noEmit` | N/A — build check |
| ATV-04 | Existing tests still pass | Regression | `yarn test` | ✅ pre-existing |

### Sampling Rate
- **Per task commit:** `grep -rn '<any>\|Array<any>\|ref<any>' apps/website/app apps/dashboard/app --include="*.ts" --include="*.vue" | grep -v ".nuxt"`
- **Per wave merge:** Full typecheck on website + dashboard + Strapi
- **Phase gate:** Zero violations grep + all typechecks pass before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers regression testing. The violations in this phase are not covered by unit tests (they are type-annotation issues, not behavioral issues). TypeScript compilation is the sole gate.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `Array<any>` for generic list | `string[]` / `T[]` with concrete element type | Props are type-checked at call site |
| `ref<any>(null)` for entity state | `ref<EntityType \| null>(null)` | Template field access is type-safe |

---

## Open Questions

1. **Pack type completeness**
   - What we know: `Pack` from `@/types/pack.ts` has `name`, `description`, `text`, `total_days`, `total_ads`, `total_features`, `price`, `createdAt`, `updatedAt` — all fields the template uses.
   - What's unclear: Whether `documentId` is returned by the API for packs.
   - Recommendation: Use `Pack` directly; add `documentId?: string` to the `Pack` interface if packs use Strapi v5 document API.

2. **`regions/[id]/index.vue` — communes field**
   - What we know: The template renders a communes count or list if present. `RegionData` from `FormRegion.vue` may not include `communes`.
   - What's unclear: Whether the region detail template accesses `item.communes`.
   - Recommendation: Check the template. If `communes` is accessed, add it to the `RegionRecord` extension interface.

3. **`reservations/[id].vue` template fields**
   - What we know: The template accesses `item.price`, `item.total_days`, `item.description`, `item.user?.username`, `item.ad?.name`, `item.createdAt`, `item.updatedAt`.
   - Recommendation: Verify field names match the Strapi `ad-reservation` schema before fixing.

---

## Sources

### Primary (HIGH confidence)
- Direct grep enumeration of current codebase — all 12 violations confirmed by running grep across `apps/website/app/`, `apps/dashboard/app/`, `apps/strapi/src/`
- `apps/dashboard/app/components/FormFaq.vue` — `export interface FaqData` confirmed
- `apps/dashboard/app/components/FormPolicy.vue` — `export interface PolicyData` confirmed
- `apps/dashboard/app/components/FormTerm.vue` — `export interface TermData` confirmed
- `apps/dashboard/app/components/FormRegion.vue` — `export interface RegionData` confirmed
- `apps/dashboard/app/components/FormCommune.vue` — `export interface CommuneData` confirmed
- `apps/dashboard/app/components/FormCondition.vue` — `export interface ConditionData` confirmed
- `apps/dashboard/app/components/FormCategory.vue` — `export interface CategoryData` confirmed
- `apps/dashboard/app/types/pack.ts` — `export interface Pack` confirmed
- `apps/website/app/pages/login/index.vue` + `registro.vue` — list call sites confirmed as `string[]`
- Phase 114 VERIFICATION.md — confirmed zero `: any` / `as any` violations before this phase

### Secondary (MEDIUM confidence)
- Phase 114 RESEARCH.md patterns (Patterns 1–23) — still valid and superseded for any new occurrences

---

## Metadata

**Confidence breakdown:**
- Violation inventory: HIGH — direct grep enumeration confirmed exactly 12 violations
- Fix patterns: HIGH — all interface sources verified to exist and be exported
- TypeScript compatibility: HIGH — same patterns already used in edit pages (sibling files)
- Regression risk: LOW — type-only changes, no runtime behavior change

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable ecosystem)
