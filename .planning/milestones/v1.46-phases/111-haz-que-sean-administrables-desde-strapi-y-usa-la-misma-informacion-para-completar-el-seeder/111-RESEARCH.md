# Phase 111: Make Policies Manageable from Strapi + Seeder — Research

**Researched:** 2026-04-04
**Domain:** Strapi v5 content type creation, Nuxt 4 Pinia store pattern, seeder pattern
**Confidence:** HIGH

## Summary

Phase 111 targets the `PoliciesDefault.vue` component, which currently has all 15 privacy-policy accordion items hardcoded as a static `faqs` array. The task has two parts: (1) create a `policy` collection type in Strapi so editors can manage the text from the admin panel, and (2) write a `policies.ts` seeder that pre-populates those records from the same data currently embedded in the component — so a fresh environment starts with the full policy set without manual entry.

The identical problem was already solved for the FAQ section. Every artefact needed for policies already exists in mirror form: `api::faq.faq` content type, `seeders/faqs.ts`, `useFaqsStore`, `FaqDefault.vue`, and `preguntas-frecuentes.vue` page. The implementation is a straight parallel: create `api::policy.policy`, write `seeders/policies.ts`, add `usePoliciesStore`, update `PoliciesDefault.vue` to fetch from the store, and update `politicas-de-privacidad.vue` to pass data through `useAsyncData`.

**Primary recommendation:** Mirror the FAQ implementation exactly — content type schema, seeder pattern, Pinia store with cache guard, useAsyncData in the page, and store-fed component. Do not introduce new patterns.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Strapi v5 | v5 (project-installed) | Content type + admin UI | Project CMS |
| `@strapi/strapi` Core factories | v5 | `createCoreRouter`, `createCoreService`, `createCoreController` | Standard Strapi v5 scaffold |
| Pinia + `@pinia-plugin-persistedstate/nuxt` | project-installed | Client-side store with persistence and cache guard | Project state standard |
| `useApiClient` composable | project-owned | All HTTP calls in website | Mandated by Phase 107-108 decisions |
| Vitest + `@nuxt/test-utils` | project-installed | Unit tests | Project test standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `strapi.db.query` | v5 built-in | Seeder database writes | All seeder upsert/create logic |

**No new dependencies required.** All tools are already present.

---

## Architecture Patterns

### Recommended Project Structure Changes

```
apps/strapi/
├── src/api/policy/               # NEW — mirrors api/faq exactly
│   ├── content-types/policy/
│   │   └── schema.json           # NEW
│   ├── controllers/
│   │   └── policy.ts             # NEW — factories.createCoreController
│   ├── routes/
│   │   └── policy.ts             # NEW — factories.createCoreRouter
│   └── services/
│       └── policy.ts             # NEW — factories.createCoreService
├── seeders/
│   └── policies.ts               # NEW — mirrors seeders/faqs.ts
└── src/index.ts                  # EDIT — import + call populatePolicies

apps/website/app/
├── types/
│   └── policy.d.ts               # NEW — mirrors types/faq.d.ts
├── stores/
│   └── policies.store.ts         # NEW — mirrors faqs.store.ts
├── components/
│   └── PoliciesDefault.vue       # EDIT — remove hardcoded array, accept prop + useAsyncData
└── pages/
    └── politicas-de-privacidad.vue # EDIT — load store via useAsyncData, pass to component
```

### Pattern 1: Strapi Content Type Schema (mirrors faq)

The policy content type needs the same fields the accordion already uses (`title` and `text`) plus an `order` integer so editors can control display sequence without relying on `createdAt`.

```json
// apps/strapi/src/api/policy/content-types/policy/schema.json
{
  "kind": "collectionType",
  "collectionName": "policies",
  "info": {
    "singularName": "policy",
    "pluralName": "policies",
    "displayName": "Policy"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "text": {
      "type": "richtext"
    },
    "order": {
      "type": "integer"
    }
  }
}
```

**Field rationale:**
- `title` — section heading (e.g. "1. Información general…")
- `text` — HTML body; use `richtext` so the Strapi admin renders a WYSIWYG editor and the existing `v-html` in `AccordionDefault` keeps working without change
- `order` — explicit sort field; the FAQ store sorts by `createdAt:asc`, but for policies numbered order is more reliable
- `draftAndPublish: false` — same as FAQ; policies are always live, no drafts needed

### Pattern 2: Core API scaffold (mirrors faq)

All three files are one-liners using Strapi factories — same as every other content type in the project:

```typescript
// controllers/policy.ts
import { factories } from "@strapi/strapi";
export default factories.createCoreController("api::policy.policy");

// routes/policy.ts
import { factories } from "@strapi/strapi";
export default factories.createCoreRouter("api::policy.policy");

// services/policy.ts
import { factories } from "@strapi/strapi";
export default factories.createCoreService("api::policy.policy");
```

### Pattern 3: Seeder (mirrors seeders/faqs.ts)

```typescript
// seeders/policies.ts
import type { Core } from "@strapi/strapi";

const policiesData = [
  { order: 1, title: "1. Información general ...", text: `<p>...</p>` },
  // ... all 15 items from PoliciesDefault.vue
];

const populatePolicies = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando Políticas...");
  for (const policy of policiesData) {
    const existing = await strapi.db.query("api::policy.policy").findMany({
      where: { title: policy.title },
    });
    if (existing.length > 0) {
      console.log(`Policy ya existe: ${policy.title}`);
      continue;
    }
    await strapi.db.query("api::policy.policy").create({ data: policy });
    console.log(`Policy creada: ${policy.title}`);
  }
  console.log("Políticas pobladas exitosamente");
};

export default populatePolicies;
```

**Key:** seeder data is extracted verbatim from the existing `faqs` array in `PoliciesDefault.vue`. Same deduplication guard: `findMany({ where: { title } })` before creating.

### Pattern 4: Register seeder in bootstrap (src/index.ts)

```typescript
import populatePolicies from "../seeders/policies";

// inside bootstrap({ strapi }):
await populatePolicies(strapi);
```

Add after the existing `populateFaqs(strapi)` call. Wrapped by the existing `APP_RUN_SEEDERS` guard — no change needed to that logic.

### Pattern 5: TypeScript type (mirrors types/faq.d.ts)

```typescript
// app/types/policy.d.ts
export interface Policy {
  id: number;
  title: string;
  text: string;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface PolicyResponse {
  data: Policy[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
```

### Pattern 6: Pinia store (mirrors faqs.store.ts exactly)

```typescript
// stores/policies.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Policy, PolicyResponse } from "@/types/policy";

const CACHE_DURATION = 3600000;
const PAGE_SIZE = 50; // policies are more numerous than FAQs

export const usePoliciesStore = defineStore(
  "policies",
  () => {
    const policies = ref<Policy[]>([]);
    const lastFetchTimestamp = ref<number | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const client = useApiClient();

    const loadPolicies = async () => {
      const now = Date.now();
      if (!lastFetchTimestamp.value || now - lastFetchTimestamp.value > CACHE_DURATION) {
        try {
          loading.value = true;
          error.value = null;
          const response = await client("policies", {
            method: "GET",
            params: {
              pagination: { pageSize: PAGE_SIZE, page: 1 },
              sort: ["order:asc"],
            } as unknown as Record<string, unknown>,
          });
          const typedResponse = response as unknown as PolicyResponse;
          if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
            throw new Error("Formato de datos inválido");
          }
          policies.value = typedResponse.data;
          lastFetchTimestamp.value = now;
        } catch (err) {
          error.value = "Error al cargar las políticas";
          console.error("Error loading policies:", err);
        } finally {
          loading.value = false;
        }
      }
    };

    return { policies, lastFetchTimestamp, loading, error, loadPolicies };
  },
  {
    // persist: CORRECT — static reference data with 1-hour cache TTL; safe to reuse across sessions
    persist: { storage: persistedState.localStorage },
  },
);
```

**Sort by `order:asc`** (not `createdAt:asc`) because policy sections have explicit numbering.

### Pattern 7: Updated page — politicas-de-privacidad.vue (mirrors preguntas-frecuentes.vue)

```vue
<template>
  <PoliciesDefault :policies="policies || []" />
</template>

<script setup lang="ts">
import PoliciesDefault from "@/components/PoliciesDefault.vue";

definePageMeta({ layout: "about" });

const policiesStore = usePoliciesStore();
const { data: policies } = await useAsyncData(
  "policies",
  async () => {
    await policiesStore.loadPolicies();
    return policiesStore.policies || [];
  },
  { immediate: true, server: true },
);

// SEO unchanged — same title/description
</script>
```

### Pattern 8: Updated PoliciesDefault.vue component

Remove the hardcoded `faqs` array and accept a `policies` prop. The template already uses `AccordionDefault :questions`, so the only change is the data source:

```vue
<script setup lang="ts">
import type { Policy } from "@/types/policy";
import AccordionDefault from "@/components/AccordionDefault.vue";

const props = defineProps<{
  policies: Policy[];
}>();
</script>
```

The `faqs` local variable in the template becomes `props.policies`. The `AccordionDefault` already accepts `Array<{ title: string; text: string }>` — the `Policy` type satisfies this shape.

### Anti-Patterns to Avoid

- **Do not add a `default` option to `useAsyncData` that returns `undefined`** — always `default: () => []` to eliminate `T | undefined` from the inferred type (CLAUDE.md rule).
- **Do not load policies inside `onMounted`** — `useAsyncData` with `server: true` is the correct SSR pattern for pages.
- **Do not call `usePoliciesStore()` inside the `useAsyncData` callback** — instantiate at setup scope before the `useAsyncData` call (Phase 110 decision).
- **Do not create a new SCSS file** for the updated component unless one already exists and needs a new rule.
- **Do not use the `text` Strapi field type if rich HTML is required** — use `richtext` so the admin WYSIWYG works. The FAQ schema uses `text` (plain), but policy items contain multi-paragraph HTML — `richtext` is more appropriate.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin UI for editing policies | Custom dashboard page | Strapi admin panel (built-in) | Strapi auto-generates CRUD UI for any collection type |
| API endpoint | Custom controller | `factories.createCoreRouter/Controller/Service` | Strapi generates standard REST endpoints automatically |
| Cache invalidation | Manual timestamp logic | Existing pattern in `faqs.store.ts` | Already solved; copy exactly |
| HTML sanitization in accordion | Custom sanitizer | `useSanitize` composable already used in `AccordionDefault` | Already handled — no change needed |

**Key insight:** The FAQ feature is a working reference implementation. Every file has an exact parallel that already exists and works. The task is transcription + substitution, not design.

---

## Common Pitfalls

### Pitfall 1: `text` vs `richtext` field type
**What goes wrong:** Using Strapi's `text` type stores plain text; the admin renders a `<textarea>`. The existing hardcoded policy content contains `<p>` HTML tags. If stored as plain text, the HTML tags are stored as literals and rendered escaped in the browser.
**Why it happens:** The FAQ schema uses `text` because FAQ answers are plain strings. Policy items have multi-paragraph HTML.
**How to avoid:** Use `"type": "richtext"` in the schema. The Strapi admin will render a rich text editor. The website renders via `v-html` (already the case in `AccordionDefault`), so the output is identical.
**Warning signs:** If policy text shows `&lt;p&gt;` in the browser after seeding.

### Pitfall 2: Seeder populates from wrong data source
**What goes wrong:** The seeder `policiesData` array diverges from the content in `PoliciesDefault.vue` (e.g., someone edited the component text but not the seeder or vice versa).
**Why it happens:** Data lives in two places simultaneously during migration.
**How to avoid:** Extract `policiesData` verbatim from `PoliciesDefault.vue` before the component is refactored. The commit that adds the seeder should also strip the hardcoded array from the component.

### Pitfall 3: Strapi public access not granted
**What goes wrong:** The `policies` endpoint returns 403 for unauthenticated requests because the Public role has no `find` permission.
**Why it happens:** New content types default to no public access.
**How to avoid:** After registering the content type, go to Strapi Admin → Settings → Users & Permissions → Roles → Public → Policy → enable `find` and `findOne`. This is a manual step that must be documented as part of the plan's verification checklist. (The FAQ content type already has this set; verify it as the reference.)

### Pitfall 4: `useAsyncData` key collision
**What goes wrong:** If the key `"policies"` is already used on another page, SSR caching will serve stale or incorrect data.
**Why it happens:** `useAsyncData` keys are global in Nuxt; duplicate keys share state.
**How to avoid:** Use key `"policies"` only on `politicas-de-privacidad.vue`. Verify with `grep -r '"policies"' apps/website/app/` before writing.

### Pitfall 5: Component prop mismatch
**What goes wrong:** `PoliciesDefault.vue` currently passes `faqs` to `AccordionDefault`. After the refactor, if the prop name changes but template bindings aren't updated, the accordion renders empty.
**Why it happens:** The component has an implicit contract between the local array and the template binding.
**How to avoid:** Change both the prop definition and the `:questions="..."` binding in one atomic edit.

---

## Code Examples

### Verified seeder upsert pattern (from seeders/faqs.ts)
```typescript
// Source: apps/strapi/seeders/faqs.ts (project file)
const existingFaq = await strapi.db.query("api::faq.faq").findMany({
  where: { title: faq.title },
});
if (existingFaq.length > 0) {
  console.log(`FAQ ya existe: ${faq.title}`);
  continue;
}
await strapi.db.query("api::faq.faq").create({
  data: { title: faq.title, featured: faq.featured, text: faq.text },
});
```

### Verified store + useAsyncData page pattern (from preguntas-frecuentes.vue)
```typescript
// Source: apps/website/app/pages/preguntas-frecuentes.vue (project file)
const faqsStore = useFaqsStore();
const { data: faqs } = await useAsyncData(
  "faqs",
  async () => {
    await faqsStore.loadFaqs();
    return faqsStore.faqs || [];
  },
  { immediate: true, server: true },
);
```

### Verified store cache guard pattern (from faqs.store.ts)
```typescript
// Source: apps/website/app/stores/faqs.store.ts (project file)
if (!lastFetchTimestamp.value || now - lastFetchTimestamp.value > CACHE_DURATION) {
  // fetch...
  lastFetchTimestamp.value = now;
}
```

### Strapi richtext schema field
```json
"text": {
  "type": "richtext"
}
```

---

## Runtime State Inventory

> This phase is NOT a rename/refactor. No runtime state inventory required.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x (website) |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn workspace @waldo/website test --run` |
| Full suite command | `yarn workspace @waldo/website test --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| POL-01 | `policy` Strapi content type has correct schema | manual | Verify via Strapi admin panel | N/A |
| POL-02 | Seeder creates all 15 policy records on first boot | manual | Run Strapi with `APP_RUN_SEEDERS=true`; verify count in admin | N/A |
| POL-03 | Seeder is idempotent (second run skips existing records) | manual | Run seeder twice; count stays 15 | N/A |
| POL-04 | `usePoliciesStore.loadPolicies()` fetches from `/api/policies` | unit | `yarn workspace @waldo/website test --run tests/stores/policies.store.test.ts` | ❌ Wave 0 |
| POL-05 | Store cache guard prevents double fetch within TTL | unit | same file | ❌ Wave 0 |
| POL-06 | `PoliciesDefault.vue` renders prop data via AccordionDefault | unit | `yarn workspace @waldo/website test --run tests/components/PoliciesDefault.test.ts` | ❌ Wave 0 |
| POL-07 | Public role has `find` permission on policies endpoint | manual | `curl https://[strapi]/api/policies` returns 200 without auth | N/A |

**Manual-only justification:** POL-01 through POL-03 and POL-07 require a running Strapi instance and cannot be automated in Vitest. POL-04 through POL-06 are unit-testable.

### Sampling Rate
- **Per task commit:** `yarn workspace @waldo/website test --run`
- **Per wave merge:** `yarn workspace @waldo/website test --run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/website/tests/stores/policies.store.test.ts` — covers POL-04, POL-05 (mirror `tests/stores/faqs.store.test.ts` if it exists, otherwise create from scratch following AAA pattern)
- [ ] `apps/website/tests/components/PoliciesDefault.test.ts` — covers POL-06

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded static array in Vue component | Strapi-managed collection type | This phase | Editors can update policy text without a code deploy |
| No seeder for policies | `seeders/policies.ts` in bootstrap | This phase | Fresh environments start fully seeded |

---

## Open Questions

1. **`text` vs `richtext` for policy items**
   - What we know: Existing hardcoded content contains HTML `<p>` tags; `AccordionDefault` uses `v-html`
   - What's unclear: Whether `richtext` output from Strapi v5 wraps content in extra HTML or returns it as-is
   - Recommendation: Use `richtext`. Strapi v5 richtext stores content as Markdown by default when using the built-in editor, but allows raw HTML. Alternatively, store as `text` and keep HTML in the seed data — since `AccordionDefault` already renders via `v-html`, either type works as long as the seed data is verbatim HTML. Use `text` for simplicity if the plan only needs to mirror the existing content without WYSIWYG editing.

2. **Whether to add `useAsyncData` `default` option**
   - What we know: CLAUDE.md mandates `default: () => []` to avoid `T | undefined` from inferred type
   - What's unclear: `preguntas-frecuentes.vue` does not include the `default` option (possible omission)
   - Recommendation: Add `default: () => []` to the `useAsyncData` call in `politicas-de-privacidad.vue` to comply with CLAUDE.md. This is a best-practice item, not a blocker.

3. **Whether a `policies` store test file exists to mirror from**
   - What we know: `tests/` directory has `components/`, `middleware/`, `pages/`, `plugins/`, `server/` — no `stores/` subdirectory found
   - What's unclear: Whether there are store-level unit tests elsewhere
   - Recommendation: Create `tests/stores/policies.store.test.ts` from scratch, following the AAA pattern used in component tests.

---

## Sources

### Primary (HIGH confidence)
- Project file: `apps/strapi/src/api/faq/content-types/faq/schema.json` — schema structure reference
- Project file: `apps/strapi/seeders/faqs.ts` — seeder pattern reference
- Project file: `apps/website/app/stores/faqs.store.ts` — store pattern reference
- Project file: `apps/website/app/pages/preguntas-frecuentes.vue` — page + useAsyncData pattern reference
- Project file: `apps/strapi/src/index.ts` — bootstrap + seeder registration pattern
- CLAUDE.md — Nuxt data fetching rules, store persist rules, useApiClient mandate

### Secondary (MEDIUM confidence)
- Strapi v5 factory functions pattern: verified by examining multiple existing API directories (`faq`, `category`, `condition`, `region`)

### Tertiary (LOW confidence)
- None — all findings are from project source files or CLAUDE.md

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use
- Architecture: HIGH — direct mirror of the FAQ implementation already in production
- Pitfalls: HIGH — `text` vs `richtext` and public role permissions verified against Strapi v5 documentation patterns seen in the project; seeder idempotency pattern directly observed in `faqs.ts`

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (stable stack)
