- [ ] 07-06-PLAN.md — Contacto: reusa layout de ayuda + formulario a la maqueta (PUB-CONTACT)

### Phase 09: Público — Blog (Fase 3 rediseño público)

**Goal:** Restilizar las 2 vistas públicas del blog a la maqueta `design/index.dc.html` (rebrand v1.47): el listado (`/blog`, pantalla "Blog" líneas ~1239) y el interior de artículo (`/blog/:slug`, pantalla "Artículo" líneas ~1317), más la card `BlogCard.dc.html`. UPDATE de páginas/componentes/SCSS existentes (no crear salvo que no exista equivalente — `CardArticle.vue` ES el equivalente de `BlogCard`, se restiliza, no se crea uno nuevo). Es restyle VISUAL de la funcionalidad existente: se difieren para aprobación los comportamientos nuevos que la maqueta insinúa (buscador de texto libre, dropdown multi-select de categorías con checkboxes, "Limpiar filtros"; gate de "Leer más" del cuerpo; sidebar "Destacados" con avisos+precios; copy-link de compartir). Cada vista se cierra con loop visual (screenshot → Read PNG → comparar vs maqueta + screenshots de referencia → arreglar → repetir) en desktop 1440 y mobile 390, logged-OUT. Cada vista mantiene un solo useAsyncData (ya cumplido: 1 ola, key único, default, sin N+1 — la card no llama endpoint).
**Requirements:** PUB-BLOG, PUB-ARTICLE
**Depends on:** Phase 04 (tokens), Phase 06 (header fixed/overlay + headroom)
**Ejecución:** GSD; 2 olas. Ola 1: 09-01 (listado — owner de la card `CardArticle` + bloque `.card--article` en `_card.scss`). Ola 2: 09-02 (interior — reusa la card restilizada en "Sigue leyendo"; NO toca `CardArticle`/`_card.scss`). File ownership disjunto por ola.
**Success criteria:**
1. `/blog` (listado) y `/blog/:slug` (interior) se ven según la maqueta (color, tipografía, espaciado, iconos Lucide, tokens phase-04), en desktop 1440 y mobile 390, logged-OUT
2. La card de blog (`CardArticle`) coincide con `BlogCard.dc.html` (media 16/9, pill de categoría con punto, título Poppins, excerpt a 2 líneas, fecha + tiempo de lectura) y no dispara endpoint por card (sin N+1); se restiliza una sola vez en 09-01 y 09-02 la reutiliza
3. El interior usa el grid 2-columnas de la maqueta (artículo 720px + sidebar sticky 308px) colapsando a 1 columna en mobile; cuerpo completo renderizado (gate diferido); sidebar con card de contenido restilizada + promo oscuro estático "¿Vendes equipos?"
4. Ambos heroes/breadcrumbs respetan el header fixed/overlay + headroom (06-02) con ~130px de padding superior; nada queda oculto tras la barra
5. Cada vista hace una sola carga de datos (useAsyncData con key único + default), sin doble-fetch; comportamiento (filtros, paginación, 404, SEO, analytics) sin regresión
6. Sin tocar variables SCSS existentes (solo crear nuevas si la maqueta necesita un color ausente); los comportamientos nuevos diferidos se reportan en el SUMMARY para aprobación del usuario

**Plans:** 2 plans (2 waves)

Plans:
- [ ] 09-01-PLAN.md — Blog listado: hero breadcrumb + toolbar + card `BlogCard` (owner) + grid 3-col + pager (PUB-BLOG)
- [ ] 09-02-PLAN.md — Interior de artículo: header + cuerpo + layout 2-col + sidebar + "Sigue leyendo" reusa card (PUB-ARTICLE)


### Phase 08: Público — anuncios + perfil (Fase 2 rediseño público)

**Goal:** Restilizar las 3 vistas públicas de anuncios/vendedor a la maqueta `design/index.dc.html` (rebrand v1.47): el listado `/anuncios`, el interior de anuncio `/anuncios/[slug]` y la vista pública del vendedor `/{username}` (Básica y Pro en una sola página, según `pro_status`). UPDATE de páginas/componentes/SCSS existentes (no crear salvo que no exista equivalente — leer el sibling más cercano antes). La `CardAnnouncement` compartida (listado + relacionados + grid de perfil) se restiliza UNA vez en 08-01 (owner del card y de `_card.scss .card--announcement`); 08-02/08-03 la reusan sin re-tocarla. Cada vista se cierra con loop visual (screenshot → Read PNG → comparar vs maqueta + screenshots de referencia → arreglar → repetir) en desktop 1440 y mobile 390; el interior y el perfil verifican logged-OUT y logged-IN (gate de contacto). Cada vista conserva su carga única de datos sin N+1 (ya está optimizada: el listado y el perfil cargan una página paginada vía `ads/catalog`/`loadAds` y las cards renderizan del array; el interior usa `ads/slug/:slug` que embebe galería/vendedor/categoría).
**Requirements:** PUB-ADS, PUB-AD-DETAIL, PUB-PROFILE
**Depends on:** Phase 04 (tokens), Phase 07 (Fase 1 público) — Phase 06 ya restiló header/menú
**Ejecución:** GSD; 2 olas. Ola 1: 08-01 (listado — owner de CardAnnouncement + `.card--announcement` + `.announcement--archive`). Ola 2 (paralelo): 08-02 (interior — owner de `.announcement--single`) + 08-03 (perfil vendedor — `hero--profile`/`profile`/`sidebar`). File ownership disjunto: `_announcement.scss` se reparte (08-01 = sección `--archive`, 08-02 = sección `--single`); 08-02/08-03 dependen de 08-01 por el card compartido.
**Success criteria:**
1. `/anuncios` (hero de resultados + toolbar count/orden + grid de cards + empty state) se ve según la maqueta en desktop y mobile, logged-OUT, usando los tokens phase-04
2. La `CardAnnouncement` compartida coincide con `AdCard.dc.html` (pill de categoría con punto de color, badge de cantidad de fotos, Destacado, título Poppins, precio + IVA, footer "Inicia sesión para ver al anunciante" logged-OUT) y es final para la fase (reusada por relacionados y grid de perfil)
3. El interior de anuncio se ve según la maqueta "Detalle de producto" (hero breadcrumb + galería + Acerca/Ubicación/Especificación + sidebar sticky precio/vendedor-contacto/compartir) en desktop y mobile, en ambos estados de sesión; el gate de contacto (logged-OUT "Datos protegidos" vs logged-IN email/teléfono con copiar) conserva su comportamiento, solo restilizado
4. La vista pública del vendedor renderiza Básica y Pro desde una sola página según `pro_status` (Pro: cover + avatar + bio; Básica: header contenido + nota "Perfil estándar"), con identidad (nombre + badge PRO + verificado), métricas, chips de categoría y grid de avisos activos, en desktop y mobile, ambos estados de sesión
5. Cada vista conserva su carga única de datos (sin N+1, sin doble-fetch, sin estrechar `populate`); el split intencional del listado (categoría con key estable separada de los anuncios) se mantiene para no regresar a un refetch de categoría por filtro
6. Cero regresión de comportamiento; el header fixed/overlay + headroom (06-02) se respeta (heroes/portadas con padding superior); sin tocar variables SCSS existentes (solo crear nuevas si la maqueta necesita un color ausente). Las features net-new de la maqueta (tab Vendidos + buscador por perfil, máscara de email/teléfono y botones WhatsApp/Llamar) quedan diferidas como preguntas abiertas, no se implementan en esta fase

**Plans:** 3 plans (2 waves)

Plans:
- [ ] 08-01-PLAN.md — Listado /anuncios: card compartido (owner) + toolbar/grid + hero de resultados (PUB-ADS)
- [ ] 08-02-PLAN.md — Interior de anuncio: hero breadcrumb + galería/specs + sidebar sticky con gate de contacto (PUB-AD-DETAIL)
- [ ] 08-03-PLAN.md — Perfil vendedor (Básica + Pro): cover/identidad + métricas/chips + grid de avisos (PUB-PROFILE)


## Progress
