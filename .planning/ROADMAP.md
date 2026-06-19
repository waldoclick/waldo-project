- [ ] 07-06-PLAN.md — Contacto: reusa layout de ayuda + formulario a la maqueta (PUB-CONTACT)

### Phase 10: Headers + Search Lightbox + Tipografía

**Goal:** Alinear pixel-perfect todos los headers (público, cuenta, dashboard), el lightbox de búsqueda y la tipografía global del sitio con las maquetas `apps/design/index.dc.html`, `apps/design/account.dc.html` y `apps/design/dashboard.dc.html`. Incluye: (1) Header público (`HeaderDefault.vue`) — activar menú de navegación (Anuncios, Por qué Waldo, Blog) en todas las páginas interiores donde actualmente se oculta (el prop `showMenu` defaul `false` hace que solo home y por-qué-waldo tengan menú); ajustar altura 74px, backdrop-filter, tipografía de links (15px/500), CTA "Anunciar ahora", user-menu y estados logged-in/out según maqueta. (2) Header cuenta (`layout/account.vue` → `HeaderDefault` con props) — altura 70px, sticky, backdrop-filter 14px, sin nav-links, con CTA "Anunciar ahora" y UserMenu; ajustar BEM/SCSS del layout account. (3) Header dashboard (topbar en `HeaderDashboard.vue` y `HeroHeaderDashboard.vue`) — topbar con breadcrumb + título Poppins 700 20px + botones Servicios/Órdenes/Notificaciones/Fullscreen + avatar pill; sidebar de navegación existente según `dashboard.dc.html`. (4) Lightbox de búsqueda (`LightboxSearch.vue`) — modal fullscreen según maqueta: overlay rgba(38,37,43,.46) + backdrop-filter:blur(4px), card max-width:620px border-radius:10px, input 18px, sección "Últimas búsquedas", sección "Explora por categoría", botón Esc; debe integrarse correctamente con el composable `useSearchSuggestions`. (5) Tipografía global — auditar y corregir font-size, font-weight, line-height, letter-spacing en todos los componentes públicos contra los valores de la maqueta; las correcciones van en los SCSS de cada componente sin modificar variables existentes.
**Requirements:** HDR-PUBLIC, HDR-ACCOUNT, HDR-DASHBOARD, SEARCH-LIGHTBOX, TYPOGRAPHY
**Depends on:** Phase 07 (public pages), Phase 04 (tokens)
**Ejecución:** GSD; 3 planes en 2 olas. Ola 1: 10-01 (HeaderDefault público — nav menu en todas las páginas + ajuste visual completo). Ola 2 paralela: 10-02 (LightboxSearch — verificación visual + correcciones menores) y 10-03 (Header cuenta + topbar dashboard + tipografía hero dashboard). File ownership disjunto entre olas.
**Success criteria:**
1. El menú de navegación (Anuncios, Por qué Waldo, Blog) aparece en TODAS las páginas que usan `HeaderDefault` sin `showMenu` explícito — `showMenu` cambia su default a `true`; las páginas de flujo (pagar, anunciar) pueden mantener menú o no según maqueta
2. El header público coincide con `index.dc.html` líneas 109-135: height 74px, backdrop-filter blur(16px) saturate(1.08), nav-links 15px/500/color var(--ink2), CTA amber, user-menu según estado auth
3. El header cuenta coincide con `account.dc.html` líneas 58-67: height 70px, sticky, backdrop-filter blur(14px) saturate(1.06), solo CTA + UserMenu sin nav-links
4. El topbar dashboard coincide con `dashboard.dc.html` líneas 69-134: breadcrumb Waldo › [página], título Poppins 700 20px, botones 38x38 con border:1px solid var(--line) + border-radius:8px, avatar pill
5. El lightbox de búsqueda coincide con `index.dc.html` líneas 192-252: overlay rgba(38,37,43,.46) blur(4px), card 620px/border-radius:10px, input 18px, secciones "Últimas búsquedas" y "Explora por categoría", botón Esc
6. Tipografía auditada: cero regresiones de tamaño/peso detectadas en screenshot 1440px de home, /anuncios, /anuncios/[slug], /cuenta en comparación directa con las maquetas
7. `pnpm --filter website typecheck` sin errores nuevos; BEM estricto en todas las clases nuevas; sin modificar variables SCSS existentes

**Plans:** 1/3 plans executed

Plans:
- [x] 10-01-PLAN.md — Header público: showMenu default flip + :show-menu=false en 19 páginas de flujo + position:fixed + z-index:50 + transition cubic-bezier (HDR-PUBLIC)
- [ ] 10-02-PLAN.md — LightboxSearch: verificación visual + reemplazo de colores hardcodeados por tokens SCSS (SEARCH-LIGHTBOX)
- [ ] 10-03-PLAN.md — Header cuenta: override sticky+70px+blur14px en _layout.scss; Dashboard tipografía: Poppins 700 20px $ink en _hero.scss; toolbar 38×38 verificado (HDR-ACCOUNT, HDR-DASHBOARD, TYPOGRAPHY)

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
