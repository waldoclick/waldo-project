# Coding Conventions

**Analysis Date:** 2026-06-10

## Naming Patterns

**Files:**
- Vue components: `PascalCase.vue` — e.g. `CardPack.vue`, `FormLogin.vue`, `ResumeOrder.vue`
- Pages: `kebab-case.vue` — e.g. `preguntas-frecuentes.vue`, `restablecer-contrasena.vue`
- Composables: `camelCase.ts` prefixed with `use` — e.g. `useApiClient.ts`, `useAdAnalytics.ts`
- Pinia stores: `camelCase.store.ts` — e.g. `user.store.ts`, `terms.store.ts`
- Type files (website): `camelCase.d.ts` or `camelCase.ts` under `app/types/` — e.g. `pack.d.ts`, `subscription-pro.ts`
- Strapi services: `{domain}.service.ts` — e.g. `ad.service.ts`, `pro-cancellation.service.ts`
- Strapi types: `{domain}.types.ts` — e.g. `payment.type.ts`, `groq.types.ts`, `oneclick.types.ts`
- Strapi crons: `{domain}-{function}.cron.ts` — e.g. `subscription-charge.cron.ts`, `ad-expiry.cron.ts`
- Strapi utils: `{domain}.utils.ts` — e.g. `order.utils.ts`, `general.utils.ts`
- SCSS: `_component.scss` with underscore prefix under `app/scss/components/`

**Functions:**
- `camelCase` verbs + noun — e.g. `loadUserAdCounts`, `validatePayment`, `stripProtectedFields`, `getPaymentGateway`
- Composables return an object — e.g. `return { logout }`, `return { pushEvent }`
- Async functions named after action — e.g. `loadTerms`, `packPurchase`, `processPaidWebpay`

**Variables:**
- `camelCase` — e.g. `mockClient`, `freeAdReservationCredits`, `isPaymentRequiredChecked`
- Constants: `UPPER_SNAKE_CASE` — e.g. `PROTECTED_USER_FIELDS`, `DEFAULT_PAGINATION`, `GATEWAY_ENV_REQUIREMENTS`, `MUTATING_METHODS`, `STATUS_ENDPOINT_MAP`

**Types and Interfaces:**
- Interfaces in Strapi use `PascalCase` with `I` prefix — e.g. `IPaymentGateway`, `IGroqService`, `ICronjobResult`, `IOneclickStartResponse`
- Interfaces in website typically use plain `PascalCase` without prefix — e.g. `AppState`, `OrderData`
- Type aliases use `PascalCase` — e.g. `PackType`, `FeaturedType`, `MutatingMethod`
- Strapi service classes: `PascalCase` — e.g. `AdService`, `GroqService`, `SubscriptionChargeService`

## Code Style

**Formatting:**
- No standalone Prettier config detected; formatting enforced through ESLint rules
- `@nuxt/eslint` provides base rules for website (`apps/website/eslint.config.mjs`)
- Single quotes for strings; trailing commas enforced

**Linting:**
- ESLint with `eslint-plugin-unicorn` enabled for website
- Key unicorn rules enforced: `prefer-array-find`, `prefer-includes`, `prefer-string-slice`, `no-array-reduce`, `no-array-for-each`, `no-for-loop`, `prefer-ternary`
- `no-console` is `off` in development, `warn` in staging, `error` in production
- `@typescript-eslint/no-unused-vars` is `"off"` in ESLint — but Codacy enforces removal; never rename to `_` prefix as workaround
- `@typescript-eslint/no-explicit-any` is `"off"` — explicit `any` allowed but must be documented

## Import Organization

**Order (Vue components):**
1. Vue core imports — `import { computed } from "vue"`
2. Router/framework imports — `import { useRouter } from "vue-router"`
3. Type imports — `import type { Pack } from "@/types/pack"`
4. Store imports — `import { useAdStore } from "@/stores/ad.store"`
5. Composable imports — `import { useSanitize } from "@/composables/useSanitize"`

**Path Aliases:**
- `@/` resolves to `apps/website/app/` (configured in vitest and Nuxt)
- `~/` resolves to `apps/website/` project root
- `#imports` — Nuxt virtual module for auto-imported composables (mocked in tests via `vi.mock("#imports", ...)`)
- `#app` — Nuxt virtual module for app utilities (mocked in tests via `vi.mock("#app", ...)`)

**Strapi barrel pattern:**
- Each service directory has an `index.ts` re-exporting everything
- Other modules import from `index.ts` only, never from individual files
- Example: `import PaymentUtils from "../utils"` (not `../utils/general.utils`)

## Error Handling

**Nuxt stores — silent catch returning safe defaults:**
```typescript
try {
  const response = await client(endpoint, { method: "GET", ... });
  ads.value = typed.data;
} catch {
  ads.value = [];
  return null;
}
```

**Strapi services — structured result objects:**
```typescript
return { success: false, message: "No free credits available" }
return { success: true, isPaymentRequired: isPaymentRequiredChecked }
```

**Strapi/Nuxt server — throw with statusCode:**
```typescript
throw createError({ statusCode: 400, statusMessage: "Missing token" })
```

**General:**
- Empty `catch {}` is allowed by ESLint (`"no-empty": "off"`)
- No global error boundary; individual try/catch per async operation
- Errors in stores return `null` or set state to empty arrays; they do not re-throw

## TypeScript Cast Patterns

Standard Strapi SDK v5 workarounds used consistently:
```typescript
params as Record<string, unknown>
response as unknown as { data: T[] }
filters: { ... } as unknown as Record<string, unknown>
payload as unknown as Parameters<...>[N]
```
These casts exist because `@nuxtjs/strapi` v2 types are loose. Do not remove them when reading existing code.

## Logging

**Website:** `console.error()` in store catch blocks (allowed in dev). Structured logging via `apps/website/app/composables/useLogger.ts` for composables that need it.

**Strapi:** Logger via `apps/strapi/src/utils/logtail/index.ts`. Always import as:
```typescript
import logger from "../../../utils/logtail";
// Usage
logger.info("message");
logger.warn("message");
logger.error("message");
```
Do not use `console.log` in Strapi services or controllers. Strapi middlewares may use `console.warn()` for audit-level field-stripping messages.

## Comments

**When to comment:**
- File-level header block for non-obvious modules explaining purpose and constraints (see `apps/strapi/src/middlewares/protect-user-fields.ts`)
- JSDoc on public service methods — `@param`, `@returns` (reference: `AdService.validatePayment` in `apps/strapi/src/api/payment/services/ad.service.ts`)
- Inline comments for TypeScript workarounds, SSR-specific paths, or non-obvious business logic
- Horizontal rule separators in long test files: `// ─── Section Name ───────────────────`

**Language rule:**
- All code identifiers, type names, comments in new code: **English**
- UI-visible text and error messages shown to end users: **Spanish**
- Legacy SCSS files contain some Spanish comments — do not add new Spanish code comments

## Vue Component Design

**Script setup (mandatory):**
```vue
<script setup lang="ts">
// Always use <script setup lang="ts"> — never Options API
</script>
```

**Props:**
```typescript
const props = defineProps<{
  pack: Pack;
  allPacks: Pack[];
}>();
```

**Pages are composition-only:**
```vue
<template>
  <FaqDefault :faqs="faqs || []" />
</template>
<script setup lang="ts">
import FaqDefault from "@/components/FaqDefault.vue";
definePageMeta({ layout: "about" });
const faqsStore = useFaqsStore();
const { data: faqs } = await useAsyncData("faqs", async () => {
  await faqsStore.loadFaqs();
  return faqsStore.faqs || [];
});
</script>
```
Pages never contain HTML sections or BEM classes directly — they import and arrange components only.

**Data fetching in pages — `useAsyncData` only:**
```typescript
const { data: faqs } = await useAsyncData(
  "faqs",                          // unique key per page
  async () => { ... },
  { default: () => [] },           // always provide default to avoid T | undefined
);
```

**Data fetching in components — `watch` only:**
```typescript
watch(() => props.id, fetchData, { immediate: true });
// Never pair with onMounted
```

## Pinia Store Design

**Setup store pattern (used throughout):**
```typescript
export const useTermsStore = defineStore("terms", () => {
  const terms = ref<Term[]>([]);
  const loading = ref<boolean>(false);
  const client = useApiClient();

  const loadTerms = async () => { ... };

  return { terms, loading, loadTerms };
});
```

**Persist audit comment (mandatory when using `persist`):**
```typescript
// persist: CORRECT — brief rationale
persist: { ... }
```

**Cache guard pattern (required when persist is used):**
```typescript
// State
const lastFetchTimestamp = ref<number>(0);

// Guard check before fetch
if (items.value.length > 0 && Date.now() - lastFetchTimestamp.value < TTL) return;
```

## CSS / SCSS Conventions

**BEM Structure:**
- Block + modifier on root element: `class="card card--pack"`
- All children under modifier namespace: `.card--pack__price`, `.card--pack__link`
- Sub-elements: `.card--pack__link__button`
- SCSS nesting mirrors HTML hierarchy exactly — siblings in HTML → siblings in SCSS

**Forbidden:**
- Standalone hyphenated class names (`lightbox-backdrop`, `section-user`) — not valid BEM
- `box-shadow` or `transform: scale` on elements
- Colors outside the brand palette defined in CLAUDE.md

**SCSS imports:**
```scss
@use "../abstracts/mixins" as *;
@use "../abstracts/variables" as *;
```

**File location:** `apps/website/app/scss/components/_name.scss` — one file per semantic block, underscore-prefixed. All components import shared variables via `@use`.

---

*Convention analysis: 2026-06-10*
