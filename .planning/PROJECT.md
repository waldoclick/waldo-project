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

### Active

- [ ] Los componentes de lista del dashboard no duplican fetch al renderizar
- [ ] La paginación y filtros de cada sección de avisos son independientes entre sí
- [ ] Los errores en producción del dashboard son visibles (no suprimidos silenciosamente)
- [ ] Los componentes de lista de avisos están consolidados en un componente genérico reutilizable
- [ ] Las entidades del dominio (Ad, User, Order, Category) tienen tipos TypeScript compartidos
- [ ] Las llamadas N+1 en CategoriesDefault están eliminadas
- [ ] ChartSales obtiene datos agregados del servidor, no pagina todos los órdenes en cliente

### Out of Scope

- UI para que el usuario elija pasarela — no requerido ahora, los usuarios pagan transparentemente
- Integración de una segunda pasarela concreta — el trabajo actual es solo la abstracción
- Tests unitarios exhaustivos — alcance para un milestone dedicado posterior
- Cambios en Website o Strapi — todo el trabajo de este milestone es en apps/dashboard

## Context

- Monorepo con Turbo para orquestación de tareas
- Strapi v5 es el backend central; Website y Dashboard son clientes HTTP de sus APIs
- Transbank integrado en el flujo de creación de aviso en Strapi, ahora abstraído detrás de IPaymentGateway (v1.0)
- El sistema valida disponibilidad de créditos según PackType y FeaturedType antes de procesar el pago
- Deploy independiente por app vía Laravel Forge con git sparse-checkout
- Dashboard (apps/dashboard): Nuxt 4, Pinia, @nuxtjs/strapi v2, SCSS custom; ~65 componentes flat, 3 stores, 14 plugins
- Deuda técnica identificada en v1.1: duplicación masiva en componentes Ads*, double fetch, paginación compartida, errores silenciados en prod

## Constraints

- **Tech**: Nuxt 4, Vue 3 Composition API, TypeScript strict — refactors deben seguir patrones existentes
- **Sin breaking changes**: El comportamiento del dashboard desde la perspectiva del usuario no debe cambiar
- **Sin Strapi ni Website**: Todo el trabajo de v1.1 es exclusivamente en apps/dashboard
- **Sin tests**: Los tests unitarios quedan para un milestone dedicado posterior

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Abstracción en Strapi, no en el frontend | Toda la lógica de negocio vive en Strapi; el frontend es stateless | ✓ Good |
| Transbank como adaptador default | Mantiene compatibilidad hacia atrás, cero cambios en el flujo actual | ✓ Good |
| Componente genérico `AdsTable` en lugar de 6 variantes | Elimina ~1,200 líneas duplicadas; la variación real es solo endpoint + modificador CSS | — Pending |
| Shared domain types en `app/types/` | 62 ocurrencias de `any` y tipos redeclarados por componente → un único source of truth | — Pending |

## Current Milestone: v1.1 Dashboard Technical Debt Reduction

**Goal:** Eliminar la deuda técnica crítica del dashboard: duplicación de componentes, double fetch, paginación compartida entre vistas, errores silenciados en producción, y N+1 de categorías.

**Target features:**
- Quick wins: fix double fetch, paginación por sección, pinear versiones, restaurar observabilidad de errores
- Consolidación de componentes: `AdsTable` genérico que reemplaza 6 componentes duplicados
- Type safety: shared domain types, reducción de `any` en rutas críticas
- Performance: eliminar N+1 en categorías, agregar datos de ventas en servidor

---
*Last updated: 2026-03-04 after milestone v1.1 initialization*
