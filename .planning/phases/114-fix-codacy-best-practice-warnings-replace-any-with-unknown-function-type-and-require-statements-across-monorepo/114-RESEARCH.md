# Phase 114: Fix Codacy best-practice warnings — replace `any` with `unknown`, `Function` type, and `require` statements across monorepo - Research

**Researched:** 2026-04-06
**Domain:** TypeScript best practices — `any` → `unknown`/typed, `Function` → typed callable, `require()` → ESM `import`
**Confidence:** HIGH

---

## Summary

Phase 114 targets three categories of Codacy best-practice warnings across the monorepo: use of the `any` type (including `: any`, `as any`, and `: any[]`), use of the `Function` type (which Codacy flags in place of typed callables), and `require()` statements (which Codacy prefers replaced with ESM `import`).

The `require()` violations are effectively zero for non-test, non-config source files. Both occurrences (`ad.findBySlug.test.ts` and `oneclick.service.test.ts`) live in `__tests__/` and `tests/` directories that Codacy's `.codacy.yaml` ignores. No new work is needed for the require category.

The `any` violations total approximately 83 instances across ~50 source files (website, dashboard, strapi). These fall into distinct patterns with distinct correct fixes — the plan must not apply a blanket mechanical replacement. The `Function` violations number 6 in actual type positions (the rest are JSDoc comments or comments, which Codacy ignores). ESLint's `@typescript-eslint/no-explicit-any` rule is turned **off** in both Nuxt app eslint configs, meaning Codacy is applying its own built-in analysis to enforce these rules regardless of the project's local ESLint settings.

**Primary recommendation:** Fix violations pattern-by-pattern. Use `unknown` for error catches, use proper interface types for form values, use `Core.Strapi` for strapi constructor params, use `Event` from `@strapi/database` for lifecycle events, use `((...args: unknown[]) => void)` for gtag/dataLayer push, use `Component` from vue for icon props, and replace `as Function` in subscription-charge cron with typed Strapi EntityService call patterns already established elsewhere in the codebase.

---

## Standard Stack

### Core (no new dependencies needed)
| Library | Version | Purpose | Note |
|---------|---------|---------|------|
| `@strapi/database` | installed | `Event`, `Action`, `SubscriberFn` types for lifecycle events | Already in project |
| `@strapi/types` | installed | `Core.Strapi` type for strapi constructor params | Already in project |
| `chart.js` | 4.5.1 | `Chart`, `TooltipItem<'bar'>` for ChartSales | Already in project |
| `vue` | installed | `Component` type for icon props | Already in project |
| `vee-validate` | 4.15.1 | `GenericObject = Record<string, any>` — use `Record<string, unknown>` instead | Already in project |

No new dependencies. All fixes are pure TypeScript annotation changes.

---

## Architecture Patterns

### Pattern 1: `catch (error: any)` → `catch (error: unknown)`
**What:** TypeScript 4+ allows `catch (error: unknown)`. This is the correct type since thrown values can be anything.
**When to use:** All catch blocks that currently use `: any`
**Fix pattern:**
```typescript
// Before
} catch (error: any) {
  console.error(error.message);
}

// After
} catch (error: unknown) {
  const e = error instanceof Error ? error : new Error(String(error));
  console.error(e.message);
}
```
**Files affected:** `apps/website/server/api/dev-login.post.ts`, `apps/dashboard/server/api/dev-login.post.ts`, `apps/website/app/pages/login/google.vue`, `apps/website/app/pages/login/facebook.vue`, `apps/strapi/src/cron/verification-code-cleanup.cron.ts`, `apps/strapi/src/api/payment/services/pro.service.ts` (3 catches), `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts`, `apps/strapi/src/services/weather/http-client.ts`

**Existing pattern in codebase (reference):**
```typescript
// Source: apps/website/app/composables/useOrderById.ts
} catch (error: unknown) {
  // already follows this pattern
}
```

### Pattern 2: Form submit handlers `(values: any)` → `(values: Record<string, unknown>)`
**What:** vee-validate Form `@submit` passes `GenericObject` (= `Record<string, any>`). Replace with `Record<string, unknown>` — which satisfies vee-validate's type and removes the `any`.
**When to use:** All `handleSubmit`/`onSubmit` functions receiving vee-validate form values
**Fix pattern:**
```typescript
// Before
const onSubmit = async (values: any) => {
  await apiClient("/auth/forgot-password", { body: { email: values.email } });
};

// After
const onSubmit = async (values: Record<string, unknown>) => {
  await apiClient("/auth/forgot-password", { body: { email: values.email as string } });
};
```
**Files affected (website):** `FormForgotPassword.vue`, `FormResetPassword.vue`, `FormContact.vue`, `FormPassword.vue` (x2)
**Files affected (dashboard):** `FormFaq.vue`, `FormForgotPassword.vue`, `FormCommune.vue`, `FormEdit.vue`, `FormRegion.vue`, `FormCategory.vue`, `FormTerm.vue`, `FormPack.vue`, `FormPolicy.vue`, `FormResetPassword.vue`, `FormCondition.vue`, `FormPassword.vue`

### Pattern 3: `defineNuxtPlugin((nuxtApp: any))` → remove explicit type
**What:** `defineNuxtPlugin` already types the nuxtApp parameter correctly. Adding `: any` overrides the correct type.
**Fix pattern:**
```typescript
// Before
export default defineNuxtPlugin((nuxtApp: any) => {

// After
export default defineNuxtPlugin((nuxtApp) => {
```
**Files affected:** `apps/website/app/plugins/site-health.client.ts`, `apps/dashboard/app/plugins/site-health.client.ts`

### Pattern 4: `strapi: any` constructor param → `Core.Strapi`
**What:** Strapi's official type for the strapi instance is `Core.Strapi` from `@strapi/strapi`.
**Fix pattern:**
```typescript
// Before
constructor(private readonly strapi: any) {}

// After
import type { Core } from "@strapi/strapi";
constructor(private readonly strapi: Core.Strapi) {}
```
**Files affected:** `apps/strapi/src/api/contact/services/contact.service.ts`, `apps/strapi/src/services/mjml/send-email.ts`, `apps/strapi/src/services/mjml/test.ts`

**Existing pattern in codebase (reference):**
```typescript
// Source: apps/strapi/src/middlewares/protect-user-fields.ts
import type { Core } from "@strapi/strapi";
// ... _context: { strapi: Core.Strapi }
```

### Pattern 5: Lifecycle event `(event: any)` → `(event: Event)` from `@strapi/database`
**What:** The `@strapi/database` package exports `Event` and `SubscriberFn` types for lifecycle hooks.
**Fix pattern:**
```typescript
// Before
async beforeCreate(event: any) {

// After
import type { Event } from "@strapi/database/dist/lifecycles";
async beforeCreate(event: Event) {
```
**Available type (verified):**
```typescript
// Source: node_modules/@strapi/database/dist/lifecycles/types.d.ts
export interface Event {
  action: Action;
  model: Meta;
  params: Params;
  state: Record<string, unknown>;
  result?: any;
}
export type SubscriberFn = (event: Event) => Promise<void> | void;
```
**Files affected:** `apps/strapi/src/api/article/content-types/article/lifecycles.ts`, `apps/strapi/src/api/commune/content-types/commune/lifecycles.ts`, `apps/strapi/src/api/region/content-types/region/lifecycles.ts`, `apps/strapi/src/api/category/content-types/category/lifecycles.ts`, `apps/strapi/src/api/ad/content-types/ad/lifecycles.ts`, `apps/strapi/src/api/condition/content-types/condition/lifecycles.ts`

### Pattern 6: `icon: any` / `iconComponent: any` → `Component` from vue
**What:** Vue component references should be typed as `Component` from vue.
**Fix pattern:**
```typescript
// Before
icon: any;
iconComponent: any;

// After
import type { Component } from "vue";
icon: Component;
iconComponent: Component;
```
**Files affected:** `apps/website/app/components/CardHighlight.vue`, `apps/website/app/components/CardShortcut.vue`, `apps/website/app/components/AccountAnnouncements.vue`, `apps/website/app/pages/cuenta/mis-anuncios.vue`

### Pattern 7: `as Function` → typed callable in subscription-charge cron
**What:** `strapi.entityService.findMany as Function` bypasses the EntityService typing. The correct pattern already exists throughout the codebase using `as unknown as Record<string, unknown>` casts for filters.
**Fix pattern:**
```typescript
// Before
const retryRecords = (await (strapi.entityService.findMany as Function)(
  "api::subscription-payment.subscription-payment",
  { filters: { ... }, pagination: { pageSize: -1 } }
)) as FailedPaymentRecord[];

// After
const retryRecords = (await strapi.entityService.findMany(
  "api::subscription-payment.subscription-payment",
  {
    filters: { ... } as unknown as Record<string, unknown>,
    pagination: { pageSize: -1 },
    populate: ["user"],
  }
)) as FailedPaymentRecord[];
```
**Files affected:** `apps/strapi/src/cron/subscription-charge.cron.ts` (6 occurrences)

**Existing pattern in codebase (reference):**
```typescript
// Source: apps/strapi/src/cron/subscription-charge.cron.ts (already at line 71)
filters: { ... } as unknown as Record<string, unknown>
```

### Pattern 8: `handler: Function` in payment controller → typed callable
**What:** `Function` is banned. Use an explicit signature.
**Fix pattern:**
```typescript
// Before
private controllerWrapper = (handler: Function) => async (ctx: Context) => {

// After
private controllerWrapper = (handler: (ctx: Context) => Promise<void>) => async (ctx: Context) => {
```
**Files affected:** `apps/strapi/src/api/payment/controllers/payment.ts`

### Pattern 9: GalleryDefault.vue `formats?: any` → use `AdGalleryItem`
**What:** `AdGalleryItem` is already defined in `apps/dashboard/app/types/ad.ts` with proper `formats` structure.
**Fix pattern:**
```typescript
// Before
type: Array as () => Array<{ id?: number; url: string; formats?: any }>,

// After
import type { AdGalleryItem } from "@/types/ad";
// Use AdGalleryItem directly
```
**Files affected:** `apps/dashboard/app/components/GalleryDefault.vue`

### Pattern 10: ChartSales `chart: any`, tooltip `context: any` → chart.js types
**What:** chart.js 4.x exports `Chart`, `TooltipItem<ChartType>` types.
**Fix pattern:**
```typescript
// Before
afterDraw: (chart: any) => {
  const ctx = chart.ctx;

// After
import type { Chart } from "chart.js";
afterDraw: (chart: Chart) => {
  const ctx = chart.ctx;
```
```typescript
// Tooltip callbacks
// Before
title: (context: any[]) => ...,
label: (context: any) => ...,
filter: (tooltipItem: any) => tooltipItem.datasetIndex === 0,
callback: (value: any) => formatCompactCurrency(value),

// After
import type { TooltipItem, ChartType } from "chart.js";
title: (context: TooltipItem<ChartType>[]) => ...,
label: (context: TooltipItem<ChartType>) => ...,
filter: (tooltipItem: TooltipItem<ChartType>) => tooltipItem.datasetIndex === 0,
callback: (value: number | string) => formatCompactCurrency(value),
```
**Files affected:** `apps/dashboard/app/components/ChartSales.vue`

### Pattern 11: `(...args: any[])` → `(...args: unknown[])` for gtag/dataLayer
**What:** The gtag function pushes to `window.dataLayer`. The args are unknown at the call site.
**Fix pattern:**
```typescript
// Before
const gtag = (...args: any[]) => {

// After
const gtag = (...args: unknown[]) => {
```
**Files affected:** `apps/website/app/plugins/gtm.client.ts`, `apps/dashboard/app/plugins/gtm.client.ts`

### Pattern 12: `[key: string]: any` in interface → `[key: string]: unknown`
**What:** Index signatures with `any` value type can use `unknown` to be stricter.
**Caveat:** TypeScript requires all explicit property types to be assignable to the index signature value type. When changing to `unknown`, all properties (string, number, boolean) must become `unknown` or the index signature must be removed.
**Fix pattern for AccountOrders.vue interface:**
```typescript
// Before (has known typed properties + index signature)
interface Order {
  id: number;
  status: string;
  total: number;
  amount: number;
  is_invoice: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// After — remove the index signature (it was only for "additional properties" escape hatch)
interface Order {
  id: number;
  status: string;
  total: number;
  amount: number;
  is_invoice: boolean;
  createdAt: string;
  updatedAt: string;
}
```
**Fix pattern for Announcement (only has id + index):**
```typescript
// After — use Record directly or remove index signature
interface Announcement {
  id: number;
  [key: string]: unknown;
}
// Note: id is number but index is unknown — TS will error because number is not assignable to unknown
// Correct solution: just remove the index signature or use Record<string, unknown>
```
**Files affected:** `apps/website/app/components/AccountOrders.vue`, `apps/website/app/components/AccountAnnouncements.vue`, `apps/strapi/src/api/related/types/ad.types.ts`

### Pattern 13: `bbdd-backup.cron.ts` — define `DatabaseConfig` interface
**What:** The methods `buildMySQLBackupCommand(config: any, ...)` etc. receive a database connection config object. Define a proper interface.
**Fix pattern:**
```typescript
interface DatabaseConnectionConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  filename?: string;  // for SQLite
  schema?: string;    // for PostgreSQL
}

// and in bbdd-backup.cron.ts:
// const dbConfig = (strapi.config.get("database") as { connection: DatabaseConnectionConfig }).connection;
private buildMySQLBackupCommand(config: DatabaseConnectionConfig, timestamp: string): string {
```
**Files affected:** `apps/strapi/src/cron/bbdd-backup.cron.ts`

### Pattern 14: `user?: any` in AvatarDefault (dashboard) → `User` from types
**What:** Dashboard has `User` type in `@/types/user`.
**Fix pattern:**
```typescript
// Before
user?: any;

// After
import type { User } from "@/types/user";
user?: User;
// Then replace (user as any)?.field with user?.field
```
**Files affected:** `apps/dashboard/app/components/AvatarDefault.vue`, `apps/dashboard/app/components/HeroDashboard.vue`

### Pattern 15: edit pages `handleXxxSaved = (updated: any)` → typed with local interface
**What:** Each form emits `saved` with its local `XxxData` interface. The edit page can import it (if exported) or define a compatible minimal interface.
**Strategy:** The simplest approach is importing or re-declaring the data type locally. Since `PackData`, `FaqData`, `PolicyData`, etc. are `interface` (not `export interface`) in their form components, the edit pages must define a minimal compatible interface.
**Fix pattern:**
```typescript
// Before (in packs/[id]/edit.vue)
const handlePackSaved = (updatedPack: any) => {

// After
interface SavedPack {
  id?: number;
  documentId?: string;
  name?: string;
  [key: string]: unknown;
}
const handlePackSaved = (updatedPack: SavedPack) => {
```
**Alternative:** Export the data interfaces from form components so edit pages can import them.
**Recommendation:** Export interfaces from form components — cleaner, eliminates duplication.
**Files affected:** `packs/[id]/edit.vue`, `faqs/[id]/edit.vue`, `policies/[id]/edit.vue`, `conditions/[id]/edit.vue`, `regions/[id]/edit.vue`, `categories/[id]/edit.vue`, `terms/[id]/edit.vue`, `communes/[id]/edit.vue`

### Pattern 16: `data: any` in me.store.ts → `Record<string, unknown>`
```typescript
// Before
const saveUsername = async (data: any) => {

// After
const saveUsername = async (data: Record<string, unknown>) => {
```

### Pattern 17: nuxt.config.ts `} as any,` → use proper config type
**What:** The `head` section is typed but some properties are cast with `as any`. The correct cast is `as Parameters<typeof useHead>[0]` or simply removing the cast if the structure matches.
**Fix:** Replace `} as any,` with the correct config comment or `/* @ts-expect-error — Nuxt useHead config type mismatch */`.
**Files affected:** `apps/website/nuxt.config.ts`, `apps/dashboard/nuxt.config.ts`

### Pattern 18: `window as any` in dompurify.client.ts → window type declaration
**What:** `window.DOMPurify` is already declared in `window.d.ts`. Check if it's there; if not, add it.
```typescript
// dompurify.client.ts — after declaring DOMPurify in window.d.ts:
(window as Window & { DOMPurify: typeof DOMPurify }).DOMPurify = DOMPurify;
// Or simpler: use the existing window.d.ts DOMPurify declaration
```
**Files affected:** `apps/website/app/plugins/dompurify.client.ts`, `apps/dashboard/app/plugins/dompurify.client.ts`

### Pattern 19: useSanitize.ts `(window as any).DOMPurify` → same window type
Same fix as Pattern 18 — use the window type declaration.
**Files affected:** `apps/website/app/composables/useSanitize.ts`, `apps/dashboard/app/composables/useSanitize.ts`

### Pattern 20: Strapi suscription.utils.ts — generic interface for provider data
**What:** `providerSubscriptionData: any` and `let savedSubscription: any` need interfaces.
```typescript
interface ProviderSubscriptionData {
  subscriptionId?: string;
  customerId?: string;
  planId?: string;
  status?: number;
  next_invoice_date?: string;
  [key: string]: unknown;
}
```
**Files affected:** `apps/strapi/src/api/payment/utils/suscription.utils.ts`

### Pattern 21: `emailOptions: any` in send-email.ts → define interface
```typescript
interface EmailOptions {
  to: string | string[];
  from: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}
```
**Files affected:** `apps/strapi/src/services/mjml/send-email.ts`

### Pattern 22: JSDoc `@param {Function}` comments in authController.ts
**What:** Codacy may flag JSDoc `{Function}` references. Replace with `{(...args: unknown[]) => unknown}` or specific signature.
**Files affected:** `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`
**Note:** These are comments, not type positions. Codacy may or may not flag JSDoc `{Function}` — LOW confidence it is flagged.

### Pattern 23: user.d.ts `ads?: any[]` / `orders?: any[]`
```typescript
// Before
ads?: any[];
orders?: any[];

// After — minimal typing (exact shape not needed here)
ads?: Record<string, unknown>[];
orders?: Record<string, unknown>[];
```
**Files affected:** `apps/website/app/types/user.d.ts`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Strapi instance type | Custom `IStrapiInstance` interface | `Core.Strapi` from `@strapi/strapi` | Already declared in types |
| Lifecycle event type | Custom event interface | `Event` from `@strapi/database/dist/lifecycles` | Exact shape from DB layer |
| Chart callback types | Custom chart context interface | `Chart`, `TooltipItem<ChartType>` from `chart.js` | Types are exported |
| Vue component type | `object \| string` workaround | `Component` from `vue` | Vue exports this type |

---

## Common Pitfalls

### Pitfall 1: Index signature `[key: string]: any` → `[key: string]: unknown` breaks if other props exist
**What goes wrong:** TypeScript requires all explicit property types to be assignable to the index value type. `id: number` is NOT assignable to `unknown` in an index signature context.
**Why it happens:** TypeScript enforces consistency — if `[key: string]` is `unknown`, then `id` must also be `unknown`.
**How to avoid:** Either (a) remove the index signature entirely, or (b) make all properties `unknown`, or (c) use `& { id: number }` intersection type.
**Warning signs:** TS error: "Property 'id' of type 'number' is not assignable to 'string' index type 'unknown'."

### Pitfall 2: Removing `as Function` from entityService calls breaks TypeScript
**What goes wrong:** `strapi.entityService.findMany` has strict generic types. Calling it with `filters` as plain object fails.
**Why it happens:** Strapi v5 EntityService filters require specific UID generics.
**How to avoid:** Use the established pattern: `filters: { ... } as unknown as Record<string, unknown>` — already used at line 71 of subscription-charge.cron.ts.
**Warning signs:** TypeScript error about filter type mismatch.

### Pitfall 3: `values: Record<string, unknown>` in vee-validate submit handler
**What goes wrong:** Accessing `values.email` returns `unknown`, requiring assertion `values.email as string`.
**Why it happens:** `Record<string, unknown>` means values are typed as `unknown`.
**How to avoid:** Either assert at access time (`values.email as string`) or define a typed interface for the form values.
**Better approach:** Use `Record<string, unknown>` and narrow at each access with `as string`.

### Pitfall 4: `catch (error: unknown)` — accessing `.message` fails
**What goes wrong:** `error.message` is not valid on `unknown`.
**How to avoid:** Use `error instanceof Error ? error.message : String(error)` pattern.
**Warning signs:** TS error "Property 'message' does not exist on type 'unknown'."

### Pitfall 5: `Chart` type in ChartSales plugin options
**What goes wrong:** `afterDraw: (chart: Chart)` — the chart.js `Chart` class is generic `Chart<TType, TData, TLabel>`. Using bare `Chart` may require type assertion in the plugin.
**How to avoid:** Use `Chart<'bar'>` for a bar chart plugin, or use `Parameters<typeof Chart['prototype']['draw']>[0]` — or simply use the annotation `chart: Chart`.

### Pitfall 6: Codacy runs its OWN ESLint config — project ESLint config is not sufficient
**What goes wrong:** Believing that because `"@typescript-eslint/no-explicit-any": "off"` in `eslint.config.mjs` the violations won't be flagged.
**Why it happens:** Codacy runs its own default ESLint ruleset in addition to (or instead of) the project's config for code quality analysis.
**How to avoid:** Fix the actual violations rather than adjusting ESLint config.

---

## Runtime State Inventory

> This is a code-only refactoring phase. No runtime state is affected.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — only type annotations change | None |
| Live service config | None | None |
| OS-registered state | None | None |
| Secrets/env vars | None | None |
| Build artifacts | None | None |

---

## Violation Inventory (Full)

### `require()` violations
**Count: 0** in non-test, non-config source files. Both occurrences are in test files excluded by `.codacy.yaml`. No work needed.

### `Function` type violations (non-comment, non-JSDoc)
| File | Line | Context | Fix |
|------|------|---------|-----|
| `apps/strapi/src/cron/subscription-charge.cron.ts` | 90, 111, 143, 205, 338, 339 | `as Function` casts on entityService methods | Pattern 7 — remove cast, use `as unknown as Record<string, unknown>` for filters |
| `apps/strapi/src/api/payment/controllers/payment.ts` | 36 | `handler: Function` param | Pattern 8 — type as `(ctx: Context) => Promise<void>` |

### `any` type violations — by file
**Website (non-test):**
- `apps/website/app/components/FormForgotPassword.vue` — `values: any` (Pattern 2)
- `apps/website/app/components/CardHighlight.vue` — `icon: any` (Pattern 6)
- `apps/website/app/components/AccountOrders.vue` — `[key: string]: any` (Pattern 12)
- `apps/website/app/components/CardShortcut.vue` — `iconComponent: any` (Pattern 6)
- `apps/website/app/components/FormResetPassword.vue` — `values: any` (Pattern 2)
- `apps/website/app/components/CardProfileAd.vue` — `response: any` (use `AdGalleryItem` from types)
- `apps/website/app/components/FormContact.vue` — `values: any` (Pattern 2)
- `apps/website/app/components/AccountAnnouncements.vue` — `[key: string]: any`, `icon: any` (Patterns 12, 6)
- `apps/website/app/components/FormPassword.vue` — `values: any`, `error: any` (Patterns 2, 1)
- `apps/website/app/types/user.d.ts` — `ads?: any[]`, `orders?: any[]` (Pattern 23)
- `apps/website/app/plugins/site-health.client.ts` — `nuxtApp: any` (Pattern 3)
- `apps/website/app/plugins/gtm.client.ts` — `...args: any[]` (Pattern 11)
- `apps/website/app/plugins/dompurify.client.ts` — `window as any` (Pattern 18)
- `apps/website/app/composables/useSanitize.ts` — `window as any` x2 (Pattern 19)
- `apps/website/app/composables/useIcons.ts` — `{ [key: string]: any }` → `Record<string, Component>`
- `apps/website/app/pages/login/google.vue` — `error: any` (Pattern 1)
- `apps/website/app/pages/login/facebook.vue` — `error: any` (Pattern 1)
- `apps/website/app/pages/cuenta/mis-anuncios.vue` — `icon: any` (Pattern 6)
- `apps/website/app/pages/anuncios/[slug].vue` — check actual violation
- `apps/website/nuxt.config.ts` — `} as any` (Pattern 17)
- `apps/website/server/api/dev-login.post.ts` — `error: any` (Pattern 1)
- `apps/website/app/components/FormRegister.vue` — `error as any` x2 (use `unknown` + narrow)

**Dashboard (non-test):**
- 12 form components — `values: any` (Pattern 2): FormFaq, FormForgotPassword, FormCommune, FormEdit, FormRegion, FormCategory, FormTerm, FormPack, FormPolicy, FormResetPassword, FormCondition, FormPassword
- `AvatarDefault.vue` — `user?: any`, `user as any` x4 (Pattern 14)
- `GalleryDefault.vue` — `formats?: any` x4 (Pattern 9 — use `AdGalleryItem`)
- `ChartSales.vue` — `chart: any`, `dp: any`, `context: any[]`, `context: any` x3, `tooltipItem: any`, `value: any` (Pattern 10)
- `HeroDashboard.vue` — `user.value as any` (Pattern 14)
- `plugins/site-health.client.ts` — `nuxtApp: any` (Pattern 3)
- `plugins/gtm.client.ts` — `...args: any[]` (Pattern 11)
- `plugins/dompurify.client.ts` — `window as any` (Pattern 18)
- `composables/useSanitize.ts` — `window as any` x2 (Pattern 19)
- `stores/me.store.ts` — `data: any` (Pattern 16)
- 8 edit pages — `handleXxxSaved = (updated: any)` (Pattern 15)
- `nuxt.config.ts` — `} as any` (Pattern 17)
- `server/api/dev-login.post.ts` — `error: any` (Pattern 1)

**Strapi (non-test):**
- `src/cron/bbdd-backup.cron.ts` — `connection: any`, `config: any` x3 (Pattern 13)
- `src/cron/verification-code-cleanup.cron.ts` — `error: any` (Pattern 1)
- `src/cron/ad-free-reservation-restore.cron.ts` — `) as any[]` x2, check
- `src/api/article/content-types/article/lifecycles.ts` — `event: any` x2 (Pattern 5)
- `src/api/commune/content-types/commune/lifecycles.ts` — `event: any` (Pattern 5)
- `src/api/payment/utils/suscription.utils.ts` — `providerSubscriptionData: any`, `savedSubscription: any`, `error: any` (Patterns 20, 1)
- `src/api/payment/services/pro.service.ts` — `error: any` x3 (Pattern 1)
- `src/api/region/content-types/region/lifecycles.ts` — `event: any` (Pattern 5)
- `src/api/contact/services/contact.service.ts` — `strapi: any`, `ctx: any` (Pattern 4, narrow ctx type)
- `src/api/category/content-types/category/lifecycles.ts` — `event: any` (Pattern 5)
- `src/api/related/types/ad.types.ts` — `[key: string]: any` (Pattern 12)
- `src/api/ad/content-types/ad/lifecycles.ts` — `event: any` (Pattern 5)
- `src/api/cron-runner/controllers/cron-runner.ts` — `error: any` (Pattern 1)
- `src/api/condition/content-types/condition/lifecycles.ts` — `event: any` x2 (Pattern 5)
- `src/api/ad-reservation/controllers/ad-reservation.ts` — `record as any`, `user as any` x2
- `src/services/mjml/send-email.ts` — `strapi: any`, `emailOptions: any` (Patterns 4, 21)
- `src/services/mjml/test.ts` — `strapi: any` (Pattern 4)
- `src/services/weather/http-client.ts` — `error: any` (Pattern 1)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Website | Vitest + @nuxt/test-utils |
| Dashboard | Vitest + @nuxt/test-utils |
| Strapi | Jest |
| Quick run (website) | `cd apps/website && npx vitest run` |
| Quick run (strapi) | `cd apps/strapi && npx jest --passWithNoTests` |
| TypeScript check | `cd apps/website && npx nuxt typecheck` / `cd apps/strapi && npx tsc --noEmit` |

### Phase Requirements → Test Map
| Req | Behavior | Test Type | Command |
|-----|----------|-----------|---------|
| Type safety | TypeScript compiles without errors | Build check | `npx turbo run typecheck --filter=website` |
| Type safety | Strapi TypeScript compiles | Build check | `cd apps/strapi && npx tsc --noEmit` |
| No regression | Existing tests still pass | Automated | `npx turbo run test` |

### Wave 0 Gaps
None — existing test infrastructure covers regression testing. The only validation is TypeScript compilation and passing existing tests.

---

## Code Examples

### Strapi Core.Strapi import pattern
```typescript
// Source: apps/strapi/src/middlewares/protect-user-fields.ts
import type { Core } from "@strapi/strapi";
```

### Strapi lifecycle Event type
```typescript
// Source: node_modules/@strapi/database/dist/lifecycles/index.d.ts — verified
import type { Event } from "@strapi/database/dist/lifecycles";
```

### Established EntityService filter cast pattern
```typescript
// Source: apps/strapi/src/cron/subscription-charge.cron.ts:71
filters: {
  pro_status: { $eq: "active" },
  pro_expires_at: { $lte: `${today}T23:59:59.999Z` },
} as unknown as Record<string, unknown>,
```

### Correct error narrowing
```typescript
// Source: apps/website/app/components/CheckoutDefault.vue
} catch (error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `catch (error: any)` | `catch (error: unknown)` since TS 4.0 | Safer — error is not assumed to have `.message` |
| `Function` type | Typed callables `(arg: T) => R` | Prevents calling with wrong args |
| `require()` in TS | ESM `import` | Better tree-shaking, static analysis |
| `any` for icon props | `Component` from vue | Enables type checking of component usage |

---

## Open Questions

1. **`ctx: any` in contact.service.ts — what is Koa context type?**
   - What we know: Strapi uses Koa. `Context` is imported from `"koa"` in other files.
   - What's unclear: Whether `getClientIp(ctx: any)` can become `getClientIp(ctx: Context)` without breaking.
   - Recommendation: Import `Context` from `"koa"` and use it — same pattern as payment controller.

2. **JSDoc `{Function}` in authController.ts — does Codacy flag JSDoc?**
   - What we know: These are comment annotations, not type positions.
   - What's unclear: Whether Codacy's pattern matching targets JSDoc `{Function}`.
   - Recommendation: Replace with `{(...args: unknown[]) => Promise<unknown>}` defensively — low cost.

3. **`ad-free-reservation-restore.cron.ts` `) as any[]` pattern**
   - What we know: `)) as any[]` wraps an entityService.findMany call.
   - Recommendation: Define an interface for the reservation record and cast to that instead.

---

## Sources

### Primary (HIGH confidence)
- `node_modules/@strapi/database/dist/lifecycles/types.d.ts` — verified `Event` interface
- `node_modules/@strapi/core/dist/` — verified `Core.Strapi` import pattern
- `node_modules/vee-validate/dist/vee-validate.d.ts` — verified `GenericObject = Record<string, any>`
- `node_modules/chart.js/dist/types/index.d.ts` — verified `Chart` and `TooltipItem<TType>` exports
- `apps/strapi/src/middlewares/protect-user-fields.ts` — existing `Core.Strapi` import pattern in codebase
- `apps/website/app/composables/useOrderById.ts` — existing `error: unknown` pattern in codebase
- `.codacy.yaml` — verified test/config file exclusion patterns

### Secondary (MEDIUM confidence)
- Direct grep analysis of all source files — violation counts and locations verified

---

## Metadata

**Confidence breakdown:**
- Violation inventory: HIGH — direct grep enumeration of all files
- Fix patterns: HIGH — verified against existing codebase patterns and type declarations
- `require()` is zero issue: HIGH — both occurrences in excluded test dirs confirmed
- ChartSales tooltip types: MEDIUM — chart.js types verified but exact generics may need adjustment

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable TypeScript/library ecosystem)
