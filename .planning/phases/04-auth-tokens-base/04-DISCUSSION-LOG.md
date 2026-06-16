# Phase 04: Auth + tokens base - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 04-auth-tokens-base
**Mode:** `--auto` (recommended defaults auto-selected, anchored to `design/auth.dc.html`)
**Areas discussed:** Variables SCSS, Layout auth, Panel marca, Formularios, Iconos, Scope

---

## Variables SCSS

| Option | Description | Selected |
|--------|-------------|----------|
| Recalibrar variables existentes in-place | Cambiar los valores de `$light_peach`, `$charcoal`, etc. | |
| Crear variables nuevas, no tocar las existentes | Agregar `$ink`, `$amber`, etc. y apuntar auth a ellas | ✓ |

**User's choice:** Crear variables nuevas (regla dura del usuario, repetida varias veces).
**Notes:** Valores de la maqueta. Poppins no se toca (ya es global).

## Layout auth

| Option | Description | Selected |
|--------|-------------|----------|
| Mantener 45/55 | Proporción actual | |
| Split 50/50 per maqueta | Igualar a la maqueta | ✓ |

**User's choice:** 50/50 (maqueta). Responsive column-reverse existente se mantiene.

## Panel marca

| Option | Description | Selected |
|--------|-------------|----------|
| Mantener charcoal + imagen | Fondo oscuro con `PictureDefault` | |
| Tarjeta crema + glows ámbar CSS | Per maqueta, logo negro, bullets check ámbar, footer seguridad | ✓ |

**User's choice:** Tarjeta crema (maqueta). Drop de `PictureDefault` en auth.

## Formularios

| Option | Description | Selected |
|--------|-------------|----------|
| Mantener centrado/estilo actual | Títulos centrados, estilo viejo | |
| Restilizar a la maqueta | Izq., Google ámbar, focus ring ámbar, medidor, OTP, 2 pasos | ✓ |

**User's choice:** Restilizar a la maqueta. Comportamiento sin cambios.

## Iconos

| Option | Description | Selected |
|--------|-------------|----------|
| SVG inline como la maqueta | Copiar los SVG | |
| `lucide-vue-next` (ya instalado) | Componentes Lucide | ✓ |

**User's choice:** Lucide (ya está instalado `^0.486.0`).

## Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Website + dashboard auth | Ambos apps | |
| Solo website auth | Solo `apps/website` | ✓ |

**User's choice:** Solo website. Dashboard auth = fase futura.

## Deferred Ideas

- Auth del dashboard — fase futura no aprobada.
- Áreas público / cuenta / dashboard — fases futuras no aprobadas.
- Actualizar tabla Brand Colors de CLAUDE.md — opcional.
