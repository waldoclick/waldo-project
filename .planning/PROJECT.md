# Waldo Project

## What This Is

Plataforma de clasificados (avisos) compuesta por tres aplicaciones en un monorepo: un sitio web público (Nuxt.js 4), un dashboard de administración (Nuxt.js 4) y una API/CMS (Strapi v5). Toda la lógica de negocio vive en Strapi; el frontend y el dashboard consumen sus APIs vía proxy Nitro.

## Core Value

Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## Requirements

### Validated

- ✓ Usuario puede crear y publicar avisos desde el sitio web — existente
- ✓ Sistema de packs de avisos (PackType: free / paid / pack específico) — existente
- ✓ Sistema de avisos destacados (FeaturedType: free / true / false) — existente
- ✓ Pagos procesados a través de Transbank — existente
- ✓ Autenticación completa en Dashboard (login, forgot password, reset password) — existente
- ✓ Dashboard para gestión de avisos, categorías, usuarios, reservas, ventas — existente
- ✓ API REST y GraphQL vía Strapi v5 — existente
- ✓ Los componentes de lista del dashboard no duplican fetch al renderizar — v1.1
- ✓ La paginación y filtros de cada sección de avisos son independientes entre sí — v1.1
- ✓ Los errores en producción del dashboard son visibles (no suprimidos silenciosamente) — v1.1
- ✓ Los componentes de lista de avisos están consolidados en un componente genérico reutilizable — v1.1
- ✓ Las entidades del dominio (Ad, User, Order, Category) tienen tipos TypeScript compartidos — v1.1
- ✓ Las llamadas N+1 en CategoriesDefault están eliminadas — v1.1
- ✓ ChartSales obtiene datos agregados del servidor, no pagina todos los órdenes en cliente — v1.1
- ✓ Eliminar double-fetch en todos los componentes non-ads del dashboard que tienen `onMounted` + `watch({ immediate: true })` coexistiendo — v1.2
- ✓ Utilidades de fecha, precio y string centralizadas y estrictamente tipadas — v1.3
- ✓ Al rechazar un aviso, el AdReservation y FeaturedReservation asociados quedan disponibles para reuso — v1.5
- ✓ Al banear un aviso, el AdReservation y FeaturedReservation asociados quedan disponibles para reuso — v1.5
- ✓ El email de rechazo notifica al usuario que sus créditos fueron devueltos (condicional) — v1.5
- ✓ El email de baneo notifica al usuario que sus créditos fueron devueltos (condicional) — v1.5
- ✓ Todos los segmentos de URL del dashboard están en inglés — v1.4
- ✓ Las URLs españolas antiguas redirigen a sus equivalentes en inglés (301) — v1.4
- ✓ Todos los links de navegación y referencias internas usan URLs en inglés — v1.4
- ✓ `pages/preguntas-frecuentes.vue` no hace double-fetch al cargar — v1.6
- ✓ `pages/cuenta/mis-anuncios.vue` no dispara 6 llamadas en cada carga — v1.6
- ✓ `packs.store.ts` tiene cache guard para evitar llamadas redundantes — v1.6
- ✓ `conditions.store.ts` tiene cache guard — v1.6
- ✓ `regions.store.ts` tiene cache guard — v1.6
- ✓ `FormCreateThree.vue` no repite la llamada a communes que ya hizo el plugin — v1.6
- ✓ Todos los cron jobs (userCron, backupCron, cleanupCron, adCron) funcionales y documentados en inglés — v1.7
- ✓ `cron-runner` API committed (controller + routes para ejecución manual de crons) — v1.8
- ✓ `ad-free-reservation-restore.cron.ts` garantiza 3 free ad-reservation slots por usuario con lógica correcta — v1.8
- ✓ El sitio web no tiene silent failures — structured data aplicado en todas las páginas, useAsyncData keys únicas, console.error/warn visibles en producción — v1.9
- ✓ Todos los componentes de data-fetching del website usan useAsyncData (SSR-compatible) — onMounted(async) eliminado de 7 componentes — v1.9
- ✓ Todas las páginas del website tienen lang="ts"; any eliminado en stores y composables críticos — v1.9
- ✓ Los 14 stores con persist tienen comentarios de auditoría inline (CORRECT/REVIEW/RISK) — v1.9
- ✓ typeCheck: true habilitado en nuxt.config.ts del website; nuxt typecheck pasa con zero errores — v1.9
- ✓ El plugin GTM `gtm.client.ts` no pushea arrays al dataLayer; Consent Mode v2 implementado — v1.11
- ✓ El dropdown de últimas órdenes muestra nombre completo del comprador y fecha+hora completa — v1.10
- ✓ Dead import `useAdAnalytics` eliminado de `CreateAd.vue`; overcounting de `step_view` corregido; eventos `redirect_to_payment` y `purchase` (guarded) implementados; `DataLayerEvent` exportado y `window.dataLayer` tipado — v1.12
- ✓ `gtm.client.ts` eliminado; `@saslavik/nuxt-gtm@0.1.3` instalado y configurado con `enableRouterSync: true`; GA4 Realtime confirmado funcionando — v1.13
- ✓ `@saslavik/nuxt-gtm@0.1.3` instalado en `apps/dashboard`; módulo configurado con `enableRouterSync: true`; `runtimeConfig.public.gtm.id` reemplaza campo plano `gtmId`; plugin hand-rolled eliminado — v1.14
- ✓ `$setSEO` plugin emite el set completo de OG + Twitter Card tags (`ogTitle`, `ogDescription`, `ogUrl`, `ogType`, `twitterCard`, `twitterTitle`, `twitterDescription`) — v1.15
- ✓ Todos los `https://waldo.click` hardcodeados en páginas reemplazados con `config.public.baseUrl` — v1.15
- ✓ `packs/index.vue`, `packs/comprar.vue`, `cuenta/mis-ordenes.vue`, `cuenta/mis-anuncios.vue` tienen `$setSEO` + `$setStructuredData` — v1.15
- ✓ La página de perfil de usuario `[slug].vue` tiene SEO y datos estructurados restaurados (`ProfilePage` + `Person` schema) — v1.15
- ✓ La home `index.vue` tiene `WebSite` + `Organization` JSON-LD — v1.15
- ✓ `microdata.ts` reemplaza el JSON-LD en lugar de acumularlo en cada navegación SPA — v1.15
- ✓ Páginas privadas/transaccionales declaran `noindex, nofollow` vía `useSeoMeta` (18 páginas) — v1.15
- ✓ El sitemap tiene `changefreq` y `priority` en entradas estáticas; función async `urls()` unificada — v1.15
- ✓ `typeCheck: true` pasa con zero errores después de todos los cambios SEO — v1.15

  - ✓ Todas las páginas dinámicas (home, anuncios listing, ad detail, perfil de usuario) tienen títulos ≤ 45 chars y descripciones 120–155 chars con vocabulario canónico — v1.16
  - ✓ Todas las páginas estáticas (FAQ, contacto, sitemap, políticas) tienen descripciones en budget con `anuncios`, `activos industriales`, `Waldo.click®` — v1.16
  - ✓ `generateSEODescription()` en `anuncios/index.vue` eliminó el contador dinámico `${totalAds}` — v1.16
  - ✓ `sitemap.vue` corregido: `Waldo.click` → `Waldo.click®` en `$setSEO` y `$setStructuredData` — v1.16
  - ✓ Páginas `login/facebook.vue`, `login/google.vue`, `dev.vue` tienen `noindex, nofollow` — v1.16

   - ✓ Sentry restringido a producción en los 3 apps — 7 entry points con `NODE_ENV === 'production'` guard; dev/staging generan cero tráfico a Sentry — v1.17
   - ✓ `strapi.db.query` filtra server-side solo usuarios Authenticated vía `strapi.db.query` (no forgeable por clientes); N+1 eliminado; columna "Rol" removida del dashboard — v1.17
   - ✓ Cada paso del wizard de creación de avisos tiene su propia ruta dedicada (5 URLs en español) — v1.18
   - ✓ Navegación por `?step=N` query param eliminada — v1.18
   - ✓ `resumen.vue` back button apunta a `/anunciar/galeria-de-imagenes` — v1.18
   - ✓ Analytics de pasos del wizard preservados con nombres compatibles con Google Ecommerce — v1.18
   - ✓ `typeCheck: true` pasa con zero errores después de todos los cambios del URL refactor — v1.18
   - ✓ `wizard-guard.ts` middleware previene saltar pasos del wizard; SSR-safe — v1.18

   - ✓ `ad.ts` service: `AdQueryOptions` interface, `computeAdStatus(unknown)`, `transformSortParameter(unknown: unknown)`, all methods typed — zero `any` in ad service — v1.20
   - ✓ `ad.ts` controller: `ctx: Context` (koa) in all methods, `QueryParams` fields `unknown`, `filterClause: Record<string, unknown>` — zero `any` in ad controller — v1.20
   - ✓ `order.types.ts`, `filter.types.ts`, `flow.types.ts` — `payment_response`, `document_details`, `filters`/`sort`/`populate`, all `StrapiFilter` operators → `unknown` — v1.20
   - ✓ `flow.factory.ts` + `flow.service.ts` — `Core.Strapi` DI typing; `Record<string, string>` with `String()` casts for URL param bags — v1.20
   - ✓ Zoho service/interfaces (`IZohoContact` interface with index signature), HTTP client (`params: unknown`, `data: unknown`), Facto SOAP callbacks (`unknown`), Indicador, Google, Transbank, payment-gateway — zero `any` across all integration services — v1.20
   - ✓ `payment.type.ts`, `order/user/ad/general.utils.ts`, `payment.ts` controller, `image-uploader.ts`, `cache.ts`, `user-registration.ts` — all `any` eliminated; `BillingDetails` exported for `FactoDocumentData.userDetails` — v1.20
   - ✓ All 5 seeder files use `Core.Strapi` (not `strapi: any`); 4 payment test files use typed result interfaces + `(global as unknown as { strapi: MockStrapi })` cast — v1.20
   - ✓ `tsc --noEmit` exits 0 and all Jest tests pass after every phase — v1.20

   - ✓ `draft: boolean` field (`required: true`, `default: true`) added to Ad schema — every new ad is born as a draft until payment is confirmed — v1.21
   - ✓ `computeAdStatus()` returns `"draft"` as the first check; `"abandoned"` status eliminated from codebase — v1.21
   - ✓ `POST /api/ads/save-draft` endpoint — creates/updates ad draft before payment initiation; returns `{ data: { id } }` — v1.21
   - ✓ `resumen.vue` calls draft endpoint before payment for all non-free packs; `ad_id` stored in `adStore` and passed to subsequent payment calls — v1.21
   - ✓ `publishAd()` sets `draft: false` on payment confirmation; called in both `processPaidWebpay()` and `processFreePayment()` — v1.21
   - ✓ Dashboard "Abandonados" → "Borradores": label, endpoint, and filter all use `ads/drafts` — v1.21
   - ✓ Migration seeder sets `draft: true` on all existing ads with abandoned condition (`active=false`, `ad_reservation=null`) — v1.21

   - ✓ `/pagar/index.vue` con `middleware: "auth"` y `noindex` — página central de pago — v1.22
   - ✓ `PaymentAd.vue` — preview del anuncio (imagen, nombre, precio, botón Editar) como primer elemento del checkout — v1.22
   - ✓ `PaymentGateway.vue` — checkbox WebPay decorativo, preparado para pasarelas futuras — v1.22
   - ✓ `FormCheckout.vue` reestructurado con `lang="ts"`, títulos por sección, orden correcto, dead code eliminado — v1.22
   - ✓ `CheckoutDefault.vue` contiene la lógica de pago completa (draft + webpay redirect + free path + error handling) — v1.22
   - ✓ `BarCheckout.vue` — barra de acción del checkout con botón "Ir a pagar" — v1.22
   - ✓ SCSS `payment--ad` y `payment--gateway` implementados; `form--checkout__field__title` para títulos de sección — v1.22

   - ✓ `packs.store.ts` eliminado — `usePacksList` composable con module-level cache lo reemplaza; `/packs` "Comprar" escribe `adStore.pack` y navega directo a `/pagar`; `/packs/comprar` y `BuyPack.vue` eliminados — v1.23
   - ✓ `/pagar` maneja pack-only (sin `ad_id`) y pack+ad (con `ad_id`); `CheckoutDefault.vue` brancha en `adStore.ad.ad_id === null` — v1.23
   - ✓ `FormCheckout.vue` oculta `PaymentAd` y Destacado con `v-if="!isPackFlow"` en flujo pack-only — v1.23

    - ✓ `POST /api/payments/free-ad` endpoint en Strapi: valida crédito por pack type, vincula ad-reservation, `draft: false`, emails no-fatales — v1.24
    - ✓ `resumen.vue` `handleFreeCreation()`: `save-draft` → `adStore.updateAdId()` → `payments/free-ad` con `{ ad_id, pack }`; referencia a `payments/ad` eliminada del flujo free — v1.24
    - ✓ `POST /api/payments/ad` y `ad.service.ts` intactos — v1.24

   - ✓ `/pagar/gracias` muestra comprobante Webpay completo con 8 campos obligatorios (monto, código autorización, fecha/hora, tipo pago, últimos 4 dígitos, número orden, info comercio, estado) — v1.26
   - ✓ `prepareSummary()` extrae todos los campos Webpay del response de `order.payment_response`; `ResumeOrder.vue` con `CardInfo` components y labels en español; fallback "No disponible" — v1.26
   - ✓ Strapi `findOne()` consulta por `documentId` (string); redirect de Webpay usa `order.documentId` — v1.26
   - ✓ Test scaffolds para `ResumeOrder` y `gracias.vue` creados con Vitest; 7/7 tests passing — v1.26

   - ✓ `purchase()` method + `PurchaseOrderData` interface en `useAdAnalytics` — event fires en `/pagar/gracias` con `transaction_id`, `value`, `currency`, `items` no-undefined desde datos del order — v1.27
   - ✓ `pushEvent()` flow discriminator (4th param, default `"ad_creation"`) distingue `ad_creation` vs `pack_purchase` — backward compatible — v1.27
   - ✓ `begin_checkout` wired en `/pagar/index.vue` para flujo pack-only (`adStore.ad.ad_id === null`); flujo ad-creation no afectado — v1.27
   - ✓ `purchaseFired` ref guard en `/pagar/gracias.vue` asegura exactamente un evento purchase por visita; `adStore.clearAll()` preservado sin interferir (purchase lee del order object) — v1.27
   - ✓ Al hacer logout, los 6 stores de usuario se resetean en orden: `useAdStore`, `useHistoryStore`, `useMeStore`, `useUserStore`, `useAdsStore`, `useAppStore` — el siguiente usuario ve estado limpio — v1.28
   - ✓ `useLogout` composable centraliza la lógica de logout; `MenuUser.vue`, `MobileBar.vue`, `SidebarAccount.vue` usan el composable — cero código de logout duplicado — v1.28
    - ✓ `reset()` action consistente en todos los stores (Composition API); `clearAll()` eliminado — v1.28
    - ✓ Content type `Article` en Strapi con todos los campos (title, header, body richtext, cover/gallery media, categories manyToMany, seo_title, seo_description) y `draftAndPublish: true` — v1.29
    - ✓ El administrador puede listar, crear, editar y eliminar artículos desde el dashboard — v1.29
    - ✓ El administrador puede completar los campos SEO al crear o editar un artículo — v1.29
    - ✓ `slug` field (uid type, unique, required) added to Article schema; auto-generated via `slugify strict:true` in beforeCreate/beforeUpdate lifecycle hooks; `GET /api/articles` returns slug + categories + cover + gallery — v1.30
    - ✓ `Article` TypeScript interface in `app/types/article.d.ts` with all 13 fields; `typeCheck: true` passes with zero errors — v1.30
    - ✓ SCSS scaffolding: `_article.scss` (article--archive, article--single), `_hero.scss` (hero--articles, hero--article), `_filter.scss` (filter--articles), `_related.scss` (related--articles), `_card.scss` (card--article), `app.scss` import — v1.30
    - ✓ `blog/index.vue` — paginated article listing (12/page), category filter, sort order, empty-state + RelatedArticles fallback, SSR-correct `$setSEO` + `@type:"Blog"` structured data — v1.30
    - ✓ `blog/[slug].vue` — article detail with hero (breadcrumbs + H1 + date), GalleryDefault, Markdown body via `marked`, sidebar (categories + ShareDefault), RelatedArticles, 404 guard, `$setSEO` + `@type:"BlogPosting"` structured data — v1.30
     - ✓ Blog-specific components: `HeroArticles`, `FilterArticles`, `ArticleArchive`, `CardArticle`, `RelatedArticles`, `HeroArticle`, `ArticleSingle` — v1.30

     - ✓ `source_url` (string, optional) field added to Article Strapi schema; returned by `GET /api/articles/:id` automatically — v1.31
     - ✓ `source_url: string | null` added to website `Article` TypeScript interface — v1.31
     - ✓ FormArticle.vue: draft/publish toggle sends `publishedAt: null` (draft) or ISO timestamp (published) on create and update; toggle hydrates correctly from existing `publishedAt` on edit — v1.31
     - ✓ FormArticle.vue: `source_url` URL field with validation — saves on create, pre-fills on edit, sends null when empty — v1.31
      - ✓ Article detail page (`/articles/:id`) sidebar shows `source_url` as a clickable `<a target="_blank" rel="noopener noreferrer">` link when non-empty; hidden when absent — v1.31

      - ✓ `GeminiService` in `apps/strapi/src/services/gemini/` encapsulates all Gemini API calls; exposes `generateText(prompt: string): Promise<string>`; uses `gemini-1.5-flash` model — v1.32
      - ✓ `GEMINI_API_KEY` read from `process.env`; missing key throws at Strapi startup (intentional, same as SlackService) — v1.32
      - ✓ `POST /api/ia/gemini` with `{ prompt }` returns `{ text }` — validates prompt presence, delegates to `GeminiService`, catches errors as `ApplicationError` — v1.32
      - ✓ `apps/strapi/.env.example` documents `GEMINI_API_KEY` — v1.32
      - ✓ `services/gemini/index.ts` exports singleton + `generateText` named export; controller imports only from `index.ts` (no direct `@google/generative-ai` in API layer) — v1.32

      - ✓ `TavilyService` in `apps/strapi/src/services/tavily/` encapsulates all Tavily API calls; `POST /api/search/tavily` returns `{ news: [{ title, link, snippet, date, source }] }` — v1.34
      - ✓ `LightBoxArticles.vue` 3-step dashboard lightbox: search news (Tavily) → edit Gemini prompt → generate + create article draft via Groq — v1.34
      - ✓ `search.store.ts` caches Tavily results by query; Swal prompts reuse-or-refresh on cache hit — v1.34
      - ✓ `articles.store.ts` caches AI responses by source URL (session-only, no persist); duplicate article guard via `source_url` filter before Strapi POST — v1.34
      - ✓ Groq `llama-3.3-70b-versatile` via `POST /api/ia/groq` with `response_format: json_object` replaces Gemini for article generation (rate limit workaround) — v1.34
      - ✓ DeepSeek service + `POST /api/ia/deepseek` endpoint scaffolded (requires paid credits) — v1.34

       - ✓ `GET /api/users/authenticated` endpoint added to users-permissions plugin extension — server-side Authenticated role filter via `strapi.db.query`, returns only `{ id, firstName, lastName }` — v1.35
       - ✓ `POST /api/ad-reservations/gift` endpoint creates N ad-reservation records assigned to the selected authenticated user — v1.35
       - ✓ `POST /api/ad-featured-reservations/gift` endpoint creates N ad-featured-reservation records assigned to the selected authenticated user — v1.35
       - ✓ `gift-reservation.mjml` email template notifies recipient after successful gift creation (non-fatal — gift succeeds even on email failure) — v1.35
       - ✓ `LightboxGift.vue` reusable controlled lightbox — `isOpen/endpoint/label` props + `close/gifted` emits; quantity input + searchable user select (Authenticated users only, first+last name); Swal confirmation before POST — v1.35
        - ✓ "Regalar Reservas" button wired into `reservations/[id].vue`; "Regalar Reservas Destacadas" wired into `featured/[id].vue` — end-to-end gift flow complete for both reservation types — v1.35

        - ✓ `verification-code` content type (userId, code, expiresAt, attempts, pendingToken) — `draftAndPublish: false`; `POST /api/auth/local` intercepted by `overrideAuthLocal` to return `{ pendingToken, email }` instead of JWT — v1.36
        - ✓ `POST /api/auth/verify-code` validates code (15-min expiry, max 3 attempts) and issues JWT on success; `POST /api/auth/resend-code` rate-limited to 60s regenerates + resends email — v1.36
        - ✓ `verification-code.mjml` Spanish email template with 32px bold code display extending Waldo base layout — v1.36
        - ✓ Daily cleanup cron at 4 AM (`verification-code-cleanup`) bulk-deletes expired records via `deleteMany`; triggerable via `POST /api/cron-runner/verification-code-cleanup` — v1.36
        - ✓ Google OAuth (`GET /auth/:provider/callback`) bypasses 2-step via `ctx.method === "GET"` guard in `overrideAuthLocal` — v1.36
        - ✓ Dashboard `FormLogin.vue` rewritten with `useStrapiClient()` POST + `useState('pendingToken')` handoff to `/auth/verify-code` — v1.36
        - ✓ Dashboard `/auth/verify-code` page with `FormVerifyCode.vue` component — 6-digit input, 60s resend countdown, `setToken(jwt)` + `fetchUser()`, manager role check, Swal errors on failure — v1.36
        - ✓ Website `FormLogin.vue` and `/login/verificar` page with `FormVerifyCode.vue` implemented (VSTEP-13 to 16 code present; phase 079 not formally executed — carried to next milestone) — v1.36

## Context

- Monorepo con Turbo para orquestación de tareas
- Strapi v5 es el backend central; Website y Dashboard son clientes HTTP de sus APIs
- Transbank integrado en el flujo de creación de aviso en Strapi, abstraído detrás de IPaymentGateway (v1.0)
- El sistema valida disponibilidad de créditos según PackType y FeaturedType antes de procesar el pago
- Deploy independiente por app vía Laravel Forge con git sparse-checkout
- Dashboard (apps/dashboard): Nuxt 4, Pinia, @nuxtjs/strapi v2, SCSS custom; ~65 componentes, 3 stores, 14 plugins; typeCheck: true (since v1.1)
- Website (apps/website): Nuxt 4, Pinia, @nuxtjs/strapi v2; 34 páginas lang="ts" (5 new step pages added in v1.18), 14 stores con persist audit, typeCheck: true (since v1.9)
- Ad creation wizard (v1.18): 5 dedicated routes (`/anunciar`, `/anunciar/datos-del-producto`, `/datos-personales`, `/ficha-de-producto`, `/galeria-de-imagenes`); `wizard-guard.ts` middleware prevents step skipping (SSR-safe); `stepRoutes` Record map in `CreateAd.vue`; per-page `stepView` analytics
- Ad draft flow (v1.21): `draft: boolean` field on Ad schema (`default: true`); `POST /api/ads/save-draft` creates/updates draft before payment; `publishAd()` sets `draft: false` on payment confirmation; `computeAdStatus()` checks draft first; dashboard Borradores section uses `/ads/drafts` endpoint; free ad flow skips draft call entirely
- Checkout flow (v1.22): `/pagar` page as central payment hub; `CheckoutDefault.vue` owns full payment logic (draft + webpay + free path); `PaymentAd.vue` previews ad; `PaymentGateway.vue` shows WebPay decoratively; `FormCheckout.vue` accordion with 5 sections; `BarCheckout.vue` action bar; SCSS `payment--ad`, `payment--gateway`, `form--checkout__field__title`
- Unified payment flow (v1.23): `packs.store.ts` eliminated — `usePacksList` composable (module-level cache) replaces it; `/packs` "Comprar" writes `adStore.pack` and navigates directly to `/pagar`; `/packs/comprar` and `BuyPack.vue` deleted; `CheckoutDefault.vue` branches on `adStore.ad.ad_id === null` — pack-only calls `POST payments/pack`, ad+pack calls `POST payments/ad`; `FormCheckout.vue` hides `PaymentAd` and Destacado via `v-if="!isPackFlow"` in pack-only context
- Free ad submission (v1.24): `POST /api/payments/free-ad` endpoint in Strapi validates credit by pack type (`pack="free"` → free reservation with `price: "0"`; `pack="paid"` → purchased reservation with `price != "0"`), links ad-reservation, sets `draft: false`, sends emails (non-fatal); `resumen.vue` `handleFreeCreation()` calls `save-draft` first (gets `ad_id`), stores in `adStore`, then calls `payments/free-ad` with `{ ad_id, pack }`; `POST /api/payments/ad` and `ad.service.ts` untouched; `freeAdCreate` permission must be granted to Authenticated role in Strapi admin
- 4 cron jobs activos en Strapi: `adCron` (1 AM), `userCron` (2 AM), `backupCron` (3 AM), `cleanupCron` (domingo 4 AM)
- `cron-runner` API disponible en `POST /api/cron-runner/:name` para ejecución manual de cualquier cron
- GTM handled via `@saslavik/nuxt-gtm@0.1.3` module in both website (since v1.13) and dashboard (since v1.14) — `enableRouterSync: true` fires page_view on every SPA route change; GTM ID from `runtimeConfig.public.gtm.id`; hand-rolled `gtm.client.ts` plugins deleted in both apps
- Ad creation analytics (`useAdAnalytics.ts`): full ecommerce event chain — view_item_list, step_view (per wizard page), begin_checkout, redirect_to_payment, purchase (one-shot guard); `PurchaseOrderData` interface + flow discriminator param in pushEvent (4th positional, default "ad_creation"); 12 Vitest tests covering composable logic (since v1.27); `DataLayerEvent` fully typed in `window.d.ts` (since v1.12)
- Webpay receipt (since v1.26): `/pagar/gracias` shows full 8-field Webpay receipt via `ResumeOrder.vue`; `prepareSummary()` extracts from `order.payment_response`; Spanish labels, "No disponible" fallbacks; fetches by `order.documentId`
- SEO infrastructure (v1.15): `$setSEO` plugin in `seo.ts` emits full OG + Twitter Card set; `$setStructuredData` in `microdata.ts` with key-based deduplication; `@nuxtjs/seo` provides sitemap (with static entries having `changefreq`/`priority`), robots, OG defaults; all page URLs use `config.public.baseUrl`; 18+ private pages have `noindex`; home has WebSite + Organization JSON-LD; user profile `[slug].vue` has ProfilePage + Person schema
- Strapi TypeScript (v1.20): zero `any` in ad service/controller, all type files, all integration services (Zoho, Facto, Indicador, Google, Transbank, payment-gateway), all payment utils/middlewares, all seeders, and all payment test files; `tsc --noEmit` exits 0; established patterns: `AdQueryOptions`, `IZohoContact`, `IWebpayCommitData`, data double-cast for entityService JSON fields, `Core.Strapi` for DI typing
- Blog public views (since v1.30): `slug` uid field on Article with lifecycle hooks; `Article` TS interface (13 fields); 7 blog-specific components (`HeroArticles`, `FilterArticles`, `ArticleArchive`, `CardArticle`, `RelatedArticles`, `HeroArticle`, `ArticleSingle`); `useArticlesStore` (no persist, pageSize 12); `blog/index.vue` + `blog/[slug].vue` with full SSR, SEO, structured data; Markdown rendered via `marked`; related articles: same-category first, fill with most-recent, deduplicate, slice to 6
- Article Manager Improvements (since v1.31): `source_url` string field in Strapi Article schema (optional, no constraints); `source_url: string | null` in website `Article` TS interface; `FormArticle.vue` has draft/publish boolean toggle mapping to `publishedAt: null` / ISO string on submit; `source_url` URL field with Yup validation saves on create and pre-fills on edit; article detail page (`/articles/:id`) sidebar renders `source_url` as `<a target="_blank" rel="noopener noreferrer">` when non-empty
- Gemini AI Service (since v1.32): `apps/strapi/src/services/gemini/` — `GeminiService` class (`gemini.service.ts`) wraps `@google/generative-ai`, uses `gemini-1.5-flash` model, reads `GEMINI_API_KEY` from `process.env`, throws at startup if missing (same pattern as SlackService); `index.ts` exports singleton + `generateText` named export; `POST /api/ia/gemini` endpoint (`apps/strapi/src/api/ia/`) accepts `{ prompt }`, returns `{ text }`, wraps Gemini errors in `ApplicationError`; `GEMINI_API_KEY` documented in `.env.example`
- Anthropic Claude AI Service (v1.33): `apps/strapi/src/services/anthropic/` — `AnthropicService` class wraps `@anthropic-ai/sdk`, uses `claude-sonnet-4-5` model, implements `web_search` tool via Brave Search API; tool loop until `stop_reason === "end_turn"`; `POST /api/ia/claude` endpoint accepts `{ prompt }`, returns `{ text }`
- 2-Step Login Verification (v1.36): `verification-code` content type (5 fields); `overrideAuthLocal` intercepts `POST /api/auth/local` — returns `{ pendingToken, email }`, no JWT; `GET /auth/:provider/callback` bypassed via `ctx.method === "GET"` guard; `POST /api/auth/verify-code` (15-min expiry, max 3 attempts); `POST /api/auth/resend-code` (60s rate limit); `verification-code-cleanup` daily cron 4 AM; `verification-code.mjml` Spanish email; dashboard `/auth/verify-code` with `FormVerifyCode.vue` (6-digit input, 60s countdown, setToken + role check); website `/login/verificar` with same pattern; 5 additional cron jobs now active (verification-code-cleanup added)

## Constraints

- **Tech**: Nuxt 4, Vue 3 Composition API, TypeScript strict — refactors deben seguir patrones existentes
- **Sin breaking changes**: El comportamiento del dashboard desde la perspectiva del usuario no debe cambiar
- **Sin tests**: Los tests unitarios quedan para un milestone dedicado posterior (excepto utilities v1.3 que sí tienen tests)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Abstracción en Strapi, no en el frontend | Toda la lógica de negocio vive en Strapi; el frontend es stateless | ✓ Good |
| Transbank como adaptador default | Mantiene compatibilidad hacia atrás, cero cambios en el flujo actual | ✓ Good |
| `watch({ immediate: true })` como único trigger de carga | Elimina double-fetch sin cambiar comportamiento; onMounted es el duplicado | ✓ Good |
| Claves de sección dedicadas por status en settings store | Isolation completa de paginación/filtros; nunca compartir clave entre vistas distintas | ✓ Good |
| Componente genérico `AdsTable` en lugar de 6 variantes | Elimina ~1,200 líneas duplicadas; variación real es solo endpoint + section + showWebLink | ✓ Good |
| Reservations*/Featured* consolidation deferred | Store keys compartidos causan conflictos de paginación; fetch strategies incompatibles | ✓ Good |
| Shared domain types en `app/types/` | 62 ocurrencias de `any` y tipos redeclarados → un único source of truth | ✓ Good |
| Strapi SDK v5 cast pattern | `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast | ✓ Good |
| Aggregate endpoints en Strapi para N+1 | N HTTP round trips → 1; N DB queries paralelas server-side son negligibles | ✓ Good |
| `typeCheck: true` habilitado en v1.1 | Todo trabajo futuro en dashboard tiene type checking en build | ✓ Good |
| Strict null handling in utilities | Ensures `undefined`/`null` never crash the UI, returning fallback strings | ✓ Good |
| Consolidated utility files | Reduces code duplication and ensures consistent formatting across the app | ✓ Good |
| `git mv` para renombrar directorios y archivos de rutas | Preserva historial de Git en renombres de Nuxt page files; dos commits: rename primero, refs después — v1.4 | ✓ Good |
| Labels de UI en español se preservan (solo rutas en inglés) | Las breadcrumbs y labels son contenido visible por usuario — no se traducen en esta migración — v1.4 | ✓ Good |
| `routeRules` explícitas (sin wildcards `:splat`) | Rutas explícitas cubren el 100% sin incompatibilidades de TypeScript/build — v1.4 | ✓ Good |
| Links externos al sitio web público exentos de localización | Solo rutas del dashboard en scope; `websiteUrl + /anuncios/[slug]` son URLs del sitio público — v1.4 | ✓ Good |
| Reservation freeing updates reservation side (FK on reservation, not ad) | Consistent with existing cron pattern in `user.cron.ts`; `entityService.update(uid, id, { data: { ad: null } })` — v1.5 | ✓ Good |
| No try/catch around reservation-freeing calls | If freeing fails, whole reject/ban should fail — caller handles outer error; silent failure would leave orphaned credits — v1.5 | ✓ Good |
  | `!!ad.ad_reservation?.id` evaluated on pre-freed ad object | Ad is fetched before freeing runs; original value correctly reflects "did this ad have a reservation?" for email flag — v1.5 | ✓ Good |
  | `useAsyncData`-only data loading in website pages | Bare `await` store calls before `useAsyncData` cause double-fetch (SSR + client); single `useAsyncData` is the canonical pattern — v1.6 | ✓ Good |
  | Aggregate `GET /ads/me/counts` endpoint vs. 5 parallel client calls | Server-side `Promise.all` with 5 `entityService.count()` calls; client sees 1 HTTP request instead of 5 — v1.6 | ✓ Good |
  | Cache guard: array-length + timestamp (not timestamp-only) | Timestamp-only guard produces false cache hit on empty state after TTL reset; length check ensures data actually exists — v1.6 | ✓ Good |
  | `packs.store.ts` gained localStorage `persist` | Without persist the cache guard is useless on page refresh (store always empty); aligns packs with conditions/regions stores — v1.6 | ✓ Good |
  | `featuredCron` "free available" = price=0 AND (ad=null OR ad.active=false) | An occupied slot must mean the ad is currently active; an inactive ad's slot is reclaimable — v1.8 | ✓ Good |
  | `featuredCron` creates slots with no `total_days` | Featured reservations have no expiry concept; omitting total_days matches schema intent (field is optional) — v1.8 | ✓ Good |
  | `featuredCron` schedule at 2:30 AM (not 2:00 AM) | Slots between existing userCron (2:00 AM) and backupCron (3:00 AM); 30-min gap prevents overlap — v1.8 | ✓ Good |
  | `featured.cron.ts` reverted post-implementation | Business decision: free-slot guarantee already covered by `ad-free-reservation-restore.cron.ts`; duplicate cron removed — v1.8 | ✓ Good |
  | `ad-free-reservation-restore.cron.ts` counts by `ad.active=true` | Reservations linked to inactive/expired ads are consumed history, not available pool — v1.8 | ✓ Good |
  | Batch size of 50 users for parallel processing | Avoids DB connection pool exhaustion; `Promise.all` per batch for throughput — v1.8 | ✓ Good |
  | `window.d.ts` consolidates all Window globals | TypeScript merges all declare global blocks; one file prevents per-file duplication — v1.9 | ✓ Good |
  | `StrapiUser` augmented in `strapi.d.ts` | One declaration makes custom fields available everywhere `useStrapiUser()` is called — v1.9 | ✓ Good |
  | `Ad.category` and `Ad.commune` widened to union types | Models populated vs. unpopulated Strapi responses correctly; `number \| CategoryObject` — v1.9 | ✓ Good |
  | `createError statusMessage` not `description` | `NuxtError` extends `H3Error`; `statusMessage` is the correct field — v1.9 | ✓ Good |
  | `useAsyncData` default option eliminates `T \| undefined` | Removes undefined from type without changing runtime behavior; props receive `T` cleanly — v1.9 | ✓ Good |
  | `typeCheck: true` permanently enabled in website | Every future build enforces TypeScript; TS-04 goal achieved; no more deferred type errors — v1.9 | ✓ Good |
  | dataLayer push approach (no separate gtag.js) for Consent Mode v2 | GTM reads dataLayer natively; loading gtag.js separately would create two competing tag systems — v1.11 | ✓ Good |
  | Default consent denial pushed before GTM script loads | Consent Mode v2 requires denial-first; GTM processes dataLayer in order so pre-load push ensures compliance — v1.11 | ✓ Good |
  | `window.dataLayer` typed as `(DataLayerEvent \| Record<string, unknown>)[]` union | Covers both GA4 analytics events and GTM consent commands (plain objects without event/flow fields) — v1.12 | ✓ Good |
  | `purchaseFired` ref guard on `gracias.vue` purchase event | `watchEffect` can re-run; ref guard ensures exactly one purchase event regardless of re-render — v1.12 | ✓ Good |
  | `@saslavik/nuxt-gtm` over `@nuxtjs/gtm` or `@zadigetvoltaire/nuxt-gtm` | `@nuxtjs/gtm` is Nuxt 2 only; `@zadigetvoltaire/nuxt-gtm` not Nuxt 4 compatible; `@saslavik` is the only maintained Nuxt 4 option — v1.13 | ✓ Good |
  | GTM module `enableRouterSync: true` replaces manual `router.afterEach` push | Module handles SPA page_view natively; eliminates hand-rolled plugin entirely — v1.13 | ✓ Good |
  | `runtimeConfig.public.gtm.id` replaces `gtmId` flat field | Nested object keeps GTM config grouped; optional chaining `?.id` in feature flag avoids runtime errors if not set — v1.13 | ✓ Good |
  | `$setSEO` extended to emit full OG + Twitter tag set | `useSeoMeta` is the canonical Nuxt 4 way; deriving `ogTitle` from `title` prevents call-site changes — v1.15 | ✓ Good |
  | `config.public.baseUrl` for all absolute SEO URLs | Environment-agnostic; single source of truth already present in runtimeConfig — v1.15 | ✓ Good |
  | `useHead` key on JSON-LD script entry prevents accumulation | Nuxt merges `useHead` calls with matching keys; no custom dedup logic needed — v1.15 | ✓ Good |
  | `noindex` via `useSeoMeta` as defense-in-depth | robots.txt already disallows private paths; inline noindex survives misconfiguration or direct deep-links — v1.15 | ✓ Good |
  | Static copy for all `$setSEO` calls — no dynamic counters | Counters like `${totalAds}` go stale on SSR; static keyword-rich copy is more durable and SERP-accurate — v1.16 | ✓ Good |
  | Title budget enforced at ≤ 45 chars (excluding `\| Waldo.click®` suffix) | `@nuxtjs/seo` appends the suffix automatically; including it manually causes double-brand in rendered title — v1.16 | ✓ Good |
   | `$setStructuredData` description always mirrors `$setSEO` description | Structured data must be consistent with visible meta; kept as verbatim copy in same edit — v1.16 | ✓ Good |
   | `strapi.db.query` for role filter, not content-API service | Content-API sanitizer strips `filters[role]` for regular JWTs; `db.query` bypasses it — non-forgeable server-side enforcement — v1.17 | ✓ Good |
   | Inline sanitize (spread + omit) replaces `getDetailedUserData` on users list | N+1 eliminated: `Promise.all(users.map(getDetailedUserData))` replaced with field-spread; no loss of list functionality — v1.17 | ✓ Good |
   | `dsn: undefined` for production-only Sentry (not conditional init) | SDK-supported pattern; skips all instrumentation with zero overhead; consistent with existing correct files in repo — v1.17 | ✓ Good |
   | `enabled: process.env.NODE_ENV === 'production'` in Strapi Sentry plugin | Unloads plugin entirely in dev/staging; `enabled: true` was shipping dev/staging noise to Sentry — v1.17 | ✓ Good |
   | `stepRoutes` Record map in `CreateAd.vue` for step-to-path routing | Explicit Record avoids magic strings; route-push is cleaner than query-param mutation — v1.18 | ✓ Good |
   | `onMounted` (not watcher) for analytics + step sync in each step page | Each page mounts fresh on navigation; mount is the correct trigger; avoids overcounting — v1.18 | ✓ Good |
   | Removed multi-step watcher from `index.vue` — per-page analytics only | Each dedicated step page owns its own `stepView`; centralized watcher caused double-counting — v1.18 | ✓ Good |
   | `wizard-guard.ts` middleware added post-verification as step-skip prevention | Out of original scope but low-risk addition; improves UX by redirecting to first incomplete step — v1.18 | ✓ Good |
   | `if (import.meta.server) return;` in `wizard-guard.ts` | `adStore` uses `storage: localStorage` → `storage: undefined` on server → empty initial state → always redirected; SSR guard prevents false redirects — v1.18 | ✓ Good |
   | `Zoho-oauthtoken` header prefix (not `Bearer`) in ZohoHttpClient | Zoho CRM API rejects `Bearer` scheme; correct prefix required for all outbound requests — v1.19 | ✓ Good |
   | 401 interceptor with `_retry` guard in ZohoHttpClient | Token refresh loop prevention; single retry after re-auth; calling code never sees expired token errors — v1.19 | ✓ Good |
   | `axios-mock-adapter` injected via optional constructor param | Test isolation without touching production path; real env vars never needed in unit tests — v1.19 | ✓ Good |
   | `Stage: "Cerrado ganado"` hardcoded in `createDeal()` | All Waldo deals are immediately closed; callers never pass Stage; Spanish value matches CRM pipeline — v1.19 | ✓ Good |
   | Floating promise (`.then().catch()`) for `ad_paid` Zoho sync | `adResponse` controller issues `ctx.redirect()` immediately after; awaiting Zoho would block the redirect — v1.19 | ✓ Good |
   | `await` (blocking) for `pack_purchased` Zoho sync | `processPaidWebpay` for packs is not a redirect handler; blocking is safe and simpler — v1.19 | ✓ Good |
   | First-publish guard (`isPending` check) in `approveAd()` | Re-approving an already-published ad must not double-increment `Ads_Published__c` — v1.19 | ✓ Good |
   | `AdQueryOptions` interface for ad service method params | Expresses intent for query shape (page, pageSize, filters, sort, populate); avoids bare `Record<string, unknown>` which loses semantics — v1.20 | ✓ Good |
   | `ad: unknown` → `Record<string, unknown>` narrowing for `computeAdStatus` | Safe access to Strapi entity fields without runtime risk; avoids `any` while preserving flexibility — v1.20 | ✓ Good |
   | `IZohoContact { id: string; [key: string]: unknown }` interface | Callers access `.id` on contact results; plain `unknown` would break 9 call sites; index signature preserves flexibility — v1.20 | ✓ Good |
   | `IWebpayCommitData` with optional fields + index signature | Optional fields allow partial test mock objects (`{ buy_order: "x" }`) to compile; index signature allows callers to access arbitrary fields — v1.20 | ✓ Good |
   | Data double-cast `as unknown as Parameters<...>[N]["data"]` for entityService JSON fields | Strapi's `entityService` expects `JSONValue` (stricter than `unknown`); double-cast is the AGENTS.md-aligned way to pass typed data — v1.20 | ✓ Good |
   | `WebpayAdResult` local interface for `processPaidWebpay` | TypeScript union narrowing doesn't work on optional property absence; local interface gives exact type safety at the guard site — v1.20 | ✓ Good |
   | `(global as unknown as { strapi: MockStrapi })` for test global | `@strapi/types` already declares `global var strapi: Strapi`; redeclaring with narrower type causes TS conflict; double-cast via `unknown` bypasses without touching global scope — v1.20 | ✓ Good |
   | `Core.Strapi` (imported from `@strapi/strapi`) for seeder + factory DI params | Official Strapi-provided type for the full Strapi instance; replaces `strapi: any` in all seeder functions and service factories — v1.20 | ✓ Good |
   | `draft: boolean` field as single source of truth for draft state | Replaces complex multi-condition `abandoned` check; one field, one check, one migration path — v1.21 | ✓ Good |
   | Intersection type cast `(adData as AdData & { draft: boolean; is_paid: boolean })` | Avoids modifying shared `AdData` interface for fields only relevant to draft/payment flow — v1.21 | ✓ Good |
   | `publishAd()` called in both Transbank and free payment paths | Ensures every payment confirmation flips `draft: false`; no ad stays in draft state after successful payment — v1.21 | ✓ Good |
   | `POST /api/ads/save-draft` in ad domain (not payment domain) | Draft is an ad concern, not a payment concern; co-located with `draftAds()`, `computeAdStatus()`, and ad schema — v1.21 | ✓ Good |
   | Free ad flow (`pack=free`) skips draft call entirely | Free pack ads don't go through payment; draft pre-call would be orphaned; no `draft: false` flip needed for free packs — v1.21 | ✓ Good |
   | `/pagar` as single payment execution page | All `hasToPay === true` flows redirect here; payment logic centralized in `CheckoutDefault.vue` — v1.22 | ✓ Good |
   | `PaymentAd` pattern — ad preview first in checkout | Gives user context before paying; reduces abandonment by confirming they're paying for the right thing — v1.22 | ✓ Good |
   | `CheckoutDefault.vue` owns full payment logic | `resumen.vue` becomes a review/redirect step only; no payment duplication across pages — v1.22 | ✓ Good |
   | `BarCheckout.vue` separated from `BarAnnouncement.vue` | Checkout action bar has different semantics (no back button, step count); clean separation avoids prop flag soup — v1.22 | ✓ Good |
   | Module-level ref + lastFetch pattern for composable-level caching (no Pinia) | Avoids Pinia overhead when state is non-persistent; same TTL/length guard semantics as packs.store — v1.23 | ✓ Good |
   | `adStore.ad.ad_id === null` as pack-only sentinel | Checked before any mutations in `handlePayClick()`; reliable because draft call only exists in ad+pack branch — v1.23 | ✓ Good |
   | `v-if` (not `v-show`) for ad-specific sections in FormCheckout | Pack-only flow must not mount `PaymentAd` or Destacado at all; `v-show` would still run lifecycle hooks — v1.23 | ✓ Good |
   | `POST payments/pack` for pack-only; `POST payments/ad` unchanged for ad+pack | Backend already had separate endpoints; frontend branch mirrors this split cleanly — v1.23 | ✓ Good |
    | `free-ad.service.ts` handles both `pack="free"` and `pack="paid"` branches | Free reservation uses `price: "0"` guard; paid reservation uses inverse; single service covers both valid pack values — v1.24 | ✓ Good |
    | Email failures non-fatal in free-ad flow (wrapped in try/catch) | Reservation + publication are the critical operations; a broken email template must not roll back a successful ad submission — v1.24 | ✓ Good |
    | Two-step free creation: `save-draft` then `free-ad` (same as paid flow) | `free-ad` requires an existing `ad_id`; draft must exist before the payment endpoint is called — v1.24 | ✓ Good |
    | Webpay redirect uses `order.documentId` (not `adId`) | Thank-you flow is order-centric; `adId` unavailable in Transbank callback; `documentId` is the stable Strapi v5 identifier — v1.26 | ✓ Good |
    | `prepareSummary()` extracts Webpay fields from `order.payment_response` | Single extraction point; page stays thin; all field mapping and fallback logic centralized — v1.26 | ✓ Good |
    | `purchase()` passes `[]` as items to `pushEvent`, full payload in `extraData.ecommerce` | `pushEvent` internal `ecommerce` object would overwrite real items if passed normally; `extraData` route preserves full payload — v1.27 | ✓ Good |
    | `watch(orderData, ..., { immediate: true })` for purchase event in `gracias.vue` | Handles SSR hydration case where async data is already populated before mount; `onMounted` fires too late — v1.27 | ✓ Good |
    | `purchaseFired` ref guard prevents double-firing in reactive context | `watch` with `immediate: true` can re-evaluate; boolean guard ensures exactly one purchase event per page visit — v1.27 | ✓ Good |
     | `adStore.ad.ad_id === null` as `beginCheckout` guard in `/pagar/index.vue` | Reliable sentinel for pack-only flow; ad-creation always has a numeric `ad_id` from the draft call — v1.27 | ✓ Good |
   | `singularName: "article"` / `pluralName: "articles"` for News content type | Strapi uniqueness check includes both in same array; using "news"/"news" would conflict — v1.29 | ✓ Good |
   | `categories` as `manyToMany` (not `manyToOne`) in Article schema | An article can belong to multiple categories; reuses existing `api::category.category` — v1.29 | ✓ Good |
   | `strapi.delete` requires string `documentId` in Strapi v5 SDK | Numeric `id` not accepted for delete in v5; use `documentId \|\| String(id)` fallback — v1.29 | ✓ Good |
    | `TextareaArticle.vue` custom component over EasyMDE/fontawesome | No external font dependencies; lucide already installed; full control over styling within BEM system — v1.29 | ✓ Good |
    | Blog components replicated (not reused) from ads equivalents | User requirement: blog-specific BEM namespaces; shared components (`HeaderDefault`, `GalleryDefault`, etc.) still reused — v1.30 | ✓ Good |
    | `slug` as `uid` type (not `string`) in Strapi Article schema | Admin gets auto-generation UI + uniqueness enforcement; matches category pattern in codebase — v1.30 | ✓ Good |
    | `article.gallery` (GalleryItem[]) for GalleryDefault, not `article.cover` (Media[]) | `cover: Media[]` has no direct `.url`; GalleryItem extends Media and adds `.url` — v1.30 | ✓ Good |
    | `@type: "Blog"` for listing, `@type: "BlogPosting"` for detail | Correct schema.org types for collection vs. individual article structured data — v1.30 | ✓ Good |
    | `useArticlesStore` has no persist | Article list is volatile (changes with filters/pagination); persist would stale-cache filtered views — v1.30 | ✓ Good |
     | Related articles: same-category first, fill with most-recent, deduplicate, slice to 6 | Maximizes relevance while guaranteeing 6 items; dedup prevents duplicates when same-category and recent overlap — v1.30 | ✓ Good |
     | No unique/maxLength constraints on `source_url` in Article schema | Kept minimal like `seo_title`/`seo_description`; URL validation lives in the form (Yup), not the schema — v1.31 | ✓ Good |
     | `source_url` typed as `string \| null` (not `string \| undefined`) in Article interface | Strapi returns `null` for unset optional string fields, not `undefined`; matches existing nullable field conventions — v1.31 | ✓ Good |
     | `form.published` boolean → `publishedAt: null / ISO string` mapping on submit (not direct v-model on `publishedAt`) | Avoids storing ISO strings in form state; boolean is cleaner to bind to checkbox; single mapping point on submit — v1.31 | ✓ Good |
      | `source_url` uses existing `card--info` pattern in detail sidebar (not `CardInfo` component) | `CardInfo` only accepts plain string descriptions; `card--info` allows custom `<a>` element inside — v1.31 | ✓ Good |
       | `GeminiService` uses module-level singleton (same as `SlackService`) | Throws at startup if `GEMINI_API_KEY` missing — same intentional behavior as SlackService; no silent failures — v1.32 | ✓ Good |
       | `process.env.GEMINI_API_KEY` (not `strapi.config.get`) | Follows SlackService pattern; env var access is consistent across all integration services — v1.32 | ✓ Good |
       | Controller imports only from `services/gemini/index.ts` | No direct `@google/generative-ai` in the API layer; all Gemini calls encapsulated in the service — v1.32 | ✓ Good |
       | `ApplicationError` over `ctx.internalServerError` for Gemini runtime failures | Strapi-idiomatic error surfacing; `try/catch` in controller → `ApplicationError` keeps Strapi running on Gemini API errors — v1.32 | ✓ Good |
       | `AnthropicService` throws at startup if `ANTHROPIC_API_KEY` or `BRAVE_SEARCH_API_KEY` missing | Both keys are required for the service to function; fail-fast at startup prevents silent runtime failures — v1.33 | ✓ Good |
       | Native `fetch` (Node 20+) for Brave Search HTTP calls | `axios` is not in strapi's `dependencies`; Node 20 has stable native fetch — no new dependency needed — v1.33 | ✓ Good |
       | Tool loop uses `stop_reason === "end_turn"` as termination condition | SDK-idiomatic; `end_turn` means Claude is done and returned text; guards against infinite loops from bad tool results — v1.33 | ✓ Good |
       | `web_search` returns top-5 results to Claude (count=5) | Balances context window usage vs. search coverage; matches Brave Search API free tier expectations — v1.33 | ✓ Good |
       | `TavilyService` singleton + `POST /api/search/tavily` | Follows SerperService/GeminiService singleton pattern; controller contains no direct HTTP calls — v1.34 | ✓ Good |
       | `LightBoxArticles` uses controlled pattern (isOpen prop + @close emit) | Matches `LightboxRazon.vue` pattern; parent controls open/close state — v1.34 | ✓ Good |
       | Groq `response_format: { type: "json_object" }` for structured AI output | Forces valid JSON — eliminates markdown code fence wrapping that breaks `JSON.parse` — v1.34 | ✓ Good |
       | `articles.store.ts` caches AI responses by source URL (session-only, no persist) | Avoids redundant Groq calls; session cache sufficient — AI responses don't need to survive page refresh — v1.34 | ✓ Good |
        | Duplicate article guard via `source_url` filter before Strapi POST | Prevents duplicate articles from same news source; navigates to existing article edit on conflict — v1.34 | ✓ Good |
       | No pagination on `getAuthenticatedUsers` — gift lightbox needs full user list | Paginated select would complicate UX; user count is bounded (admin-only tool, Authenticated role only) — v1.35 | ✓ Good |
        | `select: ['id', 'firstName', 'lastName']` enforced in `strapi.db.query` for gift user list | No sensitive fields (email, password hash) can leak even if caller forges request — v1.35 | ✓ Good |
        | Email delivery non-fatal in gift endpoints (inner try/catch) | Gift creation succeeds even if MJML email fails; consistent with free-ad and reject/ban email patterns — v1.35 | ✓ Good |
         | `LightboxGift.vue` accepts `endpoint` prop for reuse | Single component handles both `ad-reservations` and `ad-featured-reservations` gift flows — v1.35 | ✓ Good |
         | `loadUsers()` called on every open without caching | Gift listbox is used infrequently by admins; fresh user list preferred over stale cache — v1.35 | ✓ Good |
         | `overrideAuthLocal` guards `ctx.method === "GET"` to skip 2-step for OAuth | `auth.callback` handles both `POST /auth/local` and `GET /auth/:provider/callback`; GET check is the minimal correct discriminator — v1.36 | ✓ Good |
          | `verification-code` content type with `draftAndPublish: false` | Records are create/query/delete lifecycle — no publishing workflow needed; matches all other utility content types — v1.36 | ✓ Good |
          | `pendingToken` as `type=string + unique:true` (not `type=uid`) | `uid` is a slug generator, not an opaque token; string + unique gives correct semantics without unwanted behavior — v1.36 | ✓ Good |
          | `useStrapiClient()` direct POST for 2-step login (bypassing `useStrapiAuth().login()`) | SDK `login()` expects a JWT in the response; backend now returns `{ pendingToken, email }` — direct client call is required — v1.36 | ✓ Good |
          | `FormVerifyCode.vue` component extracted (not inline in page) | Follows existing auth page pattern (`FormLogin.vue`); page stays clean; resend button placed in `auth__form__help` section of page — v1.36 | ✓ Good |
          | `onMounted` guard (not guest middleware) on verify-code page | JWT not set yet when page mounts; guest middleware would not apply; `pendingToken` emptiness is the correct guard signal — v1.36 | ✓ Good |
          | `overrideForgotPassword` fully replaces Strapi's built-in (not wraps it) | Calling original + MJML override sends two emails; full replacement is the only correct pattern — v1.37 | ✓ Good |
          | `context` field in forgot-password POST body (not query param) | Query params are lost after form submit redirect; body field survives the round-trip — v1.37 | ✓ Good |
          | `DASHBOARD_URL` env var for context routing in password reset | Single config point; changing reset link destination requires no code deploy — v1.37 | ✓ Good |
          | `if (response.jwt)` guard in `FormRegister.vue` before `setToken()` | Email confirmation mode returns no JWT; calling `setToken(undefined)` would corrupt auth state — v1.37 | ✓ Good |
          | `useState('registrationEmail')` as cross-page shared state (Register → /registro/confirmar) | No auth state set yet; composable shared state is SSR-safe and doesn't require Pinia for transient one-way handoff — v1.37 | ✓ Good |
          | `POST /api/auth/send-email-confirmation` native Strapi (no custom code for resend) | Strapi exposes this endpoint out-of-the-box; custom override would duplicate existing behavior — v1.37 | ✓ Good |
          | Idempotent migration seeder with early-return guard | `findMany` unconfirmed first; return early if 0 — safe to re-run multiple times without side effects — v1.37 | ✓ Good |
          | Far-future cron rule `0 0 1 1 *` for one-shot migration | Never auto-runs; must be triggered manually via cron-runner; prevents accidental execution after initial run — v1.37 | ✓ Good |
          | DB migration hard gate before enabling email_confirmation toggle | If existing users are not migrated first, flipping toggle locks out all pre-existing accounts immediately — v1.37 | ✓ Good |

## Current State

**Last shipped:** v1.38 (2026-03-14) — GA4 Analytics Audit & Implementation: complete event coverage (ecommerce bugs, ad discovery, user lifecycle, engagement, blog), 31 Vitest tests, GTM Version 6 published, all events verified in GA4 Realtime
**Also shipped (same session):** v1.39 (2026-03-15) — Unified API Client; v1.40 (2026-03-16) — Shared Authentication Session

**Email Authentication (since v1.37):** `overrideForgotPassword` fully replaces Strapi's built-in — sends branded `reset-password.mjml` routed to website or dashboard based on `context` field in POST body; `DASHBOARD_URL` env var drives dashboard reset URL. `FormRegister.vue` JWT guard redirects to `/registro/confirmar` (no `setToken` call without JWT); `/registro/confirmar` page with resend button + 60s countdown; `FormLogin.vue` (both apps) shows inline resend section for unconfirmed accounts. Idempotent migration seeder (`user-confirmed-migration.ts`) + cron-runner registration; production DB migrated to `confirmed=true`; Strapi Admin Panel `email_confirmation: ON`, `email_confirmation_redirection: https://waldo.click/login`; smoke-test passed (REGV-01, REGV-02, REGV-06).

**2-Step Login (since v1.36):** `verification-code` content type (5 fields, `draftAndPublish: false`); `overrideAuthLocal` wraps `auth.callback` — intercepts `POST /api/auth/local` on credential success to generate code, store record, send `verification-code.mjml` email, return `{ pendingToken, email }` with no JWT; `GET /auth/:provider/callback` (OAuth) bypassed via `ctx.method === "GET"` guard; `POST /api/auth/verify-code` (15-min expiry, max 3 attempts, single-use — issues JWT on success); `POST /api/auth/resend-code` (60s rate limit); daily cleanup cron at 4 AM; dashboard `/auth/verify-code` with `FormVerifyCode.vue` (6-digit input, auto-submit at 6, 60s countdown, `setToken(jwt)` + `fetchUser()`, manager role check, Swal errors); website `/login/verificar` with same `FormVerifyCode.vue` pattern.

**Gift Reservations (since v1.35):** `GET /api/users/authenticated` server-side role filter, returns `{ id, firstName, lastName }` only; `POST /api/ad-reservations/gift` and `POST /api/ad-featured-reservations/gift` — create N reservation records + `gift-reservation.mjml` email (non-fatal); `LightboxGift.vue` controlled lightbox — wired into `reservations/[id].vue` and `featured/[id].vue`.

**AI Article Generation (since v1.34):** `LightBoxArticles.vue` 3-step dashboard lightbox — Tavily news search → Groq prompt edit → article draft creation; `search.store.ts` + `articles.store.ts` (session-only); Groq `llama-3.3-70b-versatile` with `response_format: json_object`; Gemini + DeepSeek + Claude endpoints also available.

**Blog Public Views (since v1.30):** `slug` uid field on Article; 7 blog-specific components; `useArticlesStore`; `blog/index.vue` + `blog/[slug].vue` with full SSR, SEO, Markdown via `marked`.

**GA4 analytics (since v1.27, extended v1.38):** Full event coverage — ecommerce chain (`view_item_list` → `step_view` → `begin_checkout` → `redirect_to_payment` → `purchase`), ad discovery (`viewItemListPublic`, `viewItem`, `search`), user lifecycle (`signUp`, `login`), engagement (`contactSeller`, `generateLead`), content (`articleView`); `pushEvent` flow discriminator with `ad_creation`/`user_engagement`/`user_lifecycle`/`content_engagement` flows; 31 Vitest tests; GTM Version 6 published with `ga4-engagement-events` tag (dynamic `{{Event}}` name covers all engagement/lifecycle/content events); all events verified in GA4 Realtime and Tag Assistant.

**Webpay receipt (since v1.26):** `/pagar/gracias` shows 8-field Webpay receipt via `ResumeOrder.vue`; fetches by `order.documentId`.

## Known Issues / Tech Debt

- **Dashboard "Recuperar contraseña" reCAPTCHA bug:** `FormForgotPassword.vue` in dashboard does not send reCAPTCHA token — form submits without it. Pre-existing bug identified during v1.37 smoke testing. Needs investigation (reCAPTCHA middleware vs. controller interception).

## Validated Requirements (v1.38)

- ✓ GA4 purchase events report real revenue (Strapi biginteger `Number()` coercion) — v1.38
- ✓ GA4 purchase `item_id` shows `order.documentId` (not empty string) — v1.38
- ✓ Free ad creation tracked as `purchase` event with `value: 0` in GA4 — v1.38
- ✓ `view_item_list` event fires on `/anuncios` page load; `search` event fires on keyword/commune filter change — v1.38
- ✓ `view_item` event fires on `/anuncios/[slug]` with `item_id`, `item_name`, `price`, `item_category`; navigating between ads fires distinct events — v1.38
- ✓ `contact` (email/phone), `generate_lead`, `sign_up`, `login` (email/google), `article_view` events fire at correct trigger points — v1.38
- ✓ GTM Version 6 published: `ga4-engagement-events` tag covers all engagement/lifecycle/content events with dynamic `{{Event}}` name — v1.38

## Validated Requirements (v1.37)

- ✓ `overrideForgotPassword` sends branded MJML password reset email with context routing (website vs. dashboard) — v1.37
- ✓ `email_confirmation_redirection` set to `https://waldo.click/login`; email_confirmation toggle ON in production — v1.37
- ✓ New form registrations redirect to `/registro/confirmar`; cannot log in until confirmation link clicked — v1.37
- ✓ Google OAuth registration bypasses email confirmation gate — v1.37
- ✓ All pre-existing users migrated to `confirmed=true`; zero lockout risk — v1.37
- ✓ `FormLogin.vue` (both apps) shows inline resend section for unconfirmed accounts instead of generic Swal — v1.37
- ✓ Verification email copy corrected: "15 minutos" (was "5 minutos") — v1.37

## Future Requirements

### Testing (next dedicated milestone)

- **TEST-01**: Composables (`useRut`, `useSanitize`, `useSlugify`, `useImageProxy`) tienen tests unitarios con Vitest
- **TEST-02**: El componente `AdsTable.vue` tiene tests de comportamiento (renderizado, filtros, paginación)
- **TEST-03**: Los middlewares `guard.global.ts` y `dev.global.ts` tienen tests de integración
- **TEST-04**: Cobertura mínima configurada (>70% en composables y stores)

### Additional Consolidation (prerequisites now met after v1.1)

- **COMP-05**: Consolidar Reservations*/Featured* una vez que tengan store keys dedicados y estrategias de fetch alineadas
- **COMP-06**: `ChartSales.vue` soporta filtros por rango de fechas usando el endpoint de agregación

## Current Milestone: v1.40 Shared Authentication Session

**Goal:** Compartir la cookie JWT entre `www.waldo.click` y `dashboard.waldo.click` (y sus equivalentes de staging) para que un manager que se autentica en una app quede automáticamente autenticado en la otra — sin doble login.

**Target features:**
- Cookie `waldo_jwt` emitida con `domain` configurable por entorno (`COOKIE_DOMAIN` env var)
- Login en website con role `manager` → sesión activa en dashboard automáticamente
- Login en dashboard → sesión activa en website automáticamente
- Logout global: borrar la cookie compartida cierra la sesión en ambas apps
- Guard del dashboard (`guard.global.ts`) preserva comportamiento actual — expulsa roles non-manager

---
*Last updated: 2026-03-18 after v1.38 milestone archived*
