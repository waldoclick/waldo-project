# Requirements: Waldo Project — v1.16 Website Meta Copy Audit

**Defined:** 2026-03-07
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1 Requirements

### Bugs

- [ ] **BUG-01**: `anuncios/[slug].vue` — el título no incluye `| Venta de Equipo en Waldo.click` (double-suffix eliminado); la descripción usa `Waldo.click®` (con ®); no hay doble-espacio cuando la descripción del aviso es null
- [ ] **BUG-02**: `[slug].vue` (perfil público) — el título no incluye `| Waldo.click®` manualmente (double-suffix eliminado); la descripción no contiene `${totalAds}` ni ningún contador dinámico
- [ ] **BUG-03**: `anuncios/index.vue` — `$setSEO` se ejecuta en contexto SSR (no solo en `watch(route.query)`); la descripción generada usa `Waldo.click®` (con ®)
- [ ] **BUG-04**: `packs/index.vue` — la página declara `useSeoMeta({ robots: "noindex, nofollow" })`

### Copy

- [ ] **COPY-01**: `index.vue` (home) — título y descripción usan vocabulario canónico (`anuncios`, `activos industriales`, `Waldo.click®`); descripción entre 120–155 chars; título ≤ 45 chars
- [ ] **COPY-02**: `anuncios/index.vue` — copy base (estado sin filtros) reescrito con vocabulario canónico; ramas dinámicas (por categoría, por comuna) ajustadas para mantener consistencia; título ≤ 45 chars; descripción entre 120–155 chars
- [ ] **COPY-03**: `anuncios/[slug].vue` — plantilla de título y descripción reescrita con vocabulario canónico (después de BUG-01); título ≤ 45 chars; descripción entre 120–155 chars
- [ ] **COPY-04**: `[slug].vue` (perfil público) — título y descripción reescritos con vocabulario canónico (después de BUG-02); título ≤ 45 chars; descripción entre 120–155 chars
- [ ] **COPY-05**: `preguntas-frecuentes.vue` — vocabulario revisado y ajustado a términos canónicos; título ≤ 45 chars; descripción entre 120–155 chars
- [ ] **COPY-06**: `contacto/index.vue` — título expandido (actualmente una sola palabra genérica); descripción revisada; título ≤ 45 chars; descripción entre 120–155 chars
- [ ] **COPY-07**: `sitemap.vue` — `Waldo.click` reemplazado por `Waldo.click®`; descripción revisada; título ≤ 45 chars; descripción entre 120–155 chars
- [ ] **COPY-08**: `politicas-de-privacidad.vue` — vocabulario revisado para consistencia con el resto del sitio; título ≤ 45 chars; descripción entre 120–155 chars

## Out of Scope

| Feature | Reason |
|---------|--------|
| `<meta keywords>` | Ignorado por Google desde 2009; no aporta valor SEO |
| Páginas privadas / noindex (excepto BUG-04) | Ya tienen noindex; el copy no aparece en SERPs |
| apps/dashboard | Fuera del scope del milestone; no es sitio público |
| apps/strapi | No tiene páginas web con meta tags |
| Open Graph images | Milestone separado; no es copy de texto |
| Structured data / JSON-LD | Cubierto en v1.15; fuera del scope de este milestone |
| Nuevas páginas o rutas | Solo auditoría de páginas existentes |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 36 | Pending |
| BUG-02 | Phase 36 | Pending |
| BUG-03 | Phase 36 | Pending |
| BUG-04 | Phase 36 | Pending |
| COPY-01 | Phase 37 | Pending |
| COPY-02 | Phase 37 | Pending |
| COPY-03 | Phase 37 | Pending |
| COPY-04 | Phase 37 | Pending |
| COPY-05 | Phase 38 | Pending |
| COPY-06 | Phase 38 | Pending |
| COPY-07 | Phase 38 | Pending |
| COPY-08 | Phase 38 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after initial definition*
