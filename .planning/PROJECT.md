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

### Active

*(empty — define for next milestone via /gsd:new-milestone)*

### Out of Scope

- UI para que el usuario elija pasarela — no requerido ahora, los usuarios pagan transparentemente
- Integración de una segunda pasarela concreta — el trabajo actual es solo la abstracción
- Cambios en Website o Strapi para features de usuario — dashboard-first approach
- Internacionalización (i18n) — módulo comentado, deferido conscientemente

## Context

- Monorepo con Turbo para orquestación de tareas
- Strapi v5 es el backend central; Website y Dashboard son clientes HTTP de sus APIs
- Transbank integrado en el flujo de creación de aviso en Strapi, abstraído detrás de IPaymentGateway (v1.0)
- El sistema valida disponibilidad de créditos según PackType y FeaturedType antes de procesar el pago
- Deploy independiente por app vía Laravel Forge con git sparse-checkout
- Dashboard (apps/dashboard): Nuxt 4, Pinia, @nuxtjs/strapi v2, SCSS custom; ~65 componentes, 3 stores, 14 plugins
- v1.1 shipped: AdsTable generic component, canonical domain types, typeCheck: true, 3 Strapi aggregate endpoints
- Aggregate endpoints added to Strapi in v1.1: `/api/categories/ad-counts`, `/api/orders/sales-by-month`, `/api/indicators/dashboard-stats`

## Constraints

- **Tech**: Nuxt 4, Vue 3 Composition API, TypeScript strict — refactors deben seguir patrones existentes
- **Sin breaking changes**: El comportamiento del dashboard desde la perspectiva del usuario no debe cambiar
- **Sin tests**: Los tests unitarios quedan para un milestone dedicado posterior

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
*Last updated: 2026-03-05 after v1.1 milestone*
