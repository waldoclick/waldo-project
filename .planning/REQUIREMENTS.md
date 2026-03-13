# Requirements: Waldo Project — v1.31 Article Manager Improvements

**Defined:** 2026-03-13
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1 Requirements

### Article Schema

- [ ] **ARTC-01**: El schema de Article en Strapi tiene el campo `source_url` (string, optional)

### Article Form (Dashboard)

- [ ] **ARTF-01**: El formulario de crear artículo tiene un toggle/checkbox para elegir entre Borrador y Publicado
- [ ] **ARTF-02**: El formulario de editar artículo muestra el estado actual (borrador/publicado) y permite cambiarlo
- [ ] **ARTF-03**: El formulario tiene un campo de URL para la fuente de la noticia (`source_url`)
- [ ] **ARTF-04**: Al guardar, el estado draft/publish se envía correctamente a Strapi (`publishedAt: null` para borrador, fecha actual para publicado)
- [ ] **ARTF-05**: La vista de detalle del artículo (`/articles/:id`) muestra el `source_url` si está presente

## v2 Requirements

(None identified)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Publicar/despublicar desde vista de detalle | El usuario decidió controlarlo solo desde el formulario |
| Campo `source_name` (nombre de la fuente) | El usuario eligió solo URL, sin texto adicional |
| Control de publicación en website público | Solo aplica al dashboard |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARTC-01 | Phase 069 | Pending |
| ARTF-01 | Phase 070 | Pending |
| ARTF-02 | Phase 070 | Pending |
| ARTF-03 | Phase 070 | Pending |
| ARTF-04 | Phase 070 | Pending |
| ARTF-05 | Phase 070 | Pending |

**Coverage:**
- v1 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after initial definition*
