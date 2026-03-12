# Requirements: Waldo Project — v1.29 News Manager

**Defined:** 2026-03-12
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.29 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Strapi — Content Type

- [ ] **NEWS-01**: El content type `News` existe en Strapi con los campos: `title` (texto corto), `header` (texto corto, cabecera/bajada), `body` (rich text), `cover` (media, galería de portada), `gallery` (media, galería adicional)
- [ ] **NEWS-02**: El campo `category` es una relación opcional con el content type `categorias`, permite una o más categorías
- [ ] **NEWS-03**: Las noticias usan el sistema nativo de draft/publish de Strapi — sin campo de status custom

### Dashboard — Gestión

- [x] **NEWS-04**: El administrador puede ver el listado de noticias en el dashboard (título, estado published/draft, fecha)
- [x] **NEWS-05**: El administrador puede crear una noticia con todos sus campos desde el dashboard
- [x] **NEWS-06**: El administrador puede editar una noticia existente
- [x] **NEWS-07**: El administrador puede eliminar una noticia

### SEO

- [ ] **NEWS-08**: La noticia tiene campos SEO: `seo_title` (texto corto) y `seo_description` (texto corto), ambos opcionales
- [x] **NEWS-09**: El administrador puede completar los campos SEO al crear o editar una noticia desde el dashboard

## Future Requirements

- **NEWS-F01**: Vista pública de noticias en el website (listado + detalle)
- **NEWS-F02**: Filtros y paginación en el listado del dashboard
- **NEWS-F03**: Preview de noticia antes de publicar

## Out of Scope

| Feature | Reason |
|---------|--------|
| Vista pública en el website | Solo dashboard en este milestone — website fuera de scope |
| Paginación/filtros en el listado | CRUD básico primero |
| Preview de la noticia | Sin website público aún |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NEWS-01 | Phase 063 | Pending |
| NEWS-02 | Phase 063 | Pending |
| NEWS-03 | Phase 063 | Pending |
| NEWS-04 | Phase 064 | Complete |
| NEWS-05 | Phase 064 | Complete |
| NEWS-06 | Phase 064 | Complete |
| NEWS-07 | Phase 064 | Complete |
| NEWS-08 | Phase 063 | Pending |
| NEWS-09 | Phase 064 | Complete |

**Coverage:**
- v1.29 requirements: 9 total
- Mapped to phases: 9 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 after initial definition*
