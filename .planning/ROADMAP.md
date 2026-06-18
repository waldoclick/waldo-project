- [ ] 07-06-PLAN.md — Contacto: reusa layout de ayuda + formulario a la maqueta (PUB-CONTACT)

### Phase 09: Público — Blog (Fase 3 rediseño público)

**Goal:** Migrar las 2 vistas públicas del blog a la maqueta `design/index.dc.html` (rebrand v1.47) con FIDELIDAD COMPLETA: el listado (`/blog`, pantalla "Blog" líneas ~1239) y el interior de artículo (`/blog/:slug`, pantalla "Artículo" líneas ~1317), más la card `BlogCard.dc.html`. UPDATE de páginas/componentes/SCSS existentes (no crear salvo que no exista equivalente — `CardArticle.vue` ES el equivalente de `BlogCard`, se restiliza, no se crea uno nuevo). Además del restyle visual, se IMPLEMENTAN los comportamientos nuevos de la maqueta: en el listado, buscador de texto libre + dropdown multi-select de categorías con checkboxes + "Limpiar filtros" (filtrado/paginación client-side sobre un único set cargado, sin N+1); en el interior, gate de "Leer más" (clamp + fade + toggle sobre el cuerpo) y sidebar "Destacados en Waldo" con avisos reales + precios (nuevo endpoint backend `GET /ads/featured`, carga única pequeña, sin N+1). Cada vista se cierra con loop visual (screenshot → Read PNG → comparar vs maqueta + screenshots de referencia → arreglar → repetir) en desktop 1440 y mobile 390, logged-OUT. Cada vista mantiene una sola ola de datos (useAsyncData con key único + default; el interior hace Promise.all artículo + relacionados + destacados — sin N+1).
**Requirements:** PUB-BLOG, PUB-BLOG-FILTERS, PUB-ARTICLE, PUB-ARTICLE-GATE, PUB-ARTICLE-FEATURED
**Depends on:** Phase 04 (tokens), Phase 06 (header fixed/overlay + headroom)
**Ejecución:** GSD; 2 olas. Ola 1: 09-01 (listado — owner de la card `CardArticle` + bloque `.card--article` en `_card.scss`; añade buscador/multiselect/limpiar client-side). Ola 2: 09-02 (interior — nuevo endpoint `/ads/featured` + sidebar destacados + gate "Leer más"; reusa la card restilizada en "Sigue leyendo"; NO toca `CardArticle`/`_card.scss`). File ownership disjunto por ola (los archivos `apps/strapi/*` viven solo en 09-02).
**Success criteria:**
1. `/blog` (listado) y `/blog/:slug` (interior) se ven según la maqueta (color, tipografía, espaciado, iconos Lucide, tokens phase-04), en desktop 1440 y mobile 390, logged-OUT
2. La card de blog (`CardArticle`) coincide con `BlogCard.dc.html` (media 16/9, pill de categoría con punto, título Poppins, excerpt a 2 líneas, fecha + tiempo de lectura) y no dispara endpoint por card (sin N+1); se restiliza una sola vez en 09-01 y 09-02 la reutiliza
3. El listado implementa el toolbar de la maqueta: buscador de texto libre + dropdown multi-select de categorías (checkboxes) + "Limpiar filtros", filtrando/paginando client-side sobre un único set cargado (sin N+1; el buscador cubre TODOS los artículos, no solo la página visible)
4. El interior usa el grid 2-columnas de la maqueta (artículo 720px + sidebar sticky 308px) colapsando a 1 columna en mobile; gate "Leer más" funcional (clamp + fade + toggle) sobre el cuerpo; sidebar con "Destacados en Waldo" (avisos reales + precios desde `/ads/featured`) + promo oscuro estático "¿Vendes equipos?"
5. Ambos heroes/breadcrumbs respetan el header fixed/overlay + headroom (06-02) con ~130px de padding superior; nada queda oculto tras la barra
6. Cada vista hace una sola ola de datos (useAsyncData con key único + default), sin doble-fetch; el interior carga artículo + relacionados + destacados en Promise.all (sin N+1); comportamiento (404, SEO, analytics) sin regresión
7. Sin tocar variables SCSS existentes (solo crear nuevas si la maqueta necesita un color ausente); el nuevo endpoint `/ads/featured` reutiliza el servicio `activeAds` existente (no duplica lógica de query)

**Plans:** 2 plans (2 waves)

Plans:
- [ ] 09-01-PLAN.md — Blog listado: hero breadcrumb + toolbar (buscador + multiselect + limpiar) + card `BlogCard` (owner) + grid 3-col + pager client-side (PUB-BLOG, PUB-BLOG-FILTERS)
- [ ] 09-02-PLAN.md — Interior de artículo: header + cuerpo + gate "Leer más" + layout 2-col + sidebar destacados (`/ads/featured`) + "Sigue leyendo" reusa card (PUB-ARTICLE, PUB-ARTICLE-GATE, PUB-ARTICLE-FEATURED)
