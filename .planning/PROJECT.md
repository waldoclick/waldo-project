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

### Active

_(none — awaiting next milestone definition)_

### Out of Scope

- UI para que el usuario elija pasarela — no requerido ahora, los usuarios pagan transparentemente
- Integración de una segunda pasarela concreta — el trabajo actual es solo la abstracción
- Cambios en Website o Strapi para features de usuario — dashboard-first approach
- Internacionalización (i18n) — módulo comentado, deferido conscientemente
- Migración de URLs del sitio web público — scope solo dashboard
- URL aliases permanentes (mantener ambas funcionando) — los redirects 301 son suficientes

## Previous State

Shipped **v1.5 Ad Credit Refund** on 2026-03-06.
- **Credit refund**: `rejectAd()` and `bannedAd()` in Strapi now free `ad_reservation.ad = null` and `ad_featured_reservation.ad = null` before sending email, using the same `entityService.update` pattern as the existing cron.
- **Email notification**: `ad-rejected.mjml` and `ad-banned.mjml` render conditional Spanish-language credit-return paragraphs when `adReservationReturned` / `featuredReservationReturned` flags are true; ads with no reservations show no credit messaging.

## Context

- Monorepo con Turbo para orquestación de tareas
- Strapi v5 es el backend central; Website y Dashboard son clientes HTTP de sus APIs
- Transbank integrado en el flujo de creación de aviso en Strapi, abstraído detrás de IPaymentGateway (v1.0)
- El sistema valida disponibilidad de créditos según PackType y FeaturedType antes de procesar el pago
- Deploy independiente por app vía Laravel Forge con git sparse-checkout
- Dashboard (apps/dashboard): Nuxt 4, Pinia, @nuxtjs/strapi v2, SCSS custom; ~65 componentes, 3 stores, 14 plugins
- v1.3 shipped: `date.ts`, `price.ts`, `string.ts` utilities created and fully integrated
- v1.4 shipped: all dashboard routes in English, 301 redirects for all legacy Spanish URLs

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
*Last updated: 2026-03-06 after v1.5 milestone*
