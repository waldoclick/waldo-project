# Phase 05: Rediseño cuenta - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Restilizar el área de cuenta (`apps/website`, rutas `/cuenta/*`) para que se vea **idéntica** a `design/account.dc.html`, con un **layout sidebar nuevo**, reusando los componentes/páginas existentes todo lo posible. Vistas: Panel (overview), Mis anuncios, Mis órdenes, Mi perfil (ver/editar), Cambiar contraseña, + **detalle de Estadísticas por anuncio**.

Incluye **backend nuevo** (funcionalidad, no solo visual): estadísticas reales guardando **cada vista como evento** (no contador) y contactos como eventos.

Ejecución: cada vista = 1 plan; cada plan se cierra con el **loop visual** (screenshot del server real → medir valores computados → arreglar → verificar mirando) hasta quedar idéntico. Ver [[feedback_visual_work_screenshot_loop]].
</domain>

<decisions>
## Implementation Decisions

### Layout y reuso
- **D-01:** Layout sidebar de cuenta NUEVO según la maqueta. Rediseñar `layouts/account.vue` + `SidebarAccount.vue` (existentes), no crear de cero si hay equivalente.
- **D-02:** Reusar componentes existentes todo lo posible: `AccountMain`, `AccountProfile`, `AccountEdit`, `AccountPassword`, `AccountOrders`, `AccountUsername`, `AccountAvatar`, `AccountCover`, `SidebarAccount`, `SidebarProfile`. Restilizarlos, no reemplazarlos.
- **D-03:** Usar las variables SCSS nuevas de la fase 04 (`$ink`, `$amber`, etc.). Lucide para iconos. BEM, un SCSS por componente, sin estilos inline.

### Estadísticas — modelo de datos (backend nuevo)
- **D-04:** Content type `ad-view` — 1 fila por vista: `ad` (relación), `viewed_at` (datetime), `visitor_hash` (string, para dedupe), `source` (string), `viewer` (relación user, nullable). **NUNCA un contador agregado.**
- **D-05:** Tracking **server-side** (Nitro proxy / Strapi) disparado al abrir el detalle público `/anuncios/[slug]`. **Excluye al dueño** del aviso. **Único por visitante/día** (visitor_hash + día) — número honesto.
- **D-06:** Content type `ad-contact` — contactos como eventos (para "Contactos recibidos"): `ad`, `created_at`, `type` (call/message), `visitor_hash`. Reemplaza/complementa el evento GA4 `contactSeller` (externo) para el número en cuenta.
- **D-07:** Endpoints: `POST /api/ads/:documentId/view` (registrar vista), `GET /api/ads/:documentId/stats?days=14` (agrega: total, serie diaria group-by-día, contactos, conversión), y agregación para el KPI "Vistas totales" del Panel (suma sobre anuncios activos del usuario).
- **D-08:** Gráfico de 14 días con **chart.js + vue-chartjs** (ya instalados). Sin dependencias nuevas.

### Vistas (maqueta)
- **D-09:** Panel: 3 KPIs (Vistas totales, Contactos recibidos, Anuncios activos), bloque "Necesita tu atención" (anuncios por vencer / rechazados con acción), upsell de packs. Idéntico a la maqueta.
- **D-10:** Cero regresión de comportamiento en las vistas/flujos existentes (perfil, órdenes, cambiar contraseña, mis anuncios). Solo cambia el look + se agrega la capa de estadísticas.

### Claude's Discretion
- Nombres exactos de clases BEM nuevas del layout/sidebar.
- Estrategia de dedupe del visitor_hash (ip+ua hash, cookie, etc.) — server-side, único/día.
- Si `ad-contact` se llena desde los botones de contacto existentes o un endpoint dedicado.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Maqueta (target visual — idéntico)
- `design/account.dc.html` — 5 vistas (Panel línea ~80, Mis anuncios ~144, Mis órdenes ~218, Mi perfil ~262, Cambiar contraseña ~423) + detalle Estadísticas por anuncio (script ~864-886: vistas/contactos/conversión/promedio + gráfico 14 días).
- `design/Design System.dc.html` — tokens, tipografía, iconos, componentes.

### Código actual a restilizar / reusar
- `apps/website/app/layouts/account.vue` — layout de cuenta (rediseñar a sidebar de la maqueta).
- `apps/website/app/components/SidebarAccount.vue`, `SidebarProfile.vue` — sidebar (rediseñar).
- `apps/website/app/components/AccountMain.vue`, `AccountProfile.vue`, `AccountEdit.vue`, `AccountPassword.vue`, `AccountOrders.vue`, `AccountUsername.vue`, `AccountAvatar.vue`, `AccountCover.vue` — restilizar.
- Páginas: `apps/website/app/pages/cuenta/index.vue`, `cuenta/mis-anuncios.vue`, `cuenta/mis-ordenes.vue`, `cuenta/cambiar-contrasena.vue`, `cuenta/perfil/index.vue`, `cuenta/perfil/editar.vue`.
- `apps/website/app/scss/abstracts/_variables.scss` — tokens nuevos de la fase 04 (no modificar existentes).

### Backend (estadísticas — crear)
- `apps/strapi/src/api/ad/` — referencia de estructura de content type/controller/routes/service para crear `ad-view` y `ad-contact` siguiendo el patrón.
- `CLAUDE.md` — reglas Strapi (documentId, services SOLID, naming, cron si aplica), BEM, no inline styles, refactors subtractivos.

### Charts
- `chart.js` + `vue-chartjs` ya en `apps/website/package.json` (ej. patrón `ChartSales`).
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Layout `account.vue` + `SidebarAccount.vue` ya existen → rediseñar, no crear.
- Todos los `Account*.vue` ya implementan la lógica de cada vista → solo restilizar markup/SCSS.
- chart.js + vue-chartjs instalados → gráfico de estadísticas sin deps nuevas.
- NO existe contador de vistas en Ad (clean slate) — bien, se hace event-sourced.
- Único content type de analytics hoy: `google-analytics` (integración GA4 externa, no sirve para el número in-app).

### Established Patterns
- Content types Strapi: ver `apps/strapi/src/api/ad/` (schema.json, controllers, routes, services).
- Frontend: páginas = composición; componentes auto-importados; BEM + SCSS por componente.
- Tracking server-side vía proxy Nitro (patrón ya usado para auth/uploads).

### Integration Points
- Tracking de vistas se dispara en el detalle público `/anuncios/[slug]` (no en cuenta).
- Stats endpoints consumidos por el Panel (KPIs) y el detalle de Mis anuncios (modal estadísticas).
</code_context>

<deferred>
## Deferred Ideas

- Áreas público y dashboard del rediseño — fases futuras, no aprobadas aún.
- Métricas avanzadas (fuentes de tráfico, geo) — fuera de scope; el modelo `ad-view` deja `source`/`visitor_hash` para habilitarlas después.
</deferred>

---

*Phase: 05-rediseno-cuenta*
*Context gathered: 2026-06-16*
