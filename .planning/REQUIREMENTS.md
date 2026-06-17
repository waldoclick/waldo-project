# Requirements: Waldo Project — v1.47 Rediseño visual

**Defined:** 2026-06-16
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

Milestone scope: migrar la maqueta nueva (en `/design`) a los componentes reales, área por área, sin cambiar comportamiento — solo el look. Trabajo de actualización, no de creación: los componentes y su SCSS ya existen.

## v1 Requirements

### Tokens compartidos (se establecen en la fase auth)

- [x] **TOK-01**: Se crean variables SCSS NUEVAS con los valores de la maqueta (ink, amber/amberH, ink2, muted, cream, line, error, éxito) y los componentes apuntan a ellas; las variables existentes NO se modifican
- [x] **TOK-02**: Poppins es la fuente global de la(s) app(s)
- [x] **TOK-03**: La iconografía Lucide se aplica según la maqueta

### Auth

- [x] **AUTH-01**: El login se ve según la maqueta nueva
- [x] **AUTH-02**: El registro se ve según la maqueta nueva
- [x] **AUTH-03**: La verificación de código se ve según la maqueta nueva
- [x] **AUTH-04**: El reset / forgot password se ve según la maqueta nueva

### Cuenta (Phase 05)

- [ ] **ACC-LAYOUT**: El área de cuenta tiene el layout sidebar nuevo según la maqueta, reusando componentes existentes
- [ ] **ACC-PANEL**: El Panel (overview) se ve idéntico a la maqueta — KPIs, "Necesita tu atención", upsell
- [ ] **ACC-ADS**: Mis anuncios se ve idéntico a la maqueta
- [ ] **ACC-ORDERS**: Mis órdenes se ve idéntico a la maqueta
- [ ] **ACC-PROFILE**: Mi perfil (ver / editar) se ve idéntico a la maqueta
- [ ] **ACC-PASSWORD**: Cambiar contraseña se ve idéntico a la maqueta

### Estadísticas (Phase 05 — backend nuevo)

- [ ] **STAT-MODEL**: `ad-view` guarda 1 fila por vista (ad, viewed_at, visitor_hash, source, viewer); tracking server-side en el detalle público, excluye al dueño, único por visitante/día; `ad-contact` guarda contactos como eventos
- [ ] **STAT-VIEW**: Detalle de estadísticas por anuncio (vistas, contactos, conversión, promedio/día, gráfico 14 días con chart.js) + KPI "Vistas totales" en Panel, con datos reales agregados (no contador)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cambios de comportamiento en vistas ya existentes | El rediseño no cambia la lógica/validaciones existentes; solo el look. EXCEPCIÓN: estadísticas es funcionalidad nueva (tablas de eventos + endpoints) |
| Componentes nuevos sin necesidad | Reusar los existentes todo lo posible; solo se crea lo que no tiene equivalente (ej. layout cuenta, content types de eventos) |
| Copiar el `.dc.html` literal (estilos inline) | El proyecto es Vue + BEM + SCSS; la maqueta se traduce, no se trasplanta |
| Contador agregado de vistas | Se guarda cada vista como evento (fila) para poder cortar por día; nunca un contador |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOK-01 | Phase 04 | Complete |
| TOK-02 | Phase 04 | Complete |
| TOK-03 | Phase 04 | Complete |
| AUTH-01 | Phase 04 | Complete |
| AUTH-02 | Phase 04 | Complete |
| AUTH-03 | Phase 04 | Complete |
| AUTH-04 | Phase 04 | Complete |
| ACC-LAYOUT | Phase 05 | Pending |
| ACC-PANEL | Phase 05 | Pending |
| ACC-ADS | Phase 05 | Pending |
| ACC-ORDERS | Phase 05 | Pending |
| ACC-PROFILE | Phase 05 | Pending |
| ACC-PASSWORD | Phase 05 | Pending |
| STAT-MODEL | Phase 05 | Pending |
| STAT-VIEW | Phase 05 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-16*
*Last updated: 2026-06-16 after milestone v1.47 definition*
