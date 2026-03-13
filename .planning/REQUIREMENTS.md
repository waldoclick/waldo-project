# Requirements: Waldo Project — v1.34 LightBoxArticles

**Defined:** 2026-03-13
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.34 Requirements

### Backend

- [x] **BACK-01**: El administrador puede buscar noticias vía `POST /api/search/tavily` enviando `{ query, num? }` y recibir `{ news: [{ title, link, snippet, date, source }] }`

### Dashboard — Lightbox Component

- [x] **LB-01**: `LightBoxArticles.vue` existe con estructura BEM `lightbox lightbox--articles`, siguiendo el mismo patrón HTML que `LightboxRazon.vue`
- [x] **LB-02**: El lightbox tiene 3 pasos con navegación adelante/atrás; el estado persiste mientras el lightbox está abierto
- [x] **LB-03**: Step 1 muestra un textarea con query predefinida y un botón "Buscar"; al presionar llama a `POST /api/search/tavily` y muestra los resultados (title, url, date)
- [x] **LB-04**: El usuario puede seleccionar una noticia del Step 1; al seleccionar se captura el título, URL y fecha de la noticia y avanza al Step 2 (el fetch del HTML completo queda diferido a una fase futura cuando exista el endpoint proxy)
- [x] **LB-05**: Step 2 muestra la info de la noticia seleccionada (title, url, date) y un textarea con el prompt predefinido de generación de artículo
- [x] **LB-06**: Step 2 tiene un botón "Generar artículo"; al presionar llama a `POST /api/ia/gemini` con prompt + HTML + url + date y avanza al Step 3
- [x] **LB-07**: Step 3 muestra el resultado JSON retornado por Gemini: title, header, body (Markdown renderizado), keywords, source_url, source_date
- [x] **LB-08**: El usuario puede volver del Step 3 al Step 2, y del Step 2 al Step 1

### Dashboard — SCSS

- [x] **SCSS-01**: `_lightbox.scss` tiene el modifier `&--articles` con todos sus elementos BEM, siguiendo la estructura de `&--razon`

### Dashboard — Integración

- [x] **INT-01**: `pages/articles/index.vue` tiene un botón "Generar artículo" con clase `btn--announcement` e icono `Wand2` (lucide) junto al botón "Agregar artículo"; al presionar abre `LightBoxArticles`

## Future Requirements

### Mejoras al generador de artículos

- **GEN-01**: El usuario puede editar el artículo generado antes de guardarlo
- **GEN-02**: El artículo generado se puede guardar directamente como borrador en Strapi desde el Step 3
- **GEN-03**: El sistema recuerda las últimas queries de búsqueda usadas

## Out of Scope

| Feature | Reason |
|---------|--------|
| Guardar artículo directamente desde el lightbox | Complejidad de integración con FormArticle; se hace en milestone posterior |
| Múltiples selecciones de noticias | Un artículo = una fuente; simplifica el prompt y el flujo |
| Soporte para otros modelos de IA (Claude, etc.) | Gemini es suficiente para este caso; generalización en milestone posterior |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BACK-01 | Phase 073 | Complete |
| LB-01 | Phase 074 | Complete |
| LB-02 | Phase 074 | Complete |
| LB-03 | Phase 074 | Complete |
| LB-04 | Phase 074 | Complete |
| LB-05 | Phase 074 | Complete |
| LB-06 | Phase 074 | Complete |
| LB-07 | Phase 074 | Complete |
| LB-08 | Phase 074 | Complete |
| SCSS-01 | Phase 074 | Complete |
| INT-01 | Phase 074 | Complete |

**Coverage:**
- v1.34 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after initial definition*
