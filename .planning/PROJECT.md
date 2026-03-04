# Waldo Project

## What This Is

Plataforma de clasificados (avisos) compuesta por tres aplicaciones en un monorepo: un sitio web público (Nuxt.js 4), un dashboard de administración (Nuxt.js + Electron) y una API/CMS (Strapi v5). Toda la lógica de negocio vive en Strapi; el frontend solo consume sus APIs.

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

- [ ] La lógica de pago en Strapi está abstraída detrás de una interfaz/adaptador de pasarela
- [ ] Transbank funciona como pasarela default sin cambios en el comportamiento actual
- [ ] Se puede agregar una nueva pasarela de pago sin modificar el flujo de creación de aviso
- [ ] La selección de pasarela es configurable a nivel de sistema (sin cambios en UI para el usuario)

### Out of Scope

- UI para que el usuario elija pasarela — no requerido ahora, los usuarios pagan transparentemente
- Integración de una segunda pasarela concreta — el trabajo actual es solo la abstracción
- Cambios en Website o Dashboard — todo el trabajo es en Strapi

## Context

- Monorepo con Turbo para orquestación de tareas
- Strapi v5 es el backend central; Website y Dashboard son clientes HTTP de sus APIs
- Transbank está integrado en el flujo de creación de aviso en Strapi — acoplamiento que bloquea la adición de otras pasarelas
- El sistema valida disponibilidad de créditos según PackType y FeaturedType antes de procesar el pago
- Deploy independiente por app vía Laravel Forge con git sparse-checkout

## Constraints

- **Tech**: Strapi v5 (Node.js) — la abstracción debe seguir los patrones de Strapi v5
- **Compatibilidad**: El flujo de creación de aviso existente no debe cambiar su comportamiento
- **Sin UI**: No hay cambios en Website ni Dashboard en esta iteración
- **Transbank**: La integración actual debe seguir funcionando exactamente igual

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Abstracción en Strapi, no en el frontend | Toda la lógica de negocio vive en Strapi; el frontend es stateless | — Pending |
| Transbank como adaptador default | Mantiene compatibilidad hacia atrás, cero cambios en el flujo actual | — Pending |

## Current Milestone: v1.0 Payment Gateway Abstraction

**Goal:** Abstraer la capa de pagos en Strapi v5 para desacoplarla de Transbank, manteniendo el comportamiento actual y dejando la arquitectura lista para agregar otras pasarelas en el futuro.

**Target features:**
- Interfaz `IPaymentGateway` con contrato normalizado
- `TransbankAdapter` que envuelve el servicio existente sin cambios de comportamiento
- `PaymentGatewayRegistry` / factory que resuelve la pasarela activa vía env var
- Wiring de `ad.service.ts` y `pack.service.ts` para usar la factory en lugar de importar Transbank directamente

---
*Last updated: 2026-03-03 after milestone v1.0 initialization*
