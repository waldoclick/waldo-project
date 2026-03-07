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

### Active

- GTM-DASH-01: `@saslavik/nuxt-gtm@0.1.3` instalado en `apps/dashboard` y agregado a modules — v1.14
- GTM-DASH-02: Módulo configurado con `enableRouterSync: true`; GTM ID leído desde `runtimeConfig.public.gtm.id`; campo plano `gtmId` eliminado — v1.14
- GTM-DASH-03: `nuxt typecheck` pasa con zero errores en `apps/dashboard` — v1.14

## Previous State

<details>
<summary>v1.13 GTM Module Migration (shipped 2026-03-07)</summary>

- **Phase 33 — GTM Module Migration**: Deleted `gtm.client.ts`; installed `@saslavik/nuxt-gtm@0.1.3`; configured with `enableRouterSync: true` and `runtimeConfig.public.gtm.id`; feature flag updated to `!!config.public.gtm?.id`; GA4 Realtime confirmed working locally.

</details>

<details>
<summary>v1.12 Ad Creation Analytics Gaps (shipped 2026-03-07)</summary>

- **Phase 32 — Analytics Gaps Cleanup**: Dead `useAdAnalytics` import removed from `CreateAd.vue`; `step_view` overcounting fixed (no `immediate: true` on step watcher, explicit step 1 in `onMounted`); `redirect_to_payment` event added before Webpay redirect in `resumen.vue`; `purchase` event guarded with `fired` ref in `gracias.vue`; `DataLayerEvent` exported from `useAdAnalytics.ts` and `window.dataLayer` typed as `(DataLayerEvent | Record<string, unknown>)[]`.

</details>

<details>
<summary>v1.11 GTM / GA4 Tracking Fix (shipped 2026-03-07)</summary>

- **Phase 31 — GTM Plugin + Consent Mode v2**: Removed broken `gtag()` shim from `gtm.client.ts`; SPA `page_view` now pushes plain objects; Consent Mode v2 default denial pushed before GTM loads; `LightboxCookies.vue` pushes correct consent update command on accept.

</details>

<details>
<summary>v1.10 Dashboard Orders Dropdown UI (shipped 2026-03-07)</summary>

- **Phase 30 — Dropdown Display Fix**: `DropdownSales.vue` now shows buyer full name (`firstname + lastname`, fallback to `username` then `email`) and full date + time (`"7 mar 2026 • 01:08 a. m."`) for every order row.

</details>

<details>
<summary>v1.9 Website Technical Debt (shipped 2026-03-07)</summary>

- **Phase 25 — Critical Correctness Bugs**: Fixed `$setStructuredData` type augmentation; corrected `useAsyncData` key collisions; restored `console.error`/`warn` in production; fixed SSR/CSR hydration in `mis-anuncios` and `mis-ordenes`; fixed Strapi `/ads/me` route ordering.
- **Phase 26 — Data Fetching Cleanup**: Moved `onMounted(async)` data-fetching to `useAsyncData` in 7 components; all 33 `onMounted` calls documented with classification comments.
- **Phase 27 — TypeScript Migration**: Migrated all 17 pages to `lang="ts"`; eliminated `any` in 3 stores and 3 composables.
- **Phase 28 — TypeScript Strict + Store Audit**: Added persist audit comments to all 14 stores (STORE-01); Strapi SDK filter casts in 4 stores.
- **Phase 29 — TypeScript Strict Errors**: Fixed all 183 typecheck errors across 55 files via type declarations and call-site corrections; enabled `typeCheck: true`; `nuxt typecheck` passes with zero errors.

</details>

<details>
<summary>v1.8 Free Featured Reservation Guarantee (shipped 2026-03-07)</summary>

- **`ad-free-reservation-restore.cron.ts` logic fix**: Reservations stay permanently linked to expired ads (history); `restoreUserFreeReservations` counts by `ad.active=true` not `remaining_days>0`; cron simplified to single responsibility — guarantee 3 free reservations per user.
- **Parallel batch processing**: `Promise.all` in batches of 50 users to avoid DB connection pool exhaustion.
- **`cron-runner` API committed**: Controller + routes for manual cron job execution via `POST /api/cron-runner/:name`.
- **`featured.cron.ts` reverted**: Implemented and then removed by business decision — the free-slot guarantee is covered by `ad-free-reservation-restore.cron.ts`.

</details>

## Context

- Monorepo con Turbo para orquestación de tareas
- Strapi v5 es el backend central; Website y Dashboard son clientes HTTP de sus APIs
- Transbank integrado en el flujo de creación de aviso en Strapi, abstraído detrás de IPaymentGateway (v1.0)
- El sistema valida disponibilidad de créditos según PackType y FeaturedType antes de procesar el pago
- Deploy independiente por app vía Laravel Forge con git sparse-checkout
- Dashboard (apps/dashboard): Nuxt 4, Pinia, @nuxtjs/strapi v2, SCSS custom; ~65 componentes, 3 stores, 14 plugins; typeCheck: true (since v1.1)
- Website (apps/website): Nuxt 4, Pinia, @nuxtjs/strapi v2; 29 páginas lang="ts", 14 stores con persist audit, typeCheck: true (since v1.9)
- 4 cron jobs activos en Strapi: `adCron` (1 AM), `userCron` (2 AM), `backupCron` (3 AM), `cleanupCron` (domingo 4 AM)
- `cron-runner` API disponible en `POST /api/cron-runner/:name` para ejecución manual de cualquier cron
- GTM handled via `@saslavik/nuxt-gtm@0.1.3` module (since v1.13) — `enableRouterSync: true` fires page_view on every SPA route change; GTM ID from `runtimeConfig.public.gtm.id`; hand-rolled `gtm.client.ts` plugin deleted
- Ad creation analytics (`useAdAnalytics.ts`): all events tracked — view_item_list, step_view (exact, no overcounting), begin_checkout, redirect_to_payment, purchase (guarded); `DataLayerEvent` fully typed in `window.d.ts` (since v1.12)

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
*Last updated: 2026-03-07 after v1.14 milestone start (GTM Module: Dashboard)*
