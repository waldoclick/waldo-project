# Phase 29: TypeScript Strict Errors - Plan

**Created:** 2026-03-07
**Based on:** 29-RESEARCH.md
**Goal:** Fix all 183 typecheck errors so `typeCheck: true` can be enabled in nuxt.config.ts and `npx nuxt typecheck` passes with zero errors.

---

## Constraints

- All comments, variable names, and keys in English
- User-facing text stays in Spanish
- No emojis
- Do not rewrite logic — only fix type annotations, type declarations, and property names
- Run `npx nuxt typecheck 2>&1 | grep -c "error TS"` after each wave to confirm reduction

---

## Wave 1: Global declarations — Window, plugins, Strapi user, $setSEO url (~65 errors)

These are declaration-only changes. Zero logic changes. Highest leverage.

### Task 1.1 — Create window.d.ts for dataLayer and google globals

**File:** `apps/website/app/types/window.d.ts` (new file)

Create the file with:
```typescript
export {};

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    google: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (
            callback: (notification: GoogleOneTapNotification) => void,
          ) => void;
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

**Fixes errors in:** gtm.client.ts (3), useAdAnalytics.ts (4), LightboxCookies.vue (3), useGoogleOneTap.ts (3)
Total: ~13 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "dataLayer\|window.google"`

---

### Task 1.2 — Create plugins.d.ts for $cookies, $checkSiteHealth, $recaptcha

**File:** `apps/website/app/types/plugins.d.ts` (new file)

Create the file with:
```typescript
import type { CookiesStatic } from "js-cookie";

declare module "#app" {
  interface NuxtApp {
    $cookies: CookiesStatic;
    $checkSiteHealth: () => Promise<{
      hasError: boolean;
      errorDetails: Array<{ type: string; message: string }>;
    }>;
    $recaptcha: {
      execute: (action: string) => Promise<string | undefined>;
    };
  }
}

export {};
```

**Note:** `$setSEO` and `$setStructuredData` are already declared in their own plugin files — do NOT
re-declare them here.

**Fixes errors in:** FormContact.vue, FormForgotPassword.vue, FormPassword.vue, FormRegister.vue,
FormResetPassword.vue ($recaptcha ×5), LightboxCookies.vue ($cookies ×2), LightboxRegister.vue ($cookies ×2),
LightboxAdblock.vue ($checkSiteHealth ×1)
Total: ~10 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "'\$recaptcha'\|'\$cookies'\|'\$checkSiteHealth'"`

---

### Task 1.3 — Augment StrapiUser with custom fields

**File:** `apps/website/app/types/strapi.d.ts` (edit existing)

Add a `StrapiUser` augmentation to the existing `declare module "@nuxtjs/strapi"` block:

```typescript
declare module "@nuxtjs/strapi" {
  // ... existing StrapiPagination, StrapiMeta, StrapiResponse, StrapiData ...

  interface StrapiUser {
    firstname: string;
    lastname: string;
    rut: string;
    phone: string | null;
    documentId: string;
    publishedAt: string;
    is_company: boolean;
    address: string | null;
    address_number: string | null;
    birthdate: string | null;
    pro: boolean;
    postal_code: string | null;
    commune: {
      id: number;
      name: string;
      region: { id: number; name: string };
    } | null;
    business_name: string | null;
    business_type: string | null;
    business_rut: string | null;
    business_address: string | null;
    business_address_number: string | null;
    business_postal_code: string | null;
    business_commune: {
      id: number;
      name: string;
      region: { id: number; name: string };
    } | null;
    avatar: {
      formats: { [key: string]: { url: string } };
      url: string;
    } | null;
    cover: {
      formats: { [key: string]: { url: string } };
      url: string;
    } | null;
  }
}
```

**Fixes errors in:** AccountMain.vue (firstname, lastname ×2), cuenta/avatar.vue (pro ×1),
cuenta/cover.vue (pro ×1), cuenta/username.vue (pro ×1)
Total: ~5 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "firstname\|lastname\|\.pro"`

---

### Task 1.4 — Add `url` parameter to $setSEO type

**File:** `apps/website/app/plugins/seo.ts` (edit)

Change the param type in both the `nuxtApp.provide` call and the `declare module "#app"` declaration
to add `url?: string`:

```typescript
// In nuxtApp.provide call:
nuxtApp.provide(
  "setSEO",
  (params: { title: string; description: string; imageUrl?: string; url?: string }) => {
    useSeoMeta({
      title: params.title,
      description: params.description,
      ogImage: params.imageUrl || DEFAULT_IMAGE,
    });
  },
);

// In declare module "#app":
interface NuxtApp {
  $setSEO: (params: {
    title: string;
    description: string;
    imageUrl?: string;
    url?: string;
  }) => void;
}
```

**Fixes errors in:** anunciar/error.vue, anuncios/[slug].vue, contacto/gracias.vue, contacto/index.vue,
cuenta/avatar.vue, cuenta/cambiar-contrasena.vue, cuenta/cover.vue, cuenta/index.vue,
cuenta/perfil/editar.vue, cuenta/perfil/index.vue, cuenta/username.vue, packs/error.vue,
packs/gracias.vue, politicas-de-privacidad.vue, preguntas-frecuentes.vue, recuperar-contrasena.vue,
registro.vue, restablecer-contrasena.vue
Total: ~18 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "url.*not exist.*setSEO\|setSEO.*url"`

---

### Task 1.5 — Add color, icon, count to FilterCategory type

**File:** `apps/website/app/types/filter.d.ts` (edit)

Change `FilterCategory` interface:
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

**Fixes errors in:** CategoryArchive.vue (color ×1, icon ×1, count ×2), SearchDefault.vue (count cast removed)
Total: ~5 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "FilterCategory"`

---

**Wave 1 gate:** `npx nuxt typecheck 2>&1 | grep -c "error TS"` should be ≤118

---

## Wave 2: API name fixes — createError, microdata, recaptcha Promise, import paths (~30 errors)

### Task 2.1 — Replace `description:` with `statusMessage:` in createError/showError calls

`NuxtError` does not have a `description` property. The correct property for the human-readable
error detail is `statusMessage`.

**Files and lines to fix:**

1. `apps/website/app/pages/[slug].vue` lines 63, 96, 125, 144 — replace `description:` → `statusMessage:`
2. `apps/website/app/pages/anunciar/gracias.vue` lines 96, 109, 128 — replace `description:` → `statusMessage:`
   - Also line 129: `error.value.description` → `error.value.statusMessage`
3. `apps/website/app/pages/contacto/gracias.vue` line 27 — replace `description:` → `statusMessage:`
4. `apps/website/app/pages/cuenta/avatar.vue` line 17 — replace `description:` → `statusMessage:`
5. `apps/website/app/pages/cuenta/cover.vue` line 17 — replace `description:` → `statusMessage:`
6. `apps/website/app/pages/cuenta/username.vue` line 17 — replace `description:` → `statusMessage:`
7. `apps/website/app/components/FormResetPassword.vue` line 90 — replace `description:` → `statusMessage:`

Also fix `showError` calls that pass `description:`:
- `apps/website/app/pages/anunciar/gracias.vue` line 65: the `handleError` function calls `showError` with `description` — fix to `statusMessage`

Total: ~12 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "description.*not exist"`

---

### Task 2.2 — Fix microdata.ts: children → innerHTML

**File:** `apps/website/app/plugins/microdata.ts` (edit)

Change line 11:
```typescript
// Before:
{
  type: "application/ld+json",
  children: JSON.stringify(data),
}
// After:
{
  type: "application/ld+json",
  innerHTML: JSON.stringify(data),
}
```

Total: 1 error

**Verification:** `npx nuxt typecheck 2>&1 | grep "microdata"`

---

### Task 2.3 — Fix recaptcha.client.ts Promise type

**File:** `apps/website/app/plugins/recaptcha.client.ts` (edit)

Type the `loadRecaptchaScript` function return type explicitly so `.then()` receives a typed value:
```typescript
function loadRecaptchaScript(): Promise<Window["grecaptcha"]> {
  return new Promise<Window["grecaptcha"]>((resolve, reject) => {
    if (document.getElementById("recaptcha-script")) {
      return resolve(window.grecaptcha);
    }
    // ... rest unchanged ...
    script.addEventListener("load", () => {
      if (window.grecaptcha) {
        resolve(window.grecaptcha);
      } else {
        reject(new Error("reCAPTCHA failed to load."));
      }
    });
    // ...
  });
}
```

Remove the explicit type annotation from the `.then()` callback (TypeScript will infer it):
```typescript
loadRecaptchaScript()
  .then((grecaptcha) => {   // type inferred from Promise<Window["grecaptcha"]>
    // ...
  })
```

Total: 1 error

**Verification:** `npx nuxt typecheck 2>&1 | grep "recaptcha"`

---

### Task 2.4 — Fix wrong/missing import paths

**Files to fix:**

1. `apps/website/app/pages/[slug].vue` lines 25-28 — add `.vue` extension:
   ```typescript
   import HeaderDefault from "@/components/HeaderDefault.vue";
   import HeroProfile from "@/components/HeroProfile.vue";
   import ProfileDefault from "@/components/ProfileDefault.vue";
   import FooterDefault from "@/components/FooterDefault.vue";
   ```

2. `apps/website/app/components/MenuUser.vue` line 103 — fix wrong path:
   ```typescript
   // Before:
   import type { User } from "@/interfaces/user.interface";
   // After:
   import type { User } from "@/types/user";
   ```

3. `apps/website/app/components/SidebarAccount.vue` line 119 — add `.vue`:
   ```typescript
   import AvatarDefault from "@/components/AvatarDefault.vue";
   ```

4. `apps/website/app/pages/preguntas-frecuentes.vue` line 16 — add `.vue`:
   ```typescript
   import FaqDefault from "@/components/FaqDefault.vue";
   ```

5. `apps/website/app/pages/contacto/index.vue` line 9 — add `.vue`:
   ```typescript
   import ContactDefault from "@/components/ContactDefault.vue";
   ```

6. `apps/website/app/components/AdArchive.vue` line 40 — fix wrong module:
   ```typescript
   // Before:
   import type { Ad } from "@/types/user";
   // After:
   import type { Ad } from "@/types/ad";
   ```

Total: ~8 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "Cannot find module"`

---

**Wave 2 gate:** `npx nuxt typecheck 2>&1 | grep -c "error TS"` should be ≤88

---

## Wave 3: Small per-file fixes (~25 errors)

### Task 3.1 — Fix useColor.ts possibly-undefined array access

**File:** `apps/website/app/composables/useColor.ts` (edit)

Add non-null assertions to all hex character accesses. The length checks above guarantee the indexes:
```typescript
if (hex.length === 4) {
  r = Number.parseInt(hex[1]! + hex[1]!, 16);
  g = Number.parseInt(hex[2]! + hex[2]!, 16);
  b = Number.parseInt(hex[3]! + hex[3]!, 16);
} else if (hex.length === 7) {
  r = Number.parseInt(hex[1]! + hex[2]!, 16);
  g = Number.parseInt(hex[3]! + hex[4]!, 16);
  b = Number.parseInt(hex[5]! + hex[6]!, 16);
}
```

Total: 12 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "useColor"`

---

### Task 3.2 — Fix user.store.ts username filter

**File:** `apps/website/app/stores/user.store.ts` (edit)

Add cast to the filters object at line 44:
```typescript
const response = await strapi.find("users", {
  filters: {
    username: {
      $eq: slug,
    },
  } as unknown as Record<string, unknown>,
  populate: "*",
});
```

Total: 1 error

**Verification:** `npx nuxt typecheck 2>&1 | grep "user.store"`

---

### Task 3.3 — Fix MenuAuth.vue cls object index

**File:** `apps/website/app/components/MenuAuth.vue` (edit)

Change the `.filter()` callback to cast the object:
```typescript
const computedLinkClass = computed(() => {
  return ["btn btn--default btn--login", { "is-black": !props.white }]
    .map((cls) =>
      typeof cls === "string"
        ? cls
        : Object.keys(cls as Record<string, boolean>)
            .filter((key) => (cls as Record<string, boolean>)[key])
            .join(" "),
    )
    .join(" ");
});
```

Total: 1 error

**Verification:** `npx nuxt typecheck 2>&1 | grep "MenuAuth"`

---

### Task 3.4 — Fix implicit `any` in Swal .then() callbacks

**Files:** `apps/website/app/components/MenuUser.vue` line 160,
`apps/website/app/components/MobileBar.vue` line 202,
`apps/website/app/components/SidebarAccount.vue` line 141

SweetAlert2 `.then()` callback receives `SweetAlertResult`. The simplest fix that avoids importing
the type is to destructure only `isConfirmed`:

```typescript
// Before:
.then(async (result) => {
  if (result.isConfirmed) {
// After:
.then(async ({ isConfirmed }) => {
  if (isConfirmed) {
```

Apply this same pattern in all three files.

Total: 3 errors (one per file)

**Verification:** `npx nuxt typecheck 2>&1 | grep "MenuUser\|MobileBar\|SidebarAccount"`

---

### Task 3.5 — Fix SearchDefault.vue watch overload

**File:** `apps/website/app/components/SearchDefault.vue` (edit)

Remove the explicit type annotation from the watch callback at line 87. TypeScript will infer the
correct type from the watch source:

```typescript
// Before:
watch(
  () => route.query.category,
  (newCategory: LocationQueryValue | LocationQueryValue[]) => {
    form.value.category = String(newCategory || "");
  },
);
// After:
watch(
  () => route.query.category,
  (newCategory) => {
    form.value.category = String(newCategory || "");
  },
);
```

Total: 1 error

**Verification:** `npx nuxt typecheck 2>&1 | grep "SearchDefault"`

---

### Task 3.6 — Fix login/facebook.vue errors

**File:** `apps/website/app/pages/login/facebook.vue` (edit)

Fix 1 (line 21): Cast `access_token` to string:
```typescript
const response = await authenticateProvider(
  "facebook",
  route.query.access_token as string,
);
```

Fix 2 (line 30): Type the caught error:
```typescript
} catch (error) {
  const errorMessage =
    (error as { response?: { data?: { error?: { details?: { error?: { message?: string } } } } } })
      .response?.data?.error?.details?.error?.message ||
    "Error desconocido durante la autenticación.";
```

Or simpler — use `(error as any)`:
```typescript
} catch (error) {
  const errorMessage =
    (error as any)?.response?.data?.error?.details?.error?.message ||
    "Error desconocido durante la autenticación.";
```

Total: 2 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "facebook"`

---

### Task 3.7 — Fix FormRegister.vue string | undefined

**File:** `apps/website/app/components/FormRegister.vue` (edit)

The recaptcha token may be `string | undefined`. Use nullish coalescing at the register call:
```typescript
// Before:
recaptchaToken: token,
// After:
recaptchaToken: token ?? "",
```

Total: 1 error

**Verification:** `npx nuxt typecheck 2>&1 | grep "FormRegister"`

---

### Task 3.8 — Fix useRut.ts body[i] undefined

**File:** `apps/website/app/composables/useRut.ts` (edit)

Add non-null assertion at line 36 (loop bounds guarantee index is valid):
```typescript
sum += Number.parseInt(body[i]!) * multiplier;
```

Total: 1 error

**Verification:** `npx nuxt typecheck 2>&1 | grep "useRut"`

---

**Wave 3 gate:** `npx nuxt typecheck 2>&1 | grep -c "error TS"` should be ≤43

---

## Wave 4: Type definition fixes for Ad/Announcement and AccountOrders (~20 errors)

### Task 4.1 — Update Ad type to support populated relations

**File:** `apps/website/app/types/ad.d.ts` (edit)

The `Ad` type has `category: number` and `commune: number | null`, but the API with `populate: "*"`
returns objects. Make these union types:

```typescript
import type { Category } from "@/types/category";
// ...existing imports...

export interface Ad {
  // ...existing fields...
  category: number | Category;
  commune: number | {
    id: number;
    name: string;
    region?: { id: number; name: string };
  } | null;
  // ...rest unchanged...
}
```

**Also update Category type** to add `icon` field (`apps/website/app/types/category.d.ts`):
```typescript
export interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string;
  icon?: { url: string };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

This allows `anuncios/index.vue` line 163 to compile (the returned category object has required
`color` — but note: the existing type has `color?` optional which is compatible).

**Fixes errors in:** anuncios/index.vue (lines 247-248, 286-287 for commune.id/name), RelatedAds.vue
(Ad vs Announcement category type mismatch)
Total: ~6 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "RelatedAds\|anuncios/index"`

---

### Task 4.2 — Fix AccountOrders.vue Order interface

**File:** `apps/website/app/components/AccountOrders.vue` (edit)

The local `Order` interface is missing `amount` and `is_invoice` which `CardOrder.vue` requires.
Add these fields:

```typescript
interface Order {
  id: number;
  status: string;
  amount: string | number;
  is_invoice: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;   // use unknown instead of any
}
```

Total: 1 error

**Verification:** `npx nuxt typecheck 2>&1 | grep "AccountOrders"`

---

### Task 4.3 — Fix anuncios/index.vue conflicting Category import

**File:** `apps/website/app/pages/anuncios/index.vue` (edit)

Remove the local `interface Category` declaration (lines 80-86) since it conflicts with the imported
`Category` type from `@/types/category`. Replace the local interface usage with the updated import:

1. Remove lines 80-86 (local `interface Category`)
2. Ensure the `AdsData.category` field uses the imported `Category` type
3. Update `defaultCategory` to match the imported `Category` type structure

The local Category had `{ name: string; color: string; icon?: { url: string } }`. The imported
Category has `color?: string` (optional). Since `defaultCategory` sets a color, this is fine. The
issue is that `categoryData = categoriesStore.category` returns a `Category | null` — add a fallback:
```typescript
categoryData = categoriesStore.category ?? defaultCategory.value;
```

Also fix `relatedAds` implicit any (line 178):
```typescript
import type { Ad } from "@/types/ad";
// ...
let relatedAds: Ad[] = [];
```

**And fix** lines 247-248 and 286-287 where `ad.commune` (a union type after Task 4.1) is used as
object — add type narrowing:
```typescript
// After type fix on Ad, commune is number | object | null
// Use type guard where needed:
const communeName = adsData.value?.ads.find(
  (ad) => typeof ad.commune === 'object' && ad.commune?.id?.toString() === communeId,
)?.commune as { id: number; name: string } | undefined;
const communeNameStr = typeof communeName === 'object' ? communeName?.name : undefined;
```

Total: ~6 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "anuncios/index"`

---

**Wave 4 gate:** `npx nuxt typecheck 2>&1 | grep -c "error TS"` should be ≤17

---

## Wave 5: Per-file complex fixes (remaining errors)

### Task 5.1 — Fix anunciar/gracias.vue multi-errors

**File:** `apps/website/app/pages/anunciar/gracias.vue` (edit)

Fix 1 — `prepareSummary` returns null (line 10 error): Change return to `undefined`:
```typescript
const prepareSummary = (data) => {
  if (!data) return undefined;   // was: return null
  // ...
};
```

Fix 2 — `route.query.ad` may be array (line 81):
```typescript
response = await adsStore.loadAdById(route.query.ad as string);
```

Fix 3 — `handleError` `description:` → `statusMessage:` (already covered by Task 2.1, but the
`showError` call inside `handleError` also needs fixing if not done):
The `handleError` function at line 42 uses `showError({ statusCode: 404, ...errorConfig })` where
`errorConfig` has a `description` key. Change the `errorMessages` object keys:
```typescript
const errorMessages = {
  INVALID_URL: {
    message: "URL inválida",
    statusMessage: "La URL que intentas acceder no es válida",
  },
  EXPIRED: {
    message: "Resumen expirado",
    statusMessage: "El tiempo para ver el resumen de tu anuncio ha expirado",
  },
  NOT_FOUND: {
    message: "Anuncio no encontrado",
    statusMessage: "No pudimos encontrar el anuncio que buscas",
  },
};
```

Fix 4 — Date arithmetic on Date objects (line 103):
```typescript
// Before:
const diffInMinutes = Math.floor((now - updatedAt) / (1000 * 60));
// After:
const diffInMinutes = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60));
```

Fix 5 — `error.value.description` (line 129) → `error.value.statusMessage` (covered by Task 2.1 scope,
confirm it is addressed)

Fix 6 — `data.value?.error` and `data.value?.updatedAt` type narrowing (lines 136-137). The `data`
type is `Ad | { error: string } | null`. Add narrowing:
```typescript
if (data.value && 'error' in data.value) {
  handleError(data.value.error as "INVALID_URL" | "EXPIRED" | "NOT_FOUND", null);
  return;
} else if (data.value && !pending.value) {
  // ...access data.value as Ad
```

Total: ~9 errors (some may already be fixed by Task 2.1)

**Verification:** `npx nuxt typecheck 2>&1 | grep "anunciar/gracias"`

---

### Task 5.2 — Fix packs/gracias.vue multi-errors

**File:** `apps/website/app/pages/packs/gracias.vue` and `apps/website/app/stores/packs.store.ts`

Fix 1 — Type `getPackById` return value in packs.store.ts:
```typescript
async getPackById(id: string | number): Promise<Pack | undefined> {
  const strapi = useStrapi();
  const response = await strapi.find("ad-packs", {
    filters: { id: { $eq: id } },
    populate: "*",
  } as unknown as Record<string, unknown>);
  return response.data?.[0] as unknown as Pack | undefined;
},
```

Fix 2 — `route.query.pack` may be array (line 74 in gracias.vue):
```typescript
const pack = await packsStore.getPackById(route.query.pack as string);
```

Fix 3 — `data.value?.error` type narrowing (line 90): After typing `getPackById` as `Pack | undefined`,
the `useAsyncData` return will be `Pack | { error: string } | undefined`. Add narrowing:
```typescript
watchEffect(() => {
  if (data.value && typeof data.value === 'object' && 'error' in data.value) {
    handleError((data.value as { error: string }).error as "INVALID_URL" | "NOT_FOUND");
  }
});
```

Fix 4 — `$setSEO url:` already fixed by Task 1.4.

Fix 5 — Template accesses `data.name`, `data.price`, `data.total_ads` — these will type-check once
`data` is typed as `Pack | { error: string } | undefined`. The template uses `v-if="data"` but TypeScript
still sees the union. Either use `(data as Pack).name` in the watch callback, or add a computed:
```typescript
const packData = computed(() => {
  if (!data.value || 'error' in data.value) return null;
  return data.value as Pack;
});
```
Then update template to use `packData` instead of `data`.

Total: ~12 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "packs/gracias"`

---

### Task 5.3 — Fix anuncios/[slug].vue multi-errors

**File:** `apps/website/app/pages/anuncios/[slug].vue` (edit)

Fix 1 — `ad.currency` string → ConvertParams from type (line 106). The `from` param expects
`"CLP" | "USD" | "EUR" | undefined`:
```typescript
from: ad.priceData.originalCurrency as "CLP" | "USD" | "EUR",
to: (ad.currency === "CLP" ? "USD" : "CLP") as "CLP" | "USD" | "EUR",
```

Fix 2 — `result.data.result` (line 111). The indicator store's `convertCurrency` returns
`StrapiResponse<ConvertResponse>` which means `data` is `ConvertResponse[]`. The actual API returns
a single converted result. Access it as:
```typescript
if (result?.data) {
  const convertData = Array.isArray(result.data) ? result.data[0] : result.data;
  ad.priceData.convertedPrice = (convertData as unknown as ConvertResponse)?.result;
  ad.priceData.convertedTimestamp = (result as any).meta?.timestamp;
```

Fix 3 — `ad.priceData.convertedPrice` is `number | undefined` passed to `Intl.NumberFormat.format()`
which requires `number`. Guard:
```typescript
if (ad.priceData.convertedPrice !== undefined) {
  ad.priceData.formattedConvertedPrice = new Intl.NumberFormat(...).format(ad.priceData.convertedPrice);
}
```

Fix 4 — `$setSEO url:` already fixed by Task 1.4.

Total: ~5 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "anuncios/\[slug\]"`

---

### Task 5.4 — Fix pages/index.vue undefined not assignable

**File:** `apps/website/app/pages/index.vue` (edit)

Add explicit type parameter and default to `useAsyncData` calls:

```typescript
import type { FilterCategory } from "@/types/filter";
import type { Pack } from "@/types/pack";
import type { FAQ } from "@/types/faq";

const { data: categories } = await useAsyncData<FilterCategory[]>(
  "categories",
  async () => {
    // ... unchanged ...
    return [] as FilterCategory[];   // ensure never returns undefined
  },
  { default: () => [] as FilterCategory[] }
);

const { data: packs } = await useAsyncData<Pack[]>(
  "home-packs",
  async () => {
    // ... unchanged ...
    return [] as Pack[];
  },
  { default: () => [] as Pack[] }
);

const { data: faqs } = await useAsyncData<FAQ[]>(
  "featured-faqs",
  async () => {
    // ... unchanged ...
    return [] as FAQ[];
  },
  { default: () => [] as FAQ[] }
);
```

Total: 3 errors

**Verification:** `npx nuxt typecheck 2>&1 | grep "pages/index"`

---

### Task 5.5 — Fix cypress test error (bonus)

**File:** `apps/website/app/cypress/e2e/register.cy.ts` line 34

```typescript
// Before:
interception.response.body
// After:
interception.response?.body
```

Or add a null check. The error is `interception.response` is possibly undefined.
Total: 1 error

---

**Wave 5 gate:** `npx nuxt typecheck 2>&1 | grep -c "error TS"` should be 0

---

## Wave 6: Enable typeCheck

### Task 6.1 — Enable typeCheck: true in nuxt.config.ts

**File:** `apps/website/nuxt.config.ts` (edit)

Change line 420:
```typescript
// Before:
typescript: {
  strict: true,
  typeCheck: false, // Disabled by default, enable when ready
},
// After:
typescript: {
  strict: true,
  typeCheck: true,
},
```

**Final verification:** `cd apps/website && npx nuxt typecheck`

Expected outcome: exits 0 with no `error TS` lines.

---

## Summary

| Wave | Tasks | Errors Fixed | Primary Technique |
|------|-------|-------------|-------------------|
| 1 | 5 tasks | ~65 | New .d.ts files, type augmentation |
| 2 | 4 tasks | ~30 | Property rename, import paths |
| 3 | 8 tasks | ~25 | Non-null assertions, casts, type guards |
| 4 | 3 tasks | ~20 | Type definition updates |
| 5 | 5 tasks | ~43 | Per-file complex narrowing |
| 6 | 1 task | — | Enable typeCheck |
| **Total** | **26 tasks** | **183** | |

---

## Verification Commands

```bash
# After each wave — check error count:
cd /home/gabriel/Code/waldo-project/apps/website && npx nuxt typecheck 2>&1 | grep -c "error TS"

# Final gate — must exit 0:
cd /home/gabriel/Code/waldo-project/apps/website && npx nuxt typecheck

# Unit tests must still pass:
cd /home/gabriel/Code/waldo-project/apps/website && npx vitest run
```
