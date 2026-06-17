# Account Area — Deep Audit
Date: 2026-06-17 | Branch: feat/redesign-auth

---

## SECTION A — VISUAL DEFECTS (vs mockup `design/account.dc.html` + `design/UserMenu.dc.html`)

---

### V-01 [CRITICAL] — HeroFake band: visible 90px dead-space band below header on every account page

**Component/File:** `apps/website/app/layouts/account.vue` line 5; `apps/website/app/components/HeroFake.vue`; `apps/website/app/scss/components/_hero.scss` lines 8-10

**What's wrong:** `<HeroFake />` is rendered inside the account layout. The component is `<section class="hero hero--fake"></section>` — a visually empty section with `padding-top: 40px` that creates a 90px tall blank gap between the header and the sidebar/main content area on every single `/cuenta/*` page. Confirmed visually: `getBoundingClientRect()` returns `height: 90` at `y: 71`.

**Mockup correct value:** The mockup (`account.dc.html` line 39) starts the two-column container (`max-width:1200px`) immediately after the header — zero spacer. The `40px` top-padding is on the `<aside>` (`padding:30px 0 40px`) and `<main>` (`padding:40px 0 96px`) elements, not a separate blank section.

**Fix:** Remove `<HeroFake />` and its import from `account.vue`. The layout's `&__content` already has `padding: 40px 0 96px` and the sidebar has `padding: 30px 0 40px`, so vertical rhythm is already correct without the spacer.

---

### V-02 [CRITICAL] — Sidebar location shows only commune name; mockup shows "Commune · Region"

**Component/File:** `apps/website/app/components/SidebarAccount.vue` lines 75-78

**What's wrong:** `getUbication` returns only `user.value.commune.name` (e.g. "Lumaco"). The mockup (`account.dc.html` line 46) shows `"Valdivia · Región de Los Ríos"` — both commune and region name separated by `·`. Confirmed visually: sidebar shows "Lumaco" with no region.

**Mockup correct value:** `{{ commune.name }} · {{ commune.region.name }}`

**Fix:**
```ts
return `${user.value.commune.name} · ${user.value.commune.region.name}`;
```

---

### V-03 [HIGH] — Page body background is charcoal (#313338) instead of `#FAF9F7`

**Component/File:** `apps/website/app/scss/components/_layout.scss` line 55; `apps/website/app/scss/abstracts/_variables.scss`

**What's wrong:** `layout--account` sets `background-color: $white` (#ffffff), and the `<body>` inherits `background-color: rgb(49,51,56)` — which is `$charcoal`. On the account layout, because the two-column container has `max-width: 1200px` and content doesn't extend to full viewport width at large screens, the charcoal body color bleeds through on both sides of the content area.

**Mockup correct value:** Mockup wraps everything in a `background:#FAF9F7` outer div. The account page background should be a warm off-white `#FAF9F7` (or at minimum `$cultured`/`$cream`). Currently `#FAF9F7` is not defined as a token.

**Fix:** Add `$warm_white: #faf9f7;` to `_variables.scss`. Set `background-color: $warm_white` on `body` or on the `.layout--account` root div (extending it to full viewport via `min-height: 100vh`). Alternative: set `background: $cream` on `.layout--account` which is close enough.

---

### V-04 [HIGH] — MenuUser trigger button: deviates from `UserMenu.dc.html` design

**Component/File:** `apps/website/app/components/MenuUser.vue` lines 3-25; `apps/website/app/scss/components/_menu.scss`

**What's wrong (vs `design/UserMenu.dc.html` line 15):**
1. The mockup button has a **circle avatar** (34×34px, rounded `50%`, amber background, initials "GB") as the leftmost element. The implementation uses `<AvatarDefault />` which renders the Strapi avatar or a fallback — initials are not always "GB"-style circle. The avatar element in the mockup is always a crisp amber circle with white initials.
2. The mockup button text layout is `"Hola" (11px muted)` above `"Gabriel" (14px 600)` stacked in a column. Implementation matches this pattern, but confirmed live: actual button is `157×46px` which matches mockup target.
3. The **open dropdown panel** in the mockup is `256px` wide with `border-radius: 4px`, items styled as `font-size:14.5px font-weight:500`, group separators are `height:1px; margin:0 12px` inset lines inside padding `6px`. The implementation renders a full-screen overlay panel (`height: 447px`) that is **not a dropdown** — it's a full-width side drawer covering the entire viewport. The mockup is a compact dropdown anchored below the trigger button.

**Fix:** The `MenuUser` component needs to be restructured to match `UserMenu.dc.html`: a compact anchored dropdown (not a full panel), with item groups separated by inset dividers, logout at bottom.

---

### V-05 [HIGH] — `CardProfileAd`: "N fotos" always plural — grammar wrong for 1 photo

**Component/File:** `apps/website/app/components/CardProfileAd.vue` line 9

**What's wrong:** `{{ photoCount }} fotos` always says "fotos" even when `photoCount === 1` → renders "1 fotos" (grammatically incorrect in Spanish).

**Mockup correct value:** "1 foto", "2 fotos", "3 fotos", etc. (singular/plural)

**Fix:**
```html
{{ photoCount }} {{ photoCount === 1 ? 'foto' : 'fotos' }}
```

---

### V-06 [HIGH] — `CardOrder`: "Concepto" column is hardcoded "Pago Waldo" instead of real order concept

**Component/File:** `apps/website/app/components/CardOrder.vue` line 13

**What's wrong:** The concept cell always renders the string `"Pago Waldo"` regardless of the actual order data. The mockup (`account.dc.html` line 240) shows dynamic concepts like "Pack 30 anuncios", "1 anuncio destacado", "Pack 60 anuncios". The `Order` type in `CardOrder.vue` has no `concept` field.

**Mockup correct value:** The order concept should come from the Strapi order record's description/pack field.

**Fix:**
1. Add a `concept` field to the `Order` interface and to the order fetch in `loadUserOrders`.
2. Replace `<span class="account--orders__row__concept">Pago Waldo</span>` with `{{ order.concept ?? 'Pago Waldo' }}`.
3. Expose the concept from the Strapi `orders/me` endpoint response.

---

### V-07 [MEDIUM] — `AccountOrders`: "Total invertido" card sums only current page, not all orders

**Component/File:** `apps/website/app/components/AccountOrders.vue` lines 98-105

**What's wrong:** `totalInvested` computes `props.orders.reduce(...)` over the current page's orders only (up to 10 rows). As the user pages through orders, the total changes. The mockup implies a lifetime total.

**Mockup correct value:** The Strapi endpoint should return a lifetime total invested in the response metadata, or `AccountOrders` should receive it as a separate prop.

**Fix:** Add a `totalInvestedAll` prop (from a dedicated Strapi aggregate endpoint or from metadata) and use that instead of computing from the page slice.

---

### V-08 [MEDIUM] — `AccountOrders`: "Última compra" shows from current page slice, not true last

**Component/File:** `apps/website/app/components/AccountOrders.vue` lines 106-111

**What's wrong:** `lastPurchase` returns `props.orders[0].createdAt` — the first row on the current page. If the user navigates to page 2, this would show the oldest on page 2, not the actual latest purchase. The sort is `createdAt:desc` which means page 1 first item is the latest, but only if never paged away.

**Fix:** Same approach as V-07 — receive the latest purchase date as metadata from the backend, or always derive it from page 1 via a separate non-paginated metadata call.

---

### V-09 [MEDIUM] — `AccountProfile` "Ver/Editar" toggle: active state is hardcoded, not data-driven

**Component/File:** `apps/website/app/components/AccountProfile.vue` lines 14-26; `apps/website/app/components/AccountEdit.vue` lines 13-23

**What's wrong:** `AccountProfile.vue` always applies `--active` to the "Ver" `NuxtLink` regardless of the actual current route. `AccountEdit.vue` always applies `--active` to "Editar". This works correctly only because each component is used on its own page — but if a component were reused or if active class detection fails (e.g. during client hydration), there would be no route-based active detection. Additionally, since these are `<NuxtLink>` elements, they should use the built-in `exact-active-class` prop instead of a hardcoded `--active` class.

**Fix:** Use `NuxtLink` `exact-active-class="account--profile__toggle__btn--active"` (or `account--edit__toggle__btn--active`) and remove the manual hardcoding:
```html
<NuxtLink to="/cuenta/perfil" exact-active-class="account--profile__toggle__btn--active" class="account--profile__toggle__btn">Ver</NuxtLink>
```

---

### V-10 [MEDIUM] — `AccountMain` greeting has a 👋 emoji in an `<h1>` — a11y and design issue

**Component/File:** `apps/website/app/components/AccountMain.vue` line 5

**What's wrong:** `<h1>Hola, {{ user?.firstname }} 👋</h1>` — the 👋 emoji is in the H1. The mockup (`account.dc.html` line 82) also has this, so it is technically mockup-faithful, however emojis in headings are flagged by screen readers with verbose descriptions. Additionally CLAUDE.md rules explicitly state "Only use emojis if the user explicitly requests it."

**Fix:** Move emoji to a `<span aria-hidden="true">` or remove it from the heading.

---

### V-11 [MEDIUM] — `SidebarAccount`: credits hardcoded to `0`, "+3 gratis" hardcoded label

**Component/File:** `apps/website/app/components/SidebarAccount.vue` lines 46-48, 80-81

**What's wrong:** `const credits = 0;` and `+3 gratis` are placeholder TODO values (`// TODO 05-09: wire real credits`). The credit count in the sidebar always shows `0` and "+3 gratis" regardless of actual user credits. The mockup shows the real credit count.

**Fix:** Wire `credits` to the actual user credits field from the session or a dedicated API endpoint. The "+3 gratis" should either be hidden when there are no free credits or come from user data.

---

### V-12 [LOW] — `AccountPassword`: password strength meter placeholder missing from FormPassword integration

**Component/File:** `apps/website/app/components/AccountPassword.vue`; `design/account.dc.html` lines 445-452

**What's wrong:** The mockup has an inline password strength meter bar below the "Nueva contraseña" input (`{{ pwStrengthMeter }}`). The implementation uses `<FormPassword />` — whether the strength meter is actually rendered depends on `FormPassword`. Visually confirmed: the strength meter is absent in the rendered page (only the inputs and button are visible).

**Fix:** Verify that `FormPassword.vue` includes the strength meter bar. If not, add it — the mockup renders a visual progress bar with color-coded levels.

---

### V-13 [LOW] — `AccountPassword`: both password note and memo rendered simultaneously for external providers

**Component/File:** `apps/website/app/components/AccountPassword.vue` lines 9-21

**What's wrong:** When `isExternalProvider` is `true`, the `<MemoDefault>` is shown AND the `.account--password__note` (at the bottom) is also unconditionally rendered (`v-if` is only on the memo and card — the note has no condition). For Google users, both the memo ("No puedes cambiar tu contraseña…") and the bottom note ("¿Iniciaste sesión con Google?…") render simultaneously, giving duplicate messaging.

**Fix:** Wrap `.account--password__note` in `v-if="!isExternalProvider"`.

---

### V-14 [LOW] — `AccountProfile` preview: no bio/description field rendered below avatar area

**Component/File:** `apps/website/app/components/AccountProfile.vue` (lines 39-98)

**What's wrong:** The mockup (`account.dc.html` line 298) shows `<p>{{ bioView }}</p>` beneath the meta row in the profile preview card (conditionally with `hasBioView`). The `AccountProfile.vue` component's preview body ends at the meta row with no bio text. If the user has a bio, it is never displayed in the profile preview.

**Fix:** Add bio rendering below `.account--profile__preview__meta`:
```html
<p v-if="user.bio" style="margin-top:16px;font-size:14px;line-height:1.6;color:$ink2">{{ user.bio }}</p>
```

---

### V-15 [LOW] — `_layout.scss` double `@use "../abstracts/mixins"` import

**Component/File:** `apps/website/app/scss/components/_layout.scss` lines 1 and 3

**What's wrong:** The mixins file is `@use`-d twice at lines 1 and 3. In Dart Sass, `@use` with the same canonical URL is deduplicated (no compile error) but it's a code quality smell and will trip Codacy duplication checks.

**Fix:** Remove the duplicate `@use "../abstracts/mixins" as *;` at line 3.

---

## SECTION B — API / PERFORMANCE DEFECTS

---

### P-01 [CRITICAL] — N+1: `CardProfileAd.onMounted` fires one `GET /ads/:documentId/stats` per published card

**Component/File:** `apps/website/app/components/CardProfileAd.vue` lines 271-279; `apps/website/app/stores/user.store.ts` lines 184-197

**What's wrong:** Every `CardProfileAd` that has `status === 'published'` fires its own `loadAdStats()` call on `onMounted`. With 10 published ads on the current page, Playwright confirmed **10 individual** `GET /api/ads/:documentId/stats?days=14` requests fire simultaneously on `mis-anuncios` page load. These requests return 403 until Strapi permissions are granted for the stats endpoint.

The per-card stats fetched are `adViews` and `adContacts`, displayed as `"N vistas · N contactos"` in the meta right column. But `AccountMain` (the Panel page) already fetches `loadPanelViewsTotal()` and `loadContactsTotal()` which are aggregate totals — they do not help the card-level display.

**Impact:** N requests per page render where N = number of published ads on the page (up to 50, since `AccountMain` fetches `pageSize: 50` for the panel triage list, which would also trigger 50 card renders if `CardProfileAd` were used there).

**Fix:**
- Embed per-ad `views_count` and `contacts_count` in the list response from Strapi's `ads/actives` endpoint. The service already fetches ad records — aggregate from `ad-view` and `ad-contact` tables there server-side and return them in the list payload.
- Remove the `onMounted` call in `CardProfileAd` entirely.
- Read `ad.views_count` and `ad.contacts_count` directly from the ad prop.

---

### P-02 [CRITICAL] — Panel `loadPanelViewsTotal` and `loadContactsTotal` return 0 — endpoints not authorized in Strapi

**Component/File:** `apps/website/app/stores/user.store.ts` lines 203-220; `apps/strapi/src/api/ad-view/routes/00-ad-view-custom.ts`; `apps/strapi/src/api/ad-contact/routes/00-ad-contact-custom.ts`

**What's wrong:** Live Playwright run confirmed the Panel KPI "Vistas totales" = 0 and "Contactos recibidos" = 0, even though the test user has ads with non-zero views (confirmed by N+1 stats requests returning data on the mis-anuncios page). The `GET /api/ads/me/views-total` and `GET /api/ads/me/contacts-total` endpoints are not granted the `authenticated` permission in the Strapi admin — requests return silently caught errors → defaults `{ total: 0 }`.

**Impact:** The entire Panel KPI row for views and contacts is broken for all users.

**Fix:** In Strapi Admin → Settings → Users & Permissions → Roles → Authenticated → `ad-view` plugin → grant `panelViewsTotal`; → `ad-contact` plugin → grant `contactsTotal`. Document the required permissions in a `PERMISSIONS.md` or `strapi-permissions.md` file so they aren't lost on next Strapi reset.

---

### P-03 [HIGH] — `loadUserAds` uses `populate: "*"` — massive over-fetch on every tab switch

**Component/File:** `apps/website/app/stores/user.store.ts` lines 85-100; `loadUsers` line 29; `loadUser` line 49; `loadUserOrders` line 121

**What's wrong:** Every ad list call sends `populate: "*"` which instructs Strapi to eager-load all relations: `category`, `commune`, `region`, `user`, `gallery`, `ad_reservation`, `details`, `condition`, etc. For the `mis-anuncios` page, only these fields are actually needed: `id`, `documentId`, `title`, `name`, `status`, `slug`, `remaining_days`, `createdAt`, `gallery` (for photo count), `category` (name + color + slug), `featured`, `reason_for_rejection`, `reason_for_ban`. The full `populate: "*"` also pulls in the full user object and all join tables.

`loadUserOrders` also uses `populate: "*"` — orders should only populate `document_response` (for the PDF link).

**Fix:** Replace `populate: "*"` with explicit field lists:
```ts
populate: {
  category: { fields: ['name', 'color', 'slug'] },
  gallery: { fields: ['id', 'url'] },
  commune: { fields: ['name'], populate: { region: { fields: ['name'] } } },
}
```

---

### P-04 [HIGH] — `mis-anuncios` page: `useAsyncData` has no key → duplicate SSR/hydration fetch

**Component/File:** `apps/website/app/pages/cuenta/mis-anuncios.vue` line 81; `apps/website/app/pages/cuenta/mis-ordenes.vue` line 61

**What's wrong:** Both pages call `useAsyncData(async () => { ... })` without a unique key string. CLAUDE.md rule: "useAsyncData keys must be unique per page: `'<page>-<data>'`". Without a key, Nuxt auto-generates one but cannot cache/deduplicate across SSR and hydration, causing a double fetch on initial page load.

**Fix:**
```ts
// mis-anuncios:
await useAsyncData('mis-anuncios-counts', async () => { ... });
// mis-ordenes:
await useAsyncData('mis-ordenes-list', async () => { ... });
```

---

### P-05 [HIGH] — `mis-anuncios` page: `watch + useAsyncData` double-triggers initial load

**Component/File:** `apps/website/app/pages/cuenta/mis-anuncios.vue` lines 77-87

**What's wrong:** The page sets up `watch([currentFilter, currentPage], () => { loadAds(); })` AND calls `loadAds()` inside the `useAsyncData` callback. On initial page load: `useAsyncData` fires (calling `loadAds()`), then the `watch` fires immediately (because `watch` is registered after refs are set). This results in two `loadAds()` calls on page mount. CLAUDE.md rule: "useAsyncData() is the sole correct data-loading trigger in Nuxt pages — never pair a bare `await storeAction()` with `useAsyncData`."

**Fix:** Remove the `watch` and move the entire load logic into `useAsyncData` with a dynamic key:
```ts
const { data } = await useAsyncData(
  () => `mis-anuncios-${currentFilter.value}-${currentPage.value}`,
  () => userStore.loadUserAds(currentFilter.value, { page: currentPage.value, pageSize: 10 }, ['createdAt:desc']),
  { watch: [currentFilter, currentPage] }
);
```

---

### P-06 [HIGH] — Panel `loadUserAds` fetches up to 50 published ads for the triage attention list — then fires no card N+1, but still over-fetches

**Component/File:** `apps/website/app/components/AccountMain.vue` lines 160-163

**What's wrong:** `AccountMain` calls `userStore.loadUserAds("published", { page: 1, pageSize: 50 })` to find ads expiring within 7 days. This fetches 50 full ad records on every panel load, even if only 0-2 are expiring. The `rejected` list also fetches 25 records. Total: up to 75 full ad records (with `populate: "*"`) fetched just to populate the "Necesita tu atención" section which typically shows 0-5 rows.

**Fix:** Add a dedicated Strapi endpoint `GET /api/ads/me/triage` that returns only the expiring/rejected ads in a single query, with minimal field projection. Alternatively, extend the existing `ads/count` endpoint to also return triage-relevant ads.

---

### P-07 [MEDIUM] — `StatsAdModal` makes a duplicate `loadAdStats` call — once from `CardProfileAd.onMounted` and once when modal opens

**Component/File:** `apps/website/app/components/StatsAdModal.vue` lines 140-153; `apps/website/app/components/CardProfileAd.vue` lines 271-279

**What's wrong:** `CardProfileAd.onMounted` calls `userStore.loadAdStats(documentId)` to populate `adViews`/`adContacts` in the meta right column. Then when the user clicks "Estadísticas" to open `StatsAdModal`, the modal's `watch` on `[open, ad.documentId]` fires again and calls `userStore.loadAdStats(documentId, 14)` a second time for the same ad. There is no caching between these two calls — the second call is always a fresh network request.

**Fix:** Once P-01 is resolved (embedding stats in the list response), the card no longer needs `onMounted` stats. The modal's `watch` fetch is appropriate for the full 14-day series. If P-01 stays deferred, add a simple in-memory cache in `user.store.ts` for stats keyed by `documentId`.

---

### P-08 [MEDIUM] — `loadUsers` and `loadUser` both use `populate: "*"` — unused in account area but creates risk

**Component/File:** `apps/website/app/stores/user.store.ts` lines 23-60

**What's wrong:** `loadUsers()` (admin only) and `loadUser()` (public profile view) both use `populate: "*"`. For the account area, neither is called — but `loadUser()` is called from profile public pages with an unbounded wildcard populate which pulls user → commune → region → ads → all relations. The response payload for a single user profile fetch can be very large.

**Fix:** Scope `loadUser` populate to what the profile page actually uses: `commune.region`, `avatar`, `cover`. No need for full wildcard.

---

### P-09 [MEDIUM] — `loadUserOrders` passes `populate: "*"` — over-fetches order relations including full Webpay payment data

**Component/File:** `apps/website/app/stores/user.store.ts` line 121

**What's wrong:** Orders are fetched with `populate: "*"` which eagerly loads all nested relations including `document_response` (large JSON blob), `ad` (full ad record), `user` (full user record). The account orders page only needs: `id`, `amount`, `is_invoice`, `createdAt`, `document_response.return.enlaces.dte_pdf`.

**Fix:**
```ts
populate: {
  document_response: true,
}
```
And remove the ad/user populate entirely for the orders list.

---

### P-10 [LOW] — `mis-anuncios` page: tab count calls `loadUserAdCounts()` AND `loadAds()` serially inside a single `useAsyncData`, blocking render

**Component/File:** `apps/website/app/pages/cuenta/mis-anuncios.vue` lines 81-87

**What's wrong:** The `useAsyncData` callback calls `loadUserAdCounts()` first, awaits it, updates the tabs, then calls `loadAds()` serially. These two requests are independent and could run in parallel via `Promise.all`. The serialization adds one round-trip of latency before any ads appear.

**Fix:**
```ts
const [counts, adsResult] = await Promise.all([
  userStore.loadUserAdCounts(),
  userStore.loadUserAds(currentFilter.value, { page: 1, pageSize: 10 }, ['createdAt:desc'])
]);
```

---

### P-11 [LOW] — `AccountMain` panel: 5 parallel promises are good, but `loadUserAds("published", pageSize: 50)` has no server-side `remaining_days` filter

**Component/File:** `apps/website/app/components/AccountMain.vue` lines 160-163; `apps/strapi/src/api/ad/services/ad.ts`

**What's wrong:** To find expiring ads, `AccountMain` fetches 50 published ads and filters client-side: `.filter(a => a.remaining_days > 0 && a.remaining_days <= 7)`. Strapi already has `remaining_days` as a filterable field. If the user has >50 active ads, some expiring ads in positions 51+ would be silently missed.

**Fix:** Pass a server-side filter to `loadUserAds`:
```ts
userStore.loadUserAds("published", { page: 1, pageSize: 25 }, [], {
  remaining_days: { $lte: 7, $gt: 0 }
})
```
This requires extending `loadUserAds` to accept a `filters` parameter, or adding a dedicated triage endpoint (see P-06).

---

### P-12 [LOW] — `CardProfileAd.handleRepublish` uses numeric `ad.category.id`, `ad.commune.id`, `ad.condition.id` — breaks on Strapi v5 which uses `documentId` for writes

**Component/File:** `apps/website/app/components/CardProfileAd.vue` lines 340-357

**What's wrong:** The republish flow calls `adStore.updateCategory(ad.category.id)`, `adStore.updateCommune(ad.commune.id)`, `adStore.updateCondition(ad.condition.id)` using numeric `id` fields. CLAUDE.md rule: "Prefer `documentId` over numeric `id` for content updates and deletes in Strapi v5." If the ad store later submits these as documentIds, the publish request will fail.

**Fix:** Verify that `adStore.updateCategory`, `updateCommune`, `updateCondition` accept either numeric ids or documentIds based on what the Strapi create endpoint expects. If they expect documentIds, the republish flow must read `ad.category.documentId` etc.

---

## Summary Table

| ID | Severity | Category | One-line description |
|----|----------|----------|----------------------|
| V-01 | CRITICAL | Visual | HeroFake 90px blank band on every account page |
| V-02 | CRITICAL | Visual | Sidebar location shows only commune, not "Commune · Region" |
| P-01 | CRITICAL | Performance | N+1: one stats request per published card on mis-anuncios |
| P-02 | CRITICAL | API | views-total and contacts-total endpoints 403 → KPIs always 0 |
| V-03 | HIGH | Visual | Body background bleeds charcoal instead of warm off-white |
| V-04 | HIGH | Visual | MenuUser dropdown is full-screen drawer, not compact dropdown per mockup |
| V-05 | HIGH | Visual | "1 fotos" grammar bug — singular not handled |
| V-06 | HIGH | Visual | CardOrder concept column hardcoded "Pago Waldo" not real data |
| P-03 | HIGH | Performance | populate:"*" on all ad/order list fetches — massive over-fetch |
| P-04 | HIGH | Performance | useAsyncData missing keys on mis-anuncios and mis-ordenes |
| P-05 | HIGH | Performance | watch + useAsyncData double-triggers initial load on mis-anuncios |
| P-06 | HIGH | Performance | Panel fetches 75 full ad records to find 0-5 triage items |
| V-07 | MEDIUM | Visual/Logic | totalInvested sums only current page, not lifetime total |
| V-08 | MEDIUM | Visual/Logic | lastPurchase from current page first row, not true last |
| V-09 | MEDIUM | Visual | Ver/Editar toggle active state hardcoded, not route-driven |
| V-10 | MEDIUM | Visual/A11y | 👋 emoji raw in H1 heading |
| V-11 | MEDIUM | Visual | Credits count hardcoded 0, "+3 gratis" unconnected to data |
| P-07 | MEDIUM | Performance | StatsAdModal re-fetches stats already fetched by card onMounted |
| P-08 | MEDIUM | Performance | loadUser uses populate:"*" for public profile page |
| P-09 | MEDIUM | Performance | loadUserOrders uses populate:"*" pulling full order relations |
| V-12 | LOW | Visual | Password strength meter missing in rendered FormPassword |
| V-13 | LOW | Visual | Both password memo AND note shown simultaneously for ext. providers |
| V-14 | LOW | Visual | Profile preview missing bio text below meta row |
| V-15 | LOW | Code Quality | _layout.scss duplicate @use mixins import |
| P-10 | LOW | Performance | loadUserAdCounts + loadAds called serially, could be parallel |
| P-11 | LOW | Performance | Expiring ads filtered client-side from 50-item fetch, misses >50 |
| P-12 | LOW | Logic | Republish flow uses numeric id not documentId for Strapi v5 |
