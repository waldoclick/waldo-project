# 05-02 SUMMARY — Panel overview

**Status:** Complete (visually verified) — one noted deviation
**Requirement:** ACC-PANEL

## What was done
- Rebuilt `AccountMain.vue` to the mockup Panel (design/account.dc.html 78-139): eyebrow "Panel", greeting "Hola, {firstname} 👋", intro, 3 KPI cards, "Necesita tu atención", dark packs upsell. Uses `useAsyncData('account-panel-counts', loadUserAdCounts)`.
- KPIs: Vistas totales / Contactos recibidos = placeholder 0 (TODO 05-09 wire /ads/me aggregation); Anuncios activos = real `counts.published` with sub "de {total} publicados".
- Attention: "Todo al día" success card when no rejected; else a summary row when rejected > 0.
- Added `.account--main` Panel styles to `_account.scss` (new tokens; KPI cards, attention rows, dark upsell). Old `&--main` (title/profile/announcements/shortcuts) removed (subtractive).

## Verification (visual loop)
- vue-tsc clean. Screenshot of `/cuenta/` (logged-in): 3 KPIs (42 active / 88 total real), attention block, upsell — matches mockup. `_variables.scss` unchanged; no static inline styles.

## Deviation (flagged)
- "Necesita tu atención" renders a single SUMMARY row ("Tienes N anuncios rechazados") instead of one row per ad as in the mockup. Avoids loading the full rejected-ads list in the Panel. Can be expanded to per-ad rows if "idéntico" requires it (would load rejected ad list + category icons).

## Commit
- (this) feat(05-02): redesign account Panel
