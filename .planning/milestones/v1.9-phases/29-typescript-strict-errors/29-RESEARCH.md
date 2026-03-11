# Phase 29: TypeScript Strict Errors - Research

**Researched:** 2026-03-07
**Domain:** TypeScript / Nuxt 4 / Vue 3 type augmentation
**Confidence:** HIGH (all findings from direct source inspection)

## Summary

Phase 28 predicted 183 errors; the current `npx nuxt typecheck` run confirms exactly 183 errors across
55 files. None were fixed in the interim. The errors cluster into 9 distinct fix patterns — most require
augmenting existing type definitions or fixing incorrect API usage, not rewriting logic. Every error
category has a clear, low-risk fix. The biggest single investment is the `$setSEO` plugin signature
(`url` field missing) which affects ~20 files but is a one-line type fix + mass call-site update.

**Primary recommendation:** Fix by category in order of leverage — global type declarations first
(Window, plugin injectables, Strapi user), then type definition gaps (FilterCategory, Ad/Announcement
mismatch), then per-file call-site corrections (createError, useSeoMeta url, `any[]` inferences).

---

## Error Inventory (183 confirmed errors, 2026-03-07)

Breakdown from actual `npx nuxt typecheck` output:

| # | Category | Count | Files | Root Cause |
|---|----------|-------|-------|------------|
| A | `window.dataLayer` missing | 7 | gtm.client.ts, useAdAnalytics.ts, LightboxCookies.vue | Window not extended for GTM |
| B | `window.google` missing | 3 | useGoogleOneTap.ts | Window not extended for Google Identity |
| C | `$recaptcha` is unknown | 5 | FormContact, FormForgotPassword, FormPassword, FormRegister, FormResetPassword | Plugin inject type missing |
| D | `$cookies` is unknown | 4 | LightboxCookies, LightboxRegister | Plugin inject type missing (cookie.client.js is plain JS) |
| E | `$checkSiteHealth` is unknown | 1 | LightboxAdblock | Plugin inject type missing |
| F | Strapi user missing custom fields | ~14 | AccountMain, cuenta/avatar, cuenta/cover, cuenta/username, MenuUser (via User import) | useStrapiUser() returns SDK base type; needs `<User>` generic and module augment |
| G | `useSeoMeta({ url: ... })` — unknown property | ~20 | 15+ pages and components | `$setSEO` plugin type declares no `url` param; call sites pass `url` which plugin ignores |
| H | `createError({ description: ... })` — unknown property | ~12 | [slug].vue, anunciar/gracias, contacto/gracias, cuenta/*, FormResetPassword | Nuxt `createError` type has no `description`; use `statusMessage` instead |
| I | `FilterCategory` missing color/icon/count | 5 | CategoryArchive.vue | FilterCategory type is narrow; actual API data has more fields |
| J | `Ad.category` is `number` but used as object | ~10 | RelatedAds, anuncios/index | Ad.category typed as `number`; actual populated API returns object |
| K | `useColor.ts` possibly-undefined array access | 12 | useColor.ts | `hex[n]` on string indexed — need non-null assertions |
| L | Missing module imports | 5 | [slug].vue×4, SidebarAccount, MenuUser, preguntas-frecuentes, contacto/index | Import path without `.vue` extension on some; one is `@/interfaces/user.interface` (wrong path) |
| M | `user.store.ts` username filter cast | 1 | user.store.ts | Strapi filter type mismatch for string field |
| N | `anunciar/gracias.vue` multi-errors | 9 | anunciar/gracias.vue | `prepareSummary` returns null not `Record<string,any>` &#124; undefined; arithmetic on Date objects; NuxtError.description missing |
| O | `packs/gracias.vue` multi-errors | 12 | packs/gracias.vue | `getPackById` returns `{} | undefined`; fields missing from inferred type |
| P | `anuncios/[slug].vue` multi-errors | 5 | anuncios/[slug].vue | currency cast, `result.data.result`, `String.fromCharCode` number arg |
| Q | `anuncios/index.vue` multi-errors | 6 | anuncios/index.vue | Conflicting Category import; `relatedAds any[]`; `commune.id` on number |
| R | `AccountOrders` Order type | 1 | AccountOrders.vue | Local Order missing `amount`/`is_invoice` vs. some other Order type |
| S | `SearchDefault.vue` watch overload | 1 | SearchDefault.vue | Watch callback type signature mismatch |
| T | `login/facebook.vue` errors | 2 | login/facebook.vue | `access_token` may be array; `error` is unknown |
| U | `microdata.ts` script children | 1 | microdata.ts | `useHead` script object `children` not recognized |
| V | `recaptcha.client.ts` then-callback | 1 | recaptcha.client.ts | Promise<unknown> vs. typed grecaptcha |
| W | `MenuAuth.vue` cls index | 1 | MenuAuth.vue | Object literal indexed with string — needs explicit typing |
| X | `MobileBar.vue`/`MenuUser.vue` implicit any | 2 | Both | `.then(result =>` without param type |
| Y | `FormRegister.vue` string|undefined | 1 | FormRegister.vue | register payload field typed string, value may be undefined |
| Z | `useRut.ts` string|undefined | 1 | useRut.ts | body[i] may be undefined |
| AA | `index.vue` undefined not assignable | 3 | pages/index.vue | useAsyncData returns T|undefined; props expect T |

---

## Detailed Fix Patterns

### Fix A+B: Extend Window interface (dataLayer, google)

**Location:** Create `apps/website/app/types/window.d.ts` (new file)

**What to add:**
```typescript
// apps/website/app/types/window.d.ts
export {};

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    google: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (callback: (notification: GoogleOneTapNotification) => void) => void;
        };
      };
    };
    googleOneTapInitialized?: boolean;
    handleCredentialResponse?: (response: { credential: string }) => void;
  }
}

interface GoogleOneTapNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}
```

The `recaptcha.client.ts` already declares `window.grecaptcha` in a local `declare global` block —
leave that in place and just extend with the missing fields.

**Confidence:** HIGH — this is the standard Nuxt pattern for extending Window.

---

### Fix C+D+E: Type plugin injectables

**Location:** `apps/website/app/types/plugins.d.ts` (new file)

Plugin `cookie.client.js` uses `js-cookie` (Cookies object). Plugin `site-health.client.ts` provides
`checkSiteHealth`. Plugin `recaptcha.client.ts` provides `recaptcha.execute`.

```typescript
// apps/website/app/types/plugins.d.ts
import type Cookies from "js-cookie";

declare module "#app" {
  interface NuxtApp {
    $cookies: typeof Cookies;
    $checkSiteHealth: () => Promise<{
      hasError: boolean;
      errorDetails: Array<{ type: string; message: string }>;
    }>;
    $recaptcha: {
      execute: (action: string) => Promise<string>;
    };
  }
}

export {};
```

**Note:** `$setSEO` and `$setStructuredData` are already declared in their respective plugin files
(`seo.ts` and `microdata.ts`). No duplication needed.

**Confidence:** HIGH — augmenting `#app` NuxtApp interface is the documented Nuxt pattern.

---

### Fix F: Strapi user type augmentation

**Current situation:** `useStrapiUser()` returns the base Strapi SDK type (only id, username, email,
provider, confirmed, blocked, createdAt, updatedAt). Custom fields `firstname`, `lastname`, `pro`, etc.
are on our `User` type in `app/types/user.d.ts`.

**How it works in the codebase already:** `MenuUser.vue` correctly uses `useStrapiUser<User>()` (with
the generic). `AccountMain.vue` and `cuenta/*.vue` pages use it without the generic, or access
`useStrapi().user` which returns the untyped base.

**Fix:** Module augment the `@nuxtjs/strapi` package to merge our custom fields into their base user type.

```typescript
// In apps/website/app/types/strapi.d.ts (extend existing file)
declare module "@nuxtjs/strapi" {
  interface StrapiUser {
    firstname: string;
    lastname: string;
    rut: string;
    phone: string | null;
    pro: boolean;
    is_company: boolean;
    // ... all custom fields from User interface
  }
}
```

**Alternative approach** (safer): Keep the `User` generic on every call site that uses custom fields.
Files affected: `AccountMain.vue`, `cuenta/avatar.vue`, `cuenta/cover.vue`, `cuenta/username.vue`.
They either call `useStrapiUser()` without generic or access `useStrapi().user`.

**Recommended approach:** Augment `StrapiUser` in `strapi.d.ts` with only the custom fields. This is
less risk than changing every call site.

**Confidence:** HIGH

---

### Fix G: $setSEO url parameter

**Root cause:** `seo.ts` plugin declares `$setSEO` with type
`{ title, description, imageUrl? }` — no `url` field. Every call site in pages passes `url: '...'`
which TypeScript rejects as an excess property.

**What the plugin actually does with url:** It does nothing — the implementation ignores `url`. The
call sites pass it presumably as documentation / future use, but `useSeoMeta` is not called with it.

**Fix options:**
1. Add `url?: string` to both the plugin implementation param type and the NuxtApp declaration (safest,
   minimal change)
2. Remove all `url: ...` properties from every call site (invasive, ~20 files)

**Recommended:** Option 1 — add `url?: string` to the `$setSEO` type signature. The implementation
can ignore it or pass it to `useHead` as canonical if desired.

**Files with `url:` in $setSEO calls:** anunciar/error.vue, anuncios/[slug].vue, contacto/gracias.vue,
contacto/index.vue, cuenta/avatar.vue, cuenta/cambiar-contrasena.vue, cuenta/cover.vue, cuenta/index.vue,
cuenta/perfil/editar.vue, cuenta/perfil/index.vue, cuenta/username.vue, packs/error.vue, packs/gracias.vue,
politicas-de-privacidad.vue, preguntas-frecuentes.vue, recuperar-contrasena.vue, registro.vue,
restablecer-contrasena.vue (~18 files).

**Confidence:** HIGH

---

### Fix H: createError description property

**Root cause:** Nuxt `createError` / `showError` type is:
```typescript
Partial<NuxtError<unknown>> & { status?: number; statusText?: string }
```
`NuxtError` does not have a `description` field. The field being used is `description` but the real
Nuxt field is `statusMessage` (for the human-readable message shown in error pages).

**Fix:** Replace `description:` with `statusMessage:` at every call site, OR add a type cast.

**Files affected:** [slug].vue, anunciar/gracias.vue (×4), contacto/gracias.vue, cuenta/avatar.vue,
cuenta/cover.vue, cuenta/username.vue, FormResetPassword.vue, packs/gracias.vue.

**Note:** `anunciar/gracias.vue` also accesses `error.value.description` (line 129) — also change to
`error.value.statusMessage`.

**Verification:** Check that `NuxtError` indeed has `statusMessage` not `description`:
```typescript
// @nuxt/schema NuxtError interface:
// interface NuxtError<DataT = unknown> extends H3Error<DataT> {}
// H3Error has: statusCode, statusMessage, data, message
```
**Confidence:** HIGH (verified from nuxt source)

---

### Fix I: FilterCategory missing fields

**Current type** (`app/types/filter.d.ts`):
```typescript
export interface FilterCategory {
  id: number;
  name: string;
  slug: string;
}
```

**Actual API data** (used in CategoryArchive.vue, SearchDefault.vue):
```typescript
// CategoryArchive.vue line 17-20 accesses: color, icon.url, count
// SearchDefault.vue line 77 casts to FilterCategory & { count?: number }
```

**Fix:** Add optional fields to `FilterCategory`:
```typescript
export interface FilterCategory {
  id: number;
  name: string;
  slug: string;
  color?: string;
  icon?: { url: string };
  count?: number;
}
```

**Confidence:** HIGH

---

### Fix J: Ad.category type mismatch

**Current type:** `Ad.category: number` (typed as ID integer)

**Actual use:** In `anuncios/index.vue` and `RelatedAds.vue`, the populated API response returns
`category` as an object `{ id: number; name: string; slug: string; color?: string }`.

**`RelatedAds` error:** It accepts `Ad[]` but `Announcement` uses `category: Category` (object), while
`Ad` uses `category: number`. The component is fine but the parent passes `Ad` where `Announcement` expected.

**Root cause:** Two separate types (`Ad` and `Announcement`) represent the same entity at different
population levels.

**Fix options:**
1. Make `Ad.category` a union: `number | { id: number; name: string; slug: string; color?: string }`
2. Create a separate `PopulatedAd` interface extending `Ad` with object-typed relations
3. Use `Omit<Ad, 'category'> & { category: Category }` (already done in anuncios/[slug].vue as
   `AdWithPriceData`)

**Recommended:** Option 1 for minimal change. Union type `category: number | Category` where `Category`
is the existing interface. This matches reality — the API sometimes returns IDs, sometimes objects.

**Also affects:** `commune` field in `Ad` is typed as `number | null` but used as an object in
`anuncios/index.vue` (lines 247-248 access `.id` and `.name` on a number).

**Confidence:** HIGH

---

### Fix K: useColor.ts possibly undefined

**File:** `apps/website/app/composables/useColor.ts` lines 9-15

**Error:** `hex[1]`, `hex[2]`, etc. are `string | undefined` with `noUncheckedIndexedAccess` or
strict mode.

**Fix:** Use non-null assertions:
```typescript
r = Number.parseInt(hex[1]! + hex[1]!, 16);
g = Number.parseInt(hex[2]! + hex[2]!, 16);
```
This is correct because the `if (hex.length === 4)` guard above ensures these indexes exist.

**Confidence:** HIGH

---

### Fix L: Missing/wrong import paths

**Files and issues:**

1. `apps/website/app/pages/[slug].vue` lines 25-28 — importing without `.vue` extension:
   ```typescript
   import HeaderDefault from "@/components/HeaderDefault";   // missing .vue
   import HeroProfile from "@/components/HeroProfile";        // missing .vue
   import ProfileDefault from "@/components/ProfileDefault";  // missing .vue
   import FooterDefault from "@/components/FooterDefault";    // missing .vue
   ```
   Fix: Add `.vue` extension to all four.

2. `apps/website/app/components/MenuUser.vue` line 103:
   ```typescript
   import type { User } from "@/interfaces/user.interface";  // wrong path
   ```
   Fix: Change to `import type { User } from "@/types/user"`.

3. `apps/website/app/components/SidebarAccount.vue` line 119:
   ```typescript
   import AvatarDefault from "@/components/AvatarDefault";   // missing .vue
   ```
   Fix: Add `.vue` extension. (Actually may resolve via Nuxt auto-imports — check actual error.)

4. `apps/website/app/pages/preguntas-frecuentes.vue` and `contacto/index.vue`:
   ```typescript
   import FaqDefault from "@/components/FaqDefault";         // missing .vue
   import ContactDefault from "@/components/ContactDefault"; // missing .vue
   ```
   Fix: Add `.vue` extension.

5. `apps/website/app/components/AdArchive.vue` line 40:
   ```typescript
   import type { Ad } from "@/types/user";  // wrong module, Ad is in @/types/ad
   ```
   Fix: Change to `import type { Ad } from "@/types/ad"`.

**Confidence:** HIGH

---

### Fix M: user.store.ts username filter

**Error:** `username` not recognized as a Strapi filter key. Line 45:
```typescript
filters: {
  username: { $eq: slug },
},
```

**Fix:** Cast the filters object:
```typescript
filters: {
  username: { $eq: slug },
} as Record<string, unknown>,
```
Or use `as any` as a last resort. The existing pattern in the file at line 30 uses `as unknown as Record<string, unknown>`.

**Confidence:** HIGH

---

### Fix N: anunciar/gracias.vue multi-errors

**Error 1 (line 10):** `prepareSummary(data)` returns `null | RecordShape` but prop expects
`Record<string,any> | undefined`. Fix: return `undefined` instead of `null`, or change prop type.

**Error 2 (line 81):** `route.query.ad` may be `LocationQueryValue[]`. Fix: `route.query.ad as string`.

**Error 3 (line 96, 109, 128):** `createError({ description: ... })` — fix: use `statusMessage`.

**Error 4 (line 103):** `(now - updatedAt)` — Date arithmetic. Fix: `now.getTime() - updatedAt.getTime()`.

**Error 5 (line 129):** `error.value.description` — fix: use `error.value.statusMessage`.

**Error 6 (lines 136-137):** `data.value?.error` and `data.value?.updatedAt` when data type is
`Ad | { error: string }`. Fix: narrow type before access.

**Confidence:** HIGH

---

### Fix O: packs/gracias.vue multi-errors

**Root cause:** `getPackById` returns `Pack | undefined` from `response.data?.[0]`, but TypeScript
infers the return as `{} | undefined` because `strapi.find` returns an unknown generic.

**Fixes:**
- Line 11-15 template: `data` is `{} | { error: string } | undefined` — narrow before accessing fields.
- Line 74: `route.query.pack` may be array — cast: `route.query.pack as string`.
- Lines 90-113: `data.value` typed as `{}` — either type the `getPackById` return properly, or cast.

**Fix in packs.store.ts:** Type the return value of `getPackById`:
```typescript
async getPackById(id: string | number): Promise<Pack | undefined> {
  // ...
  return response.data?.[0] as Pack | undefined;
}
```

**Confidence:** HIGH

---

### Fix P: anuncios/[slug].vue multi-errors

**Error line 106:** `ad.currency` is `string` but `ConvertParams.from` expects `"CLP" | "USD" | "EUR"`.
Fix: Cast `ad.currency as ConvertParams['from']` or use a type guard.

**Error line 111:** `result.data.result` — `StrapiResponse<ConvertResponse>` wraps `ConvertResponse[]`
not a single item. The actual API returns a single `ConvertResponse`. Fix: access `result.data[0]?.result`
or re-examine the indicator store return type.

**Error line 112:** `result.data[0]?.result` is `number`, but `convertedPrice` expects `number | undefined`.
Fine after fix above.

**Error line 123:** `String.fromCharCode(number | undefined)` — price may be undefined. Fix: guard
with `if (ad.price)` (already done) or use `ad.price!`.

**Error line 195:** `url` in `$setSEO` — covered by Fix G.

**Confidence:** HIGH

---

### Fix Q: anuncios/index.vue multi-errors

**Error line 76:** Conflicting `Category` import: both `import type { Category } from "@/types/category"`
AND a local `interface Category { name; color; icon? }` declaration. The local one shadows the import.
Fix: Remove the local `interface Category` and either extend the existing type or use the imported one.
The local interface (for the API's `category` object) has `color: string` (required) while the imported
`Category` has `color?: string` (optional). Resolve by updating `Category` in types/category.d.ts to
have `color: string` (required) and `icon?: { url: string }`.

**Error lines 178, 201:** `relatedAds` inferred as `any[]`. Fix: declare `let relatedAds: Ad[] = []`.

**Error lines 247-248, 286-287:** `ad.commune.id` and `ad.commune.name` when `Ad.commune` is
`number | null`. Fix: requires Fix J (union type for commune).

**Confidence:** HIGH

---

### Fix R: AccountOrders Order type mismatch

**Error line 27:** `CardOrder` receives `order` prop; the `Order` type in `AccountOrders.vue` uses an
index signature `[key: string]: any` which should allow any properties. The error says `amount` and
`is_invoice` are missing from the inferred `Order` type.

**Fix:** Check `CardOrder.vue` prop definition and align the `Order` interface in `AccountOrders.vue`
to match, or add `amount` and `is_invoice` fields explicitly.

**Confidence:** MEDIUM (need to verify CardOrder.vue expected Order shape)

---

### Fix S: SearchDefault.vue watch callback

**Error line 87:** Watch on `route.query.category` — the callback receives `() => LocationQueryValue | LocationQueryValue[] | undefined`
(a getter function) not the value directly. The watch overload expects a value callback not a getter.

**Fix:** The watcher at line 86 uses `() => route.query.category` as source — so the callback receives
the raw query value, not a getter. The type annotation on line 87 should be:
```typescript
(newCategory: LocationQueryValue | LocationQueryValue[] | undefined) => {
```
Remove the explicit annotation and let TypeScript infer it, or fix it to match.

**Confidence:** HIGH

---

### Fix T: login/facebook.vue errors

**Error line 21:** `route.query.access_token` is `LocationQueryValue | LocationQueryValue[] | undefined`.
Fix: `route.query.access_token as string`.

**Error line 30:** `error` is `unknown` in catch. Fix: `(error as any).response?.data?.error?.details?.error?.message`.
Or: use type guard `if (error instanceof Error)`.

**Confidence:** HIGH

---

### Fix U: microdata.ts script children

**Error line 11:** `useHead` script object — `children` is not a recognized property in the current
`@unhead/schema` version. The correct property is `innerHTML` or `textContent`.

**Fix:**
```typescript
useHead({
  script: [{
    type: "application/ld+json",
    innerHTML: JSON.stringify(data),
  }],
});
```

**Confidence:** HIGH (verified: `@unhead/schema` uses `innerHTML` for script content)

---

### Fix V: recaptcha.client.ts Promise callback

**Error line 50:** `.then((grecaptcha: Window["grecaptcha"]) => {...})` — `loadRecaptchaScript` returns
`new Promise((resolve, reject) => {...})` which is `Promise<unknown>` because `resolve` is untyped.

**Fix:** Type the Promise:
```typescript
function loadRecaptchaScript(): Promise<Window["grecaptcha"]> {
  return new Promise<Window["grecaptcha"]>((resolve, reject) => {
    // ...
    resolve(window.grecaptcha);
  });
}
```

**Confidence:** HIGH

---

### Fix W: MenuAuth.vue cls index

**Error line 40:** `cls[key]` where `cls` is `{ "is-black": boolean }`. TypeScript won't index an
object literal type with a plain `string`.

**Fix:**
```typescript
typeof cls === "string"
  ? cls
  : Object.keys(cls as Record<string, boolean>)
      .filter((key) => (cls as Record<string, boolean>)[key])
      .join(" ")
```

**Confidence:** HIGH

---

### Fix X: Implicit any in .then() callbacks

**Files:** `MenuUser.vue` line 160, `MobileBar.vue` line 202, `SidebarAccount.vue` line 141

All are `Swal.fire(...).then(async (result) => {...})`. SweetAlert2's `fire()` returns `Promise<SweetAlertResult<T>>`.

**Fix:** Either:
1. Import `SweetAlertResult` and annotate: `(result: SweetAlertResult) => {...}`
2. Or destructure from the type: the existing `useSweetAlert2` composable likely re-exports Swal types.

**Confidence:** MEDIUM (depends on useSweetAlert2 implementation)

---

### Fix Y: FormRegister.vue string | undefined

**Error line 265:** Strapi `register()` call — a field value may be `string | undefined` but the
type expects `string`. This is likely the `recaptchaToken` field added to the payload.

**Fix:** Use `token!` non-null assertion, or provide a default: `recaptchaToken: token ?? ""`.

**Confidence:** HIGH

---

### Fix Z: useRut.ts body[i] undefined

**Error line 36:** `body[i]` may be undefined (noUncheckedIndexedAccess).

**Fix:** `Number.parseInt(body[i]!) * multiplier` — the loop bounds ensure `i` is valid.

**Confidence:** HIGH

---

### Fix AA: pages/index.vue undefined not assignable

**Errors:** `useAsyncData` returns `Ref<T | undefined>` but component props accept `T`.

- `categories` prop on `CategoryArchive` expects `FilterCategory[]` — useAsyncData returns `FilterCategory[] | undefined`
- `packs` prop on `PacksDefault` expects `Pack[]` — useAsyncData returns `Pack[] | undefined`
- `faqs` prop on `FaqDefault` expects `FAQ[]` — useAsyncData returns `FAQ[] | undefined`

**Fix:** Use default values in `useAsyncData`:
```typescript
const { data: categories } = await useAsyncData("categories", ..., { default: () => [] as FilterCategory[] });
```
Or use `categories ?? []` at the call site in the template (pass computed value).
Or type the `useAsyncData` call with `useAsyncData<FilterCategory[]>`.

**Confidence:** HIGH

---

## Architecture Patterns

### Nuxt 4 Plugin Type Augmentation

```typescript
// Standard pattern — augment #app module
declare module "#app" {
  interface NuxtApp {
    $myPlugin: MyPluginType;
  }
}
export {};
```

### Window Extension Pattern (Nuxt 4)

```typescript
// In a .d.ts file loaded by tsconfig
export {};
declare global {
  interface Window {
    myGlobal: MyType;
  }
}
```

### Strapi SDK User Augmentation

```typescript
declare module "@nuxtjs/strapi" {
  interface StrapiUser {
    // custom fields
  }
}
```
This merges into the user type returned by `useStrapiUser()` without generics.

### useAsyncData with default

```typescript
const { data } = await useAsyncData<MyType>("key", fetch, {
  default: () => [] as MyType
});
// data is now Ref<MyType> not Ref<MyType | undefined>
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Window globals | Duplicate declarations in every file | Single `window.d.ts` | Merges across all files |
| Plugin types | Per-component type casts | `#app` NuxtApp augmentation | Standard Nuxt pattern |
| Strapi user fields | Per-component `useStrapiUser<User>()` | `StrapiUser` module augment | One declaration, everywhere |

---

## Common Pitfalls

### Pitfall 1: Duplicate declare global for Window
Avoid declaring `Window` extensions in multiple files. The `recaptcha.client.ts` already has one.
Consolidate all Window extensions in a single `window.d.ts` file. TypeScript merges all `declare global`
blocks from all .d.ts files, but duplicate interface members cause no harm — however, conflicting
member types will error.

### Pitfall 2: #app augmentation needs export {}
Every file that augments a `declare module` must export something to be treated as a module (not a
script). Add `export {};` at the end if no other exports exist.

### Pitfall 3: createError statusMessage vs description
Nuxt's `createError` / `showError` does NOT have a `description` property on NuxtError. The human-
readable text goes in `statusMessage`. The `data` property can hold arbitrary structured data.

### Pitfall 4: useAsyncData T | undefined
By default, `useAsyncData<T>` returns `Ref<T | undefined>`. To get `Ref<T>`, provide a `default`
option. This is a TypeScript-only change — behavior is the same.

### Pitfall 5: Strapi find() with unknown filters
`strapi.find("users", { filters: { username: ... } })` — the Strapi SDK types its `filters` argument
using deep property introspection on the entity type. Since `users` is a string (not a typed endpoint),
the filters type becomes very broad. Use `as unknown as Record<string, unknown>` for filter objects.

### Pitfall 6: Ad type duality (number vs object for relations)
The `Ad` type has `category: number` and `commune: number | null` representing populated vs. unpopulated
API responses. When Strapi `populate: "*"` is used, these become objects. Making them union types
`number | CategoryObject` correctly models this but requires careful narrowing at use sites.

---

## Code Examples

### Window declaration (verified pattern)
```typescript
// app/types/window.d.ts
export {};
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    google: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (cb: (n: GoogleOneTapNotification) => void) => void;
        };
      };
    };
  }
}
```

### Plugin type augmentation (Nuxt docs pattern)
```typescript
// app/types/plugins.d.ts
declare module "#app" {
  interface NuxtApp {
    $cookies: import("js-cookie").CookiesStatic;
    $recaptcha: { execute: (action: string) => Promise<string> };
    $checkSiteHealth: () => Promise<{ hasError: boolean; errorDetails: Array<{ type: string; message: string }> }>;
  }
}
export {};
```

### Non-null string indexing (useColor)
```typescript
// Safe: loop bounds guarantee index exists
r = Number.parseInt(hex[1]! + hex[1]!, 16);
```

### createError correct usage
```typescript
throw createError({
  statusCode: 404,
  statusMessage: "Página no encontrada",   // NOT description
  message: "Lo sentimos...",
});
```

### useAsyncData with typed default
```typescript
const { data: categories } = await useAsyncData<FilterCategory[]>(
  "categories",
  async () => { /* ... */ return [] as FilterCategory[]; },
  { default: () => [] as FilterCategory[] }
);
// categories is now Ref<FilterCategory[]>
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.0.9 |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `cd apps/website && npx vitest run` |
| Full suite command | `cd apps/website && npx vitest run` |
| Typecheck command | `cd apps/website && npx nuxt typecheck` |

### Phase Requirements → Test Map

| ID | Behavior | Test Type | Automated Command | Notes |
|----|----------|-----------|-------------------|-------|
| TS-01 | `npx nuxt typecheck` exits 0 | type-check | `cd apps/website && npx nuxt typecheck` | Primary gate |
| TS-02 | No regressions in existing unit tests | unit | `cd apps/website && npx vitest run` | Secondary gate |

### Sampling Rate
- **Per fix wave:** `cd apps/website && npx nuxt typecheck 2>&1 | grep -c "error TS"` — confirm count goes down
- **Phase gate:** `npx nuxt typecheck` exits 0 before enabling `typeCheck: true`

### Wave 0 Gaps
None — existing test infrastructure covers validation. No new test files needed for this phase.
TypeScript compiler IS the test for this phase.

---

## Recommended Fix Order (by leverage)

| Wave | Fixes | Error Reduction | Files to Change |
|------|-------|-----------------|-----------------|
| 1 | A+B (Window), C+D+E (plugins), F (Strapi user), G ($setSEO url), I (FilterCategory) | ~65 errors | 2 new .d.ts files, seo.ts, strapi.d.ts, filter.d.ts |
| 2 | H (createError description→statusMessage), L (import paths), U (microdata children), V (recaptcha Promise) | ~25 errors | ~12 files |
| 3 | K (useColor), M (user.store filter), W (MenuAuth cls), X (implicit any), Y (FormRegister), Z (useRut), S (SearchDefault watch) | ~20 errors | ~8 files |
| 4 | J (Ad.category type), Q (anuncios/index), R (AccountOrders Order) | ~18 errors | 3 files + type def |
| 5 | N (anunciar/gracias), O (packs/gracias), P (anuncios/[slug]), T (login/facebook), AA (index.vue) | ~35 errors | 5 files |
| 6 | Enable `typeCheck: true` in nuxt.config.ts | — | nuxt.config.ts |

---

## Sources

### Primary (HIGH confidence)
- Direct `npx nuxt typecheck` run — exact current error list (183 errors confirmed)
- Source file inspection — all plugin implementations, type files, component scripts

### Secondary (MEDIUM confidence)
- Nuxt 4 documentation pattern for plugin type augmentation (#app module)
- @nuxtjs/strapi v2 SDK source — StrapiUser interface

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all from source inspection
- Architecture: HIGH — Nuxt 4 type augmentation patterns are stable
- Pitfalls: HIGH — all from actual typecheck errors

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (package versions stable; errors are deterministic)

**Key constraint:** Code style rules from user prompt:
- All comments, variable names, keys in English
- User-facing text stays in Spanish
- No emojis
