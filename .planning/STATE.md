# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Milestone v1.0 — Payment Gateway Abstraction

---

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-03 — Milestone v1.0 started

---

## Accumulated Context

- Dos pasarelas ya existen en el código: `TransbankService` (pagos de avisos/packs) y `FlowService` (suscripciones Pro) — con cero interfaz compartida
- Los puntos de acoplamiento son `ad.service.ts` y `pack.service.ts` que importan directamente `TransbankServices`
- El flujo de pago es redirect-based: `createTransaction` → redirect al usuario → callback → `commitTransaction`
- `buy_order` codifica contexto como string (`order-{userId}-{adId}-{uniqueId}`) — el adapter debe preservar este comportamiento
- `payment_method: "webpay"` está hardcodeado en el controller — debe parametrizarse
- Bug conocido: falta `return` después de `ctx.redirect` en el flujo de pack fallido
- La suscripción Pro (FlowService) es un dominio separado — NO incluir en esta abstracción
