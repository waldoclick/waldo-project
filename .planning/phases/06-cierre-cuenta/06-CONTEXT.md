# Phase 06: Cierre cuenta (gaps) - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Cerrar los huecos detectados tras la fase 05 (rediseño cuenta), para que el área quede **funcional e idéntica** end-to-end. Cuatro frentes: (1) header + menú de usuario rediseñados, (2) botones de acción cableados (sin no-ops), (3) permisos de los endpoints de stats, (4) stats por-anuncio y contactos con datos reales. Solo `apps/website` + `apps/strapi` (permiso). Reusar/actualizar componentes existentes; loop visual para los frentes visuales (header, menú, card meta).
</domain>

<decisions>
## Implementation Decisions

### Header + menú de usuario (visual)
- **D-01:** Rediseñar `HeaderDefault.vue` a la maqueta (header del `account.dc.html` líneas 28-37 + `design/index.dc.html` header): barra **sticky top:0, height 70px, max-width 1200, padding 0 32, border-bottom 1px $line, backdrop-blur**; logo negro 28px a la izquierda; a la derecha CTA ámbar **"Anunciar ahora"** (icono `Plus`, padding 11px 18px, radius 4px) + el menú de usuario. NOTA: el header es chrome compartido (todo el sitio) — verificar que no rompa otras páginas.
- **D-02:** Rediseñar `MenuUser.vue` (dropdown de usuario) a `design/UserMenu.dc.html`: avatar/iniciales + nombre, grupos de links, "Cerrar sesión" (mantener `useLogout` + la confirmación existente). Reusar el componente, no recrear.

### Botones de acción de cuenta (cablear, sin no-ops)
- **D-03:** `CardProfileAd.vue`: BUG real → `@click="handleDeactivate; toggleMenu()"` referencia la función sin llamarla. Corregir a `handleDeactivate()`. Cablear el resto de acciones por estado según la maqueta (`account.dc.html` líneas 724-763): Destacar (si no featured), Ver anuncio, Estadísticas (abre `StatsAdModal`), Republicar (expirado/baja), Marcar como vendido, Dar de baja, Ver motivo. Usar los handlers/composables existentes; los que no tengan backend, dejar el flujo correcto o un Swal informativo — NUNCA un botón muerto.
- **D-04:** Panel: la acción "Ver estadísticas" de la card de atención ya abre el modal (verificar). Cualquier botón restante sin handler → cablear o quitar.

### Permisos stats (backend)
- **D-05:** Los endpoints nuevos dan **403**: el rol Authenticated no tiene permiso (`ad-view.stats`, `ad-view.panelViewsTotal`, `ad-contact.recordContact`). El proyecto NO tiene seeder de permisos. Crear un **bootstrap idempotente** en `apps/strapi/src/index.ts` (o `src/bootstrap/`) que otorgue esos permisos al rol Authenticated en cada arranque (patrón seeder, guardado contra duplicados). Esto habilita el acceso autenticado previsto (no relaja seguridad pública). Requiere restart de Strapi.

### Stats con datos reales (UI)
- **D-06:** Meta de la card de anuncio (`CardProfileAd`): mostrar **"N vistas · N contactos"** para activos (la maqueta lo muestra) usando el stats por-anuncio (`/ads/:documentId/stats`) — cargar de forma eficiente (lazy/por card o batch), no fabricar.
- **D-07:** Panel "Contactos recibidos": hoy queda en 0. Agregar endpoint `GET /ads/me/contacts-total` (agrega filas `ad-contact` de los ads activos del usuario) y cablear el KPI. Y cablear el **tracking de contacto** (`recordContact` / `POST /api/ads/:documentId/contact`) a los botones de contacto reales del detalle público para que los eventos existan.

### Claude's Discretion
- Estrategia de carga de stats por-card (lazy on-mount vs batch) — eficiente, sin N+1 abusivo.
- Estructura BEM exacta del header/menú nuevos.
</decisions>

<canonical_refs>
## Canonical References

### Maqueta
- `design/account.dc.html` líneas 28-37 (header bar), 724-763 (acciones por estado de anuncio), 171-199 (card meta "vistas · contactos").
- `design/UserMenu.dc.html` (dropdown de usuario).
- `design/index.dc.html` (header del sitio público — misma barra).

### Código a actualizar
- `apps/website/app/components/HeaderDefault.vue`, `MenuUser.vue`, `CardProfileAd.vue`, `AccountMain.vue`, `StatsAdModal.vue`.
- `apps/website/app/scss/components/_header.scss`, `_menu.scss`, `_card.scss`, `_account.scss` (tokens fase-04; NO tocar `_variables.scss`).
- `apps/website/app/stores/user.store.ts` (loadAdStats ya existe; agregar loadContactsTotal).
- `apps/strapi/src/index.ts` (bootstrap permisos), `apps/strapi/src/api/ad-view/` y `ad-contact/` (endpoint contacts-total, tracking de contacto).
- `CLAUDE.md` (BEM, sin inline styles, clases en inglés, Strapi documentId/SOLID).
</canonical_refs>

<code_context>
## Existing Code Insights
- `useLogout`, `MenuUser` ya existen (rediseñar, no recrear). `HeaderDefault` 130 líneas, `MenuUser` 181.
- `StatsAdModal.vue` ya existe (05-09) — la card y el panel lo abren; falta que tenga datos (permiso 403).
- `loadAdStats(documentId,days)` y `loadPanelViewsTotal()` ya en el store con try/catch.
- `ad-contact` content type + `recordContact` service + `POST /api/ads/:documentId/contact` ya existen (05-07).
- Tokens fase-04 en `_variables.scss`. Preview logueado: inyectar cookie `waldo_jwt` en Playwright (pedir token al usuario).
</code_context>

<deferred>
## Deferred Ideas
- Rediseño del sitio público y dashboard — fases futuras.
- Métricas avanzadas (fuentes, geo) — fuera de scope.
</deferred>

---

*Phase: 06-cierre-cuenta*
*Context gathered: 2026-06-17*
