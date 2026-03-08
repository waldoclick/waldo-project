# Waldo Project

## What This Is

Plataforma de clasificados (avisos) compuesta por tres aplicaciones en un monorepo: un sitio web público (Nuxt.js 4), un dashboard de administración (Nuxt.js 4) y una API/CMS (Strapi v5). Toda la lógica de negocio vive en Strapi; el frontend y el dashboard consumen sus APIs vía proxy Nitro.

## Core Value

Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## Requirements

### Validated

- ✓ Usuario puede crear y publicar avisos desde el sitio web — existente
- ✓ Sistema de packs de avisos (PackType: free / paid / pack específico) — existente
- ✓ Sistema de avisos destacados (FeaturedType: free / true / false) — existente
- ✓ Pagos procesados a través de Transbank — existente
- ✓ Autenticación completa en Dashboard (login, forgot password, reset password) — existente
- ✓ Dashboard para gestión de avisos, categorías, usuarios, reservas, ventas — existente
- ✓ API REST y GraphQL vía Strapi v5 — existente
- ✓ Los componentes de lista del dashboard no duplican fetch al renderizar — v1.1
- ✓ La paginación y filtros de cada sección de avisos son independientes entre sí — v1.1
- ✓ Los errores en producción del dashboard son visibles (no suprimidos silenciosamente) — v1.1
- ✓ Los componentes de lista de avisos están consolidados en un componente genérico reutilizable — v1.1
- ✓ Las entidades del dominio (Ad, User, Order, Category) tienen tipos TypeScript compartidos — v1.1
- ✓ Las llamadas N+1 en CategoriesDefault están eliminadas — v1.1
- ✓ ChartSales obtiene datos agregados del servidor, no pagina todos los órdenes en cliente — v1.1
- ✓ Eliminar double-fetch en todos los componentes non-ads del dashboard que tienen `onMounted` + `watch({ immediate: true })` coexistiendo — v1.2
- ✓ Utilidades de fecha, precio y string centralizadas y estrictamente tipadas — v1.3
- ✓ Al rechazar un aviso, el AdReservation y FeaturedReservation asociados quedan disponibles para reuso — v1.5
- ✓ Al banear un aviso, el AdReservation y FeaturedReservation asociados quedan disponibles para reuso — v1.5
- ✓ El email de rechazo notifica al usuario que sus créditos fueron devueltos (condicional) — v1.5
- ✓ El email de baneo notifica al usuario que sus créditos fueron devueltos (condicional) — v1.5
- ✓ Todos los segmentos de URL del dashboard están en inglés — v1.4
- ✓ Las URLs españolas antiguas redirigen a sus equivalentes en inglés (301) — v1.4
- ✓ Todos los links de navegación y referencias internas usan URLs en inglés — v1.4
- ✓ `pages/preguntas-frecuentes.vue` no hace double-fetch al cargar — v1.6
- ✓ `pages/cuenta/mis-anuncios.vue` no dispara 6 llamadas en cada carga — v1.6
- ✓ `packs.store.ts` tiene cache guard para evitar llamadas redundantes — v1.6
- ✓ `conditions.store.ts` tiene cache guard — v1.6
- ✓ `regions.store.ts` tiene cache guard — v1.6
- ✓ `FormCreateThree.vue` no repite la llamada a communes que ya hizo el plugin — v1.6
- ✓ Todos los cron jobs (userCron, backupCron, cleanupCron, adCron) funcionales y documentados en inglés — v1.7
- ✓ `cron-runner` API committed (controller + routes para ejecución manual de crons) — v1.8
- ✓ `ad-free-reservation-restore.cron.ts` garantiza 3 free ad-reservation slots por usuario con lógica correcta — v1.8
- ✓ El sitio web no tiene silent failures — structured data aplicado en todas las páginas, useAsyncData keys únicas, console.error/warn visibles en producción — v1.9
- ✓ Todos los componentes de data-fetching del website usan useAsyncData (SSR-compatible) — onMounted(async) eliminado de 7 componentes — v1.9
- ✓ Todas las páginas del website tienen lang="ts"; any eliminado en stores y composables críticos — v1.9
- ✓ Los 14 stores con persist tienen comentarios de auditoría inline (CORRECT/REVIEW/RISK) — v1.9
- ✓ typeCheck: true habilitado en nuxt.config.ts del website; nuxt typecheck pasa con zero errores — v1.9
- ✓ El plugin GTM `gtm.client.ts` no pushea arrays al dataLayer; Consent Mode v2 implementado — v1.11
- ✓ El dropdown de últimas órdenes muestra nombre completo del comprador y fecha+hora completa — v1.10
- ✓ Dead import `useAdAnalytics` eliminado de `CreateAd.vue`; overcounting de `step_view` corregido; eventos `redirect_to_payment` y `purchase` (guarded) implementados; `DataLayerEvent` exportado y `window.dataLayer` tipado — v1.12
- ✓ `gtm.client.ts` eliminado; `@saslavik/nuxt-gtm@0.1.3` instalado y configurado con `enableRouterSync: true`; GA4 Realtime confirmado funcionando — v1.13
- ✓ `@saslavik/nuxt-gtm@0.1.3` instalado en `apps/dashboard`; módulo configurado con `enableRouterSync: true`; `runtimeConfig.public.gtm.id` reemplaza campo plano `gtmId`; plugin hand-rolled eliminado — v1.14
- ✓ `$setSEO` plugin emite el set completo de OG + Twitter Card tags (`ogTitle`, `ogDescription`, `ogUrl`, `ogType`, `twitterCard`, `twitterTitle`, `twitterDescription`) — v1.15
- ✓ Todos los `https://waldo.click` hardcodeados en páginas reemplazados con `config.public.baseUrl` — v1.15
- ✓ `packs/index.vue`, `packs/comprar.vue`, `cuenta/mis-ordenes.vue`, `cuenta/mis-anuncios.vue` tienen `$setSEO` + `$setStructuredData` — v1.15
- ✓ La página de perfil de usuario `[slug].vue` tiene SEO y datos estructurados restaurados (`ProfilePage` + `Person` schema) — v1.15
- ✓ La home `index.vue` tiene `WebSite` + `Organization` JSON-LD — v1.15
- ✓ `microdata.ts` reemplaza el JSON-LD en lugar de acumularlo en cada navegación SPA — v1.15
- ✓ Páginas privadas/transaccionales declaran `noindex, nofollow` vía `useSeoMeta` (18 páginas) — v1.15
- ✓ El sitemap tiene `changefreq` y `priority` en entradas estáticas; función async `urls()` unificada — v1.15
- ✓ `typeCheck: true` pasa con zero errores después de todos los cambios SEO — v1.15

  - ✓ Todas las páginas dinámicas (home, anuncios listing, ad detail, perfil de usuario) tienen títulos ≤ 45 chars y descripciones 120–155 chars con vocabulario canónico — v1.16
  - ✓ Todas las páginas estáticas (FAQ, contacto, sitemap, políticas) tienen descripciones en budget con `anuncios`, `activos industriales`, `Waldo.click®` — v1.16
  - ✓ `generateSEODescription()` en `anuncios/index.vue` eliminó el contador dinámico `${totalAds}` — v1.16
  - ✓ `sitemap.vue` corregido: `Waldo.click` → `Waldo.click®` en `$setSEO` y `$setStructuredData` — v1.16
  - ✓ Páginas `login/facebook.vue`, `login/google.vue`, `dev.vue` tienen `noindex, nofollow` — v1.16

   - ✓ Sentry restringido a producción en los 3 apps — 7 entry points con `NODE_ENV === 'production'` guard; dev/staging generan cero tráfico a Sentry — v1.17
   - ✓ `strapi.db.query` filtra server-side solo usuarios Authenticated vía `strapi.db.query` (no forgeable por clientes); N+1 eliminado; columna "Rol" removida del dashboard — v1.17
   - ✓ Cada paso del wizard de creación de avisos tiene su propia ruta dedicada (5 URLs en español) — v1.18
   - ✓ Navegación por `?step=N` query param eliminada — v1.18
   - ✓ `resumen.vue` back button apunta a `/anunciar/galeria-de-imagenes` — v1.18
   - ✓ Analytics de pasos del wizard preservados con nombres compatibles con Google Ecommerce — v1.18
   - ✓ `typeCheck: true` pasa con zero errores después de todos los cambios del URL refactor — v1.18
   - ✓ `wizard-guard.ts` middleware previene saltar pasos del wizard; SSR-safe — v1.18

   - ✓ `ad.ts` service: `AdQueryOptions` interface, `computeAdStatus(unknown)`, `transformSortParameter(unknown: unknown)`, all methods typed — zero `any` in ad service — v1.20
   - ✓ `ad.ts` controller: `ctx: Context` (koa) in all methods, `QueryParams` fields `unknown`, `filterClause: Record<string, unknown>` — zero `any` in ad controller — v1.20
   - ✓ `order.types.ts`, `filter.types.ts`, `flow.types.ts` — `payment_response`, `document_details`, `filters`/`sort`/`populate`, all `StrapiFilter` operators → `unknown` — v1.20
   - ✓ `flow.factory.ts` + `flow.service.ts` — `Core.Strapi` DI typing; `Record<string, string>` with `String()` casts for URL param bags — v1.20
   - ✓ Zoho service/interfaces (`IZohoContact` interface with index signature), HTTP client (`params: unknown`, `data: unknown`), Facto SOAP callbacks (`unknown`), Indicador, Google, Transbank, payment-gateway — zero `any` across all integration services — v1.20
   - ✓ `payment.type.ts`, `order/user/ad/general.utils.ts`, `payment.ts` controller, `image-uploader.ts`, `cache.ts`, `user-registration.ts` — all `any` eliminated; `BillingDetails` exported for `FactoDocumentData.userDetails` — v1.20
   - ✓ All 5 seeder files use `Core.Strapi` (not `strapi: any`); 4 payment test files use typed result interfaces + `(global as unknown as { strapi: MockStrapi })` cast — v1.20
   - ✓ `tsc --noEmit` exits 0 and all Jest tests pass after every phase — v1.20

## Context

- Monorepo con Turbo para orquestación de tareas
- Strapi v5 es el backend central; Website y Dashboard son clientes HTTP de sus APIs
- Transbank integrado en el flujo de creación de aviso en Strapi, abstraído detrás de IPaymentGateway (v1.0)
- El sistema valida disponibilidad de créditos según PackType y FeaturedType antes de procesar el pago
- Deploy independiente por app vía Laravel Forge con git sparse-checkout
- Dashboard (apps/dashboard): Nuxt 4, Pinia, @nuxtjs/strapi v2, SCSS custom; ~65 componentes, 3 stores, 14 plugins; typeCheck: true (since v1.1)
- Website (apps/website): Nuxt 4, Pinia, @nuxtjs/strapi v2; 34 páginas lang="ts" (5 new step pages added in v1.18), 14 stores con persist audit, typeCheck: true (since v1.9)
- Ad creation wizard (v1.18): 5 dedicated routes (`/anunciar`, `/anunciar/datos-del-producto`, `/datos-personales`, `/ficha-de-producto`, `/galeria-de-imagenes`); `wizard-guard.ts` middleware prevents step skipping (SSR-safe); `stepRoutes` Record map in `CreateAd.vue`; per-page `stepView` analytics
- 4 cron jobs activos en Strapi: `adCron` (1 AM), `userCron` (2 AM), `backupCron` (3 AM), `cleanupCron` (domingo 4 AM)
- `cron-runner` API disponible en `POST /api/cron-runner/:name` para ejecución manual de cualquier cron
- GTM handled via `@saslavik/nuxt-gtm@0.1.3` module in both website (since v1.13) and dashboard (since v1.14) — `enableRouterSync: true` fires page_view on every SPA route change; GTM ID from `runtimeConfig.public.gtm.id`; hand-rolled `gtm.client.ts` plugins deleted in both apps
- Ad creation analytics (`useAdAnalytics.ts`): all events tracked — view_item_list, step_view (exact, no overcounting, per-page), begin_checkout, redirect_to_payment, purchase (guarded); `DataLayerEvent` fully typed in `window.d.ts` (since v1.12)
- SEO infrastructure (v1.15): `$setSEO` plugin in `seo.ts` emits full OG + Twitter Card set; `$setStructuredData` in `microdata.ts` with key-based deduplication; `@nuxtjs/seo` provides sitemap (with static entries having `changefreq`/`priority`), robots, OG defaults; all page URLs use `config.public.baseUrl`; 18+ private pages have `noindex`; home has WebSite + Organization JSON-LD; user profile `[slug].vue` has ProfilePage + Person schema
- Strapi TypeScript (v1.20): zero `any` in ad service/controller, all type files, all integration services (Zoho, Facto, Indicador, Google, Transbank, payment-gateway), all payment utils/middlewares, all seeders, and all payment test files; `tsc --noEmit` exits 0; established patterns: `AdQueryOptions`, `IZohoContact`, `IWebpayCommitData`, data double-cast for entityService JSON fields, `Core.Strapi` for DI typing

## Constraints

- **Tech**: Nuxt 4, Vue 3 Composition API, TypeScript strict — refactors deben seguir patrones existentes
- **Sin breaking changes**: El comportamiento del dashboard desde la perspectiva del usuario no debe cambiar
- **Sin tests**: Los tests unitarios quedan para un milestone dedicado posterior (excepto utilities v1.3 que sí tienen tests)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Abstracción en Strapi, no en el frontend | Toda la lógica de negocio vive en Strapi; el frontend es stateless | ✓ Good |
| Transbank como adaptador default | Mantiene compatibilidad hacia atrás, cero cambios en el flujo actual | ✓ Good |
| `watch({ immediate: true })` como único trigger de carga | Elimina double-fetch sin cambiar comportamiento; onMounted es el duplicado | ✓ Good |
| Claves de sección dedicadas por status en settings store | Isolation completa de paginación/filtros; nunca compartir clave entre vistas distintas | ✓ Good |
| Componente genérico `AdsTable` en lugar de 6 variantes | Elimina ~1,200 líneas duplicadas; variación real es solo endpoint + section + showWebLink | ✓ Good |
| Reservations*/Featured* consolidation deferred | Store keys compartidos causan conflictos de paginación; fetch strategies incompatibles | ✓ Good |
| Shared domain types en `app/types/` | 62 ocurrencias de `any` y tipos redeclarados → un único source of truth | ✓ Good |
| Strapi SDK v5 cast pattern | `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast | ✓ Good |
| Aggregate endpoints en Strapi para N+1 | N HTTP round trips → 1; N DB queries paralelas server-side son negligibles | ✓ Good |
| `typeCheck: true` habilitado en v1.1 | Todo trabajo futuro en dashboard tiene type checking en build | ✓ Good |
| Strict null handling in utilities | Ensures `undefined`/`null` never crash the UI, returning fallback strings | ✓ Good |
| Consolidated utility files | Reduces code duplication and ensures consistent formatting across the app | ✓ Good |
| `git mv` para renombrar directorios y archivos de rutas | Preserva historial de Git en renombres de Nuxt page files; dos commits: rename primero, refs después — v1.4 | ✓ Good |
| Labels de UI en español se preservan (solo rutas en inglés) | Las breadcrumbs y labels son contenido visible por usuario — no se traducen en esta migración — v1.4 | ✓ Good |
| `routeRules` explícitas (sin wildcards `:splat`) | Rutas explícitas cubren el 100% sin incompatibilidades de TypeScript/build — v1.4 | ✓ Good |
| Links externos al sitio web público exentos de localización | Solo rutas del dashboard en scope; `websiteUrl + /anuncios/[slug]` son URLs del sitio público — v1.4 | ✓ Good |
| Reservation freeing updates reservation side (FK on reservation, not ad) | Consistent with existing cron pattern in `user.cron.ts`; `entityService.update(uid, id, { data: { ad: null } })` — v1.5 | ✓ Good |
| No try/catch around reservation-freeing calls | If freeing fails, whole reject/ban should fail — caller handles outer error; silent failure would leave orphaned credits — v1.5 | ✓ Good |
  | `!!ad.ad_reservation?.id` evaluated on pre-freed ad object | Ad is fetched before freeing runs; original value correctly reflects "did this ad have a reservation?" for email flag — v1.5 | ✓ Good |
  | `useAsyncData`-only data loading in website pages | Bare `await` store calls before `useAsyncData` cause double-fetch (SSR + client); single `useAsyncData` is the canonical pattern — v1.6 | ✓ Good |
  | Aggregate `GET /ads/me/counts` endpoint vs. 5 parallel client calls | Server-side `Promise.all` with 5 `entityService.count()` calls; client sees 1 HTTP request instead of 5 — v1.6 | ✓ Good |
  | Cache guard: array-length + timestamp (not timestamp-only) | Timestamp-only guard produces false cache hit on empty state after TTL reset; length check ensures data actually exists — v1.6 | ✓ Good |
  | `packs.store.ts` gained localStorage `persist` | Without persist the cache guard is useless on page refresh (store always empty); aligns packs with conditions/regions stores — v1.6 | ✓ Good |
  | `featuredCron` "free available" = price=0 AND (ad=null OR ad.active=false) | An occupied slot must mean the ad is currently active; an inactive ad's slot is reclaimable — v1.8 | ✓ Good |
  | `featuredCron` creates slots with no `total_days` | Featured reservations have no expiry concept; omitting total_days matches schema intent (field is optional) — v1.8 | ✓ Good |
  | `featuredCron` schedule at 2:30 AM (not 2:00 AM) | Slots between existing userCron (2:00 AM) and backupCron (3:00 AM); 30-min gap prevents overlap — v1.8 | ✓ Good |
  | `featured.cron.ts` reverted post-implementation | Business decision: free-slot guarantee already covered by `ad-free-reservation-restore.cron.ts`; duplicate cron removed — v1.8 | ✓ Good |
  | `ad-free-reservation-restore.cron.ts` counts by `ad.active=true` | Reservations linked to inactive/expired ads are consumed history, not available pool — v1.8 | ✓ Good |
  | Batch size of 50 users for parallel processing | Avoids DB connection pool exhaustion; `Promise.all` per batch for throughput — v1.8 | ✓ Good |
  | `window.d.ts` consolidates all Window globals | TypeScript merges all declare global blocks; one file prevents per-file duplication — v1.9 | ✓ Good |
  | `StrapiUser` augmented in `strapi.d.ts` | One declaration makes custom fields available everywhere `useStrapiUser()` is called — v1.9 | ✓ Good |
  | `Ad.category` and `Ad.commune` widened to union types | Models populated vs. unpopulated Strapi responses correctly; `number \| CategoryObject` — v1.9 | ✓ Good |
  | `createError statusMessage` not `description` | `NuxtError` extends `H3Error`; `statusMessage` is the correct field — v1.9 | ✓ Good |
  | `useAsyncData` default option eliminates `T \| undefined` | Removes undefined from type without changing runtime behavior; props receive `T` cleanly — v1.9 | ✓ Good |
  | `typeCheck: true` permanently enabled in website | Every future build enforces TypeScript; TS-04 goal achieved; no more deferred type errors — v1.9 | ✓ Good |
  | dataLayer push approach (no separate gtag.js) for Consent Mode v2 | GTM reads dataLayer natively; loading gtag.js separately would create two competing tag systems — v1.11 | ✓ Good |
  | Default consent denial pushed before GTM script loads | Consent Mode v2 requires denial-first; GTM processes dataLayer in order so pre-load push ensures compliance — v1.11 | ✓ Good |
  | `window.dataLayer` typed as `(DataLayerEvent \| Record<string, unknown>)[]` union | Covers both GA4 analytics events and GTM consent commands (plain objects without event/flow fields) — v1.12 | ✓ Good |
  | `purchaseFired` ref guard on `gracias.vue` purchase event | `watchEffect` can re-run; ref guard ensures exactly one purchase event regardless of re-render — v1.12 | ✓ Good |
  | `@saslavik/nuxt-gtm` over `@nuxtjs/gtm` or `@zadigetvoltaire/nuxt-gtm` | `@nuxtjs/gtm` is Nuxt 2 only; `@zadigetvoltaire/nuxt-gtm` not Nuxt 4 compatible; `@saslavik` is the only maintained Nuxt 4 option — v1.13 | ✓ Good |
  | GTM module `enableRouterSync: true` replaces manual `router.afterEach` push | Module handles SPA page_view natively; eliminates hand-rolled plugin entirely — v1.13 | ✓ Good |
  | `runtimeConfig.public.gtm.id` replaces `gtmId` flat field | Nested object keeps GTM config grouped; optional chaining `?.id` in feature flag avoids runtime errors if not set — v1.13 | ✓ Good |
  | `$setSEO` extended to emit full OG + Twitter tag set | `useSeoMeta` is the canonical Nuxt 4 way; deriving `ogTitle` from `title` prevents call-site changes — v1.15 | ✓ Good |
  | `config.public.baseUrl` for all absolute SEO URLs | Environment-agnostic; single source of truth already present in runtimeConfig — v1.15 | ✓ Good |
  | `useHead` key on JSON-LD script entry prevents accumulation | Nuxt merges `useHead` calls with matching keys; no custom dedup logic needed — v1.15 | ✓ Good |
  | `noindex` via `useSeoMeta` as defense-in-depth | robots.txt already disallows private paths; inline noindex survives misconfiguration or direct deep-links — v1.15 | ✓ Good |
  | Static copy for all `$setSEO` calls — no dynamic counters | Counters like `${totalAds}` go stale on SSR; static keyword-rich copy is more durable and SERP-accurate — v1.16 | ✓ Good |
  | Title budget enforced at ≤ 45 chars (excluding `\| Waldo.click®` suffix) | `@nuxtjs/seo` appends the suffix automatically; including it manually causes double-brand in rendered title — v1.16 | ✓ Good |
   | `$setStructuredData` description always mirrors `$setSEO` description | Structured data must be consistent with visible meta; kept as verbatim copy in same edit — v1.16 | ✓ Good |
   | `strapi.db.query` for role filter, not content-API service | Content-API sanitizer strips `filters[role]` for regular JWTs; `db.query` bypasses it — non-forgeable server-side enforcement — v1.17 | ✓ Good |
   | Inline sanitize (spread + omit) replaces `getDetailedUserData` on users list | N+1 eliminated: `Promise.all(users.map(getDetailedUserData))` replaced with field-spread; no loss of list functionality — v1.17 | ✓ Good |
   | `dsn: undefined` for production-only Sentry (not conditional init) | SDK-supported pattern; skips all instrumentation with zero overhead; consistent with existing correct files in repo — v1.17 | ✓ Good |
   | `enabled: process.env.NODE_ENV === 'production'` in Strapi Sentry plugin | Unloads plugin entirely in dev/staging; `enabled: true` was shipping dev/staging noise to Sentry — v1.17 | ✓ Good |
   | `stepRoutes` Record map in `CreateAd.vue` for step-to-path routing | Explicit Record avoids magic strings; route-push is cleaner than query-param mutation — v1.18 | ✓ Good |
   | `onMounted` (not watcher) for analytics + step sync in each step page | Each page mounts fresh on navigation; mount is the correct trigger; avoids overcounting — v1.18 | ✓ Good |
   | Removed multi-step watcher from `index.vue` — per-page analytics only | Each dedicated step page owns its own `stepView`; centralized watcher caused double-counting — v1.18 | ✓ Good |
   | `wizard-guard.ts` middleware added post-verification as step-skip prevention | Out of original scope but low-risk addition; improves UX by redirecting to first incomplete step — v1.18 | ✓ Good |
   | `if (import.meta.server) return;` in `wizard-guard.ts` | `adStore` uses `storage: localStorage` → `storage: undefined` on server → empty initial state → always redirected; SSR guard prevents false redirects — v1.18 | ✓ Good |
   | `Zoho-oauthtoken` header prefix (not `Bearer`) in ZohoHttpClient | Zoho CRM API rejects `Bearer` scheme; correct prefix required for all outbound requests — v1.19 | ✓ Good |
   | 401 interceptor with `_retry` guard in ZohoHttpClient | Token refresh loop prevention; single retry after re-auth; calling code never sees expired token errors — v1.19 | ✓ Good |
   | `axios-mock-adapter` injected via optional constructor param | Test isolation without touching production path; real env vars never needed in unit tests — v1.19 | ✓ Good |
   | `Stage: "Cerrado ganado"` hardcoded in `createDeal()` | All Waldo deals are immediately closed; callers never pass Stage; Spanish value matches CRM pipeline — v1.19 | ✓ Good |
   | Floating promise (`.then().catch()`) for `ad_paid` Zoho sync | `adResponse` controller issues `ctx.redirect()` immediately after; awaiting Zoho would block the redirect — v1.19 | ✓ Good |
   | `await` (blocking) for `pack_purchased` Zoho sync | `processPaidWebpay` for packs is not a redirect handler; blocking is safe and simpler — v1.19 | ✓ Good |
   | First-publish guard (`isPending` check) in `approveAd()` | Re-approving an already-published ad must not double-increment `Ads_Published__c` — v1.19 | ✓ Good |
   | `AdQueryOptions` interface for ad service method params | Expresses intent for query shape (page, pageSize, filters, sort, populate); avoids bare `Record<string, unknown>` which loses semantics — v1.20 | ✓ Good |
   | `ad: unknown` → `Record<string, unknown>` narrowing for `computeAdStatus` | Safe access to Strapi entity fields without runtime risk; avoids `any` while preserving flexibility — v1.20 | ✓ Good |
   | `IZohoContact { id: string; [key: string]: unknown }` interface | Callers access `.id` on contact results; plain `unknown` would break 9 call sites; index signature preserves flexibility — v1.20 | ✓ Good |
   | `IWebpayCommitData` with optional fields + index signature | Optional fields allow partial test mock objects (`{ buy_order: "x" }`) to compile; index signature allows callers to access arbitrary fields — v1.20 | ✓ Good |
   | Data double-cast `as unknown as Parameters<...>[N]["data"]` for entityService JSON fields | Strapi's `entityService` expects `JSONValue` (stricter than `unknown`); double-cast is the AGENTS.md-aligned way to pass typed data — v1.20 | ✓ Good |
   | `WebpayAdResult` local interface for `processPaidWebpay` | TypeScript union narrowing doesn't work on optional property absence; local interface gives exact type safety at the guard site — v1.20 | ✓ Good |
   | `(global as unknown as { strapi: MockStrapi })` for test global | `@strapi/types` already declares `global var strapi: Strapi`; redeclaring with narrower type causes TS conflict; double-cast via `unknown` bypasses without touching global scope — v1.20 | ✓ Good |
   | `Core.Strapi` (imported from `@strapi/strapi`) for seeder + factory DI params | Official Strapi-provided type for the full Strapi instance; replaces `strapi: any` in all seeder functions and service factories — v1.20 | ✓ Good |

## Future Requirements

### Testing (next dedicated milestone)

- **TEST-01**: Composables (`useRut`, `useSanitize`, `useSlugify`, `useImageProxy`) tienen tests unitarios con Vitest
- **TEST-02**: El componente `AdsTable.vue` tiene tests de comportamiento (renderizado, filtros, paginación)
- **TEST-03**: Los middlewares `guard.global.ts` y `dev.global.ts` tienen tests de integración
- **TEST-04**: Cobertura mínima configurada (>70% en composables y stores)

### Additional Consolidation (prerequisites now met after v1.1)

- **COMP-05**: Consolidar Reservations*/Featured* una vez que tengan store keys dedicados y estrategias de fetch alineadas
- **COMP-06**: `ChartSales.vue` soporta filtros por rango de fechas usando el endpoint de agregación

---
*Last updated: 2026-03-08 after v1.20 milestone — TypeScript any Elimination complete*
