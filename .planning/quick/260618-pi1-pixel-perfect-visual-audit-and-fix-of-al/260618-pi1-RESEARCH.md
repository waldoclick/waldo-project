# Pixel-Perfect Visual Audit — Public Site vs. Mockup

**Researched:** 2026-06-18
**Domain:** Visual QA / SCSS / Nuxt 4 website
**Confidence:** HIGH — every finding is backed by screenshot evidence + SCSS/Vue source comparison + mockup inline values

---

## Summary

Full audit of 8 public views at 1440×900 against `apps/design/index.dc.html`. All screenshots were taken fresh with overlays dismissed. Every discrepancy is cited with (a) mockup source line, (b) implementation file + line, (c) visual evidence.

**Two categories of issues exist:** genuine regressions that must be fixed, and deliberate decisions already recorded in STATE.md that must NOT be re-opened.

**Primary recommendation:** Focus fixes on (1) the 4th duplicate pack card caused by corrupted DB data, (2) the legal-header top-padding 44px short of mockup (fidelity gap on the cream header band), (3) the `HighlightsDefault` ("Para comprar") section missing vertical padding. All other issues are LOW severity styling tweaks.

**Component mapping note (important for implementers):**
- `HighlightsDefault.vue` = "Para comprar" section (white bg, cards with borders) — lines 456–498 in mockup
- `HowtoDefault.vue` = "Para vender / Vendedores" section (cream bg, image + badge steps) — lines 501–531 in mockup

---

## Deliberate Non-Issues (do NOT re-open)

These look like bugs but are documented decisions:

| Item | Decision (STATE.md line) |
|------|--------------------------|
| `/anuncios` has no left filter sidebar | Deliberately omitted — mockup sidebar had "no app behavior" (STATE line 38) |
| Anuncio detail contact card shows locked state | Expected for logged-out users; manager bypass documented (STATE line 39) |
| Repeated tractor images on cards | Seed data, not a defect |

---

## View-by-View Audit

---

### 1. Home (`/`)

**Sections:** hero cream → featured white → categories cream → sell-cta white → blog cream

#### CONFIRMED CORRECT

| Element | Mockup | SCSS | Status |
|---------|--------|------|--------|
| Hero background | `var(--cream)` | `$cream` (`_hero.scss` line 41) | ✓ |
| Hero container padding | `104px 32px 84px` | `104px 32px 84px` (`_hero.scss` line 72) | ✓ |
| Hero grid columns | `1.05fr 0.95fr` | `1.05fr 0.95fr` (`_hero.scss` line 74) | ✓ |
| Search bar amber button | `var(--amber)` | `$amber` (`_hero.scss` line 186) | ✓ |
| Floating card amber plate | `rotate(2.5deg)` | `rotate(2.5deg)` (`_hero.scss` line 235) | ✓ |
| Featured section background | `#fff` | `$white` (`_announcement.scss` line 8) | ✓ |
| Featured section padding | `60px 0 76px` | `60px 0 76px` (`_announcement.scss` line 9) | ✓ |
| Categories section background | `var(--cream)` | `$cream` (`_category.scss` line 7) | ✓ |
| Sell CTA panel background | `$ink` dark | `$ink` (`_sell-cta.scss` line 19) | ✓ |
| Blog section background | `var(--cream)` | `$cream` (`_article.scss` line 9) | ✓ |
| Blog section padding | `80px 0` + border-top | `80px 0` + `border-top: 1px solid $line` (`_article.scss` lines 10-11) | ✓ |

#### ISSUES FOUND

None. Home visual layout matches mockup.

---

### 2. Por qué Waldo (`/por-que-waldo`)

**Sections:** hero cream → highlights white ("Para comprar") → howto cream ("Para vender") → packs white → why-cta cream → faq white

#### CONFIRMED CORRECT

| Element | Mockup | SCSS | Status |
|---------|--------|------|--------|
| Hero background | `var(--cream)` | `$cream` (`_why.scss` line 11) | ✓ |
| Hero container padding | `128px 32px 72px` | `128px 32px 72px` (`_why.scss` line 32) | ✓ |
| Hero title font | `Poppins 800 clamp(34px,4.4vw,52px)` | `clamp(34px, 4.4vw, 52px)` (`_why.scss` line 64) | ✓ |
| Hero CTA buttons amber | `var(--amber)` | `$amber` (`_why.scss` line 100) | ✓ |
| Highlights (Para comprar) background | `#fff` (mockup line 456: `background:#fff`) | No explicit bg on `.highlights--default` → inherits white | ✓ |
| Howto (Para vender) background | `var(--cream)` (mockup line 501: `background:var(--cream)`) | `$cream` (`_howto.scss` line 7) | ✓ |
| Howto steps grid | `repeat(3,1fr)` | `repeat(3, 1fr)` (`_howto.scss` line 45) | ✓ |
| Howto card badge background | `var(--amber)` | `$amber` (`_howto.scss` line 79) | ✓ |
| Packs grid | `repeat(3,1fr)` | `repeat(3, 1fr)` (`_packs.scss` line 45) | ✓ |
| Why CTA panel background | `$ink` + cream section | `background: $cream` (`_why.scss` line 129), panel `$ink` (`_why.scss` line 145) | ✓ |
| Packs section max-width | `1100px` | `max-width: 1100px` (`_packs.scss` line 9) | ✓ |

#### ISSUES FOUND

**CRITICAL — 4th pack card rendering (extra row below the 3-column grid):**
- Mockup: 3 packs (Pack Inicial 15, Pack Pro 30, Pack Máximo 60)
- Implementation: `PacksDefault.vue` filters `item.total_ads > 1` — this removes only the "1 Aviso" pack
- Database has 5 packs (queried `ad_packs` table directly):
  - ID=1: "1 Aviso" / total_ads=1 / $5,990 → filtered out ✓
  - ID=2: "15 Avisos" / total_ads=15 / $69,900 → shown
  - ID=3: "30 Avisos" / total_ads=30 / $119,900 → shown
  - ID=4: "50 Avisos" / total_ads=**60** / $199,900 → shown (data issue: name says 50 but total_ads=60)
  - ID=5: "60 Avisos" / total_ads=60 / $199,900 → shown (duplicate total_ads with ID=4)
- Result: 4 packs render → 4th card overflows onto a new row below the 3-col grid
- Screenshot `v2-why-packs.png` confirms: "15 Avisos / 30 Avisos / 50 Avisos" + orphaned "60 Avisos" card in second row
- **Root cause:** Data integrity issue — ID=4 has `total_ads=60` same as ID=5; whether to keep 3 or 4 packs is a business/content decision
- **Recommendation:** Flag for content/data review. The `repeat(3,1fr)` grid orphans a 4th card — if 4 packs are desired, the grid needs updating too. If 3 packs are desired, remove the duplicate record via Strapi admin or DB.
- **File:** Strapi admin → Pack management; or `apps/strapi/.tmp/data.db` → `ad_packs` table

**MEDIUM — Highlights ("Para comprar") section has no vertical padding:**
- Mockup (index.dc.html lines 456+466): section header `padding: 72px 0 0`, steps `padding: 10px 0 64px` → effective `72px top / 64px bottom`
- SCSS `_highlights.scss`: no `padding` on `.highlights--default` itself — only `__container` uses `@extend .container` (horizontal only), no vertical rhythm
- The section collapses visually against adjacent sections
- **Fix:** Add `padding: 72px 0 64px` to `.highlights--default` in `_highlights.scss`
- **File:** `apps/website/app/scss/components/_highlights.scss`

---

### 3. FAQ (`/preguntas-frecuentes`)

**Sections:** cream header with breadcrumb → white body 2-col (248px sidebar + content)

#### CONFIRMED CORRECT

| Element | Mockup (line 1107-1118) | SCSS | Status |
|---------|------------------------|------|--------|
| Header background | `var(--cream)` | `$cream` (`_layout.scss` line 14) | ✓ |
| Header border-bottom | `1px solid var(--line)` | `1px solid $line` (`_layout.scss` line 15) | ✓ |
| Header glow | `radial-gradient amber` | identical (`_layout.scss` lines 22-29) | ✓ |
| Sidebar width | `248px` | `grid-template-columns: 248px minmax(0, 1fr)` (`_layout.scss` line 100) | ✓ |
| Sidebar sticky top | `top:96px` | `top: 90px` (`_layout.scss` line 112) — minor delta | LOW |
| Content grid gap | `56px` | `56px` (`_layout.scss` line 101) | ✓ |
| Accordion border | `1px solid var(--line)` | implemented in `_accordion.scss` | ✓ |

#### ISSUES FOUND

**MEDIUM — Legal header inner top-padding 44px short of mockup:**
- Mockup (index.dc.html line 1109): `padding: 108px 32px 40px`
- SCSS `_layout.scss` line 36: `padding: 64px 32px 40px`
- Delta: **44px short** on top — the cream header band has less vertical breathing room than the mockup
- Header is `position: sticky` (not fixed) — no physical overlap/collision occurs; this is a fidelity gap in the cream header height
- Screenshots `v2-faq-top.png`, `v2-politicas-top.png`, `v2-contacto-top.png` all show clean spacing below the header bar, confirming no collision — but the cream band is visibly shorter than the mockup
- **Fix:** In `_layout.scss` line 36, change padding from `64px 32px 40px` to `108px 32px 40px`
- **File:** `apps/website/app/scss/components/_layout.scss`, line 36
- **Coverage:** One fix covers all legal pages (FAQ, Políticas, Condiciones, Contacto)

**LOW — Sidebar sticky top delta:**
- Mockup: `top: 96px` | SCSS `_layout.scss` line 112: `top: 90px`
- 6px difference — barely perceptible
- **Fix:** Change `top: 90px` to `top: 96px` in `_layout.scss` line 112

---

### 4. Políticas de privacidad (`/politicas-de-privacidad`)

Same layout shell as FAQ (`.layout--about`).

#### CONFIRMED CORRECT

- Same structure as FAQ — breadcrumb, title, sidebar, accordion content
- Screenshot `v2-politicas-top.png`: renders correctly, sidebar visible with Políticas active state

#### ISSUES FOUND

- **Same MEDIUM issue as FAQ:** `padding: 64px 32px 40px` vs mockup `108px 32px 40px`
- Single fix in `_layout.scss` covers all legal pages

---

### 5. Condiciones de uso (`/condiciones-de-uso`)

Same layout shell as FAQ.

#### CONFIRMED CORRECT

- Screenshot `v2-condiciones-top.png`: renders correctly
- **Same MEDIUM issue applies** (shared SCSS)

---

### 6. Contacto (`/contacto`)

#### CONFIRMED CORRECT

| Element | Mockup (line 1109) | SCSS | Status |
|---------|-------------------|------|--------|
| Header background | `var(--cream)` | `$cream` (via `_layout.scss`) | ✓ |
| Form layout max-width | `max-width:600px` | implemented in contact component | ✓ |
| Form inputs background | `var(--cream)` focus→`#fff` | visible in screenshot | ✓ |
| Input label font | `13px font-weight:600` | visible in screenshot | ✓ |
| Sidebar navigation | 5 links with icons | `v2-contacto-top.png` shows 5 links ✓ | ✓ |

#### ISSUES FOUND

- **Same MEDIUM issue as all legal pages:** header `padding-top: 64px` vs required `108px`

---

### 7. Anuncios (`/anuncios`)

#### CONFIRMED CORRECT

| Element | Mockup (line 639) | SCSS/Vue | Status |
|---------|------------------|----------|--------|
| Hero container padding | `104px 32px 34px` | `padding-top: 104px; padding-bottom: 34px` (`_hero.scss` lines 449-450) | ✓ |
| Hero background | `var(--heroBg)` dynamic | `var(--hero-bg-color, #ffffff)` (`_hero.scss` line 447) | ✓ |
| Toolbar: N anuncios count | Required in spec | "42 anuncios" wired via `:total` prop (STATE line 38) | ✓ |
| Toolbar: sort dropdown | Required | "Ordenar por Destacados" visible in `v2-anuncios-hero.png` | ✓ |
| Toolbar: ubicación filter | Required | "Todas las ubicaciones" selector visible | ✓ |
| Card grid columns | `auto-fill minmax(280px,1fr)` | `repeat(auto-fill, minmax(280px, 1fr))` (`_announcement.scss` line 95) | ✓ |
| NO left sidebar | Deliberately omitted | STATE.md confirmed decision | ✓ |

#### ISSUES FOUND

None. Anuncios layout matches mockup and deliberate decisions.

---

### 8. Anuncio detalle (`/anuncios/[slug]`)

#### CONFIRMED CORRECT

| Element | Mockup (lines 765-969) | SCSS | Status |
|---------|----------------------|------|--------|
| Hero background | `var(--cream)` + border-bottom (mockup line 765) | No explicit bg on `.hero--announcement` — inherits white | See issue below |
| Hero breadcrumb + title | Poppins 800 `clamp(30px,3.4vw,44px)` | implemented (`_hero.scss` line 594) | ✓ |
| Hero "Volver a resultados" button | Yes | `&__back` button visible in `v2-detalle-hero.png` | ✓ |
| Body grid: `1fr 372px` | Yes | `minmax(0, 1fr) 372px` (`_announcement.scss` line 182) | ✓ |
| Body padding | `40px 32px 64px` | `40px 32px 64px` (`_announcement.scss` line 180) | ✓ |
| Sidebar sticky top | `top: 94px` | `top: 94px` (`_announcement.scss` line 296) | ✓ |
| Price card with UF conversion | Yes | visible in `v2-detalle-body.png` | ✓ |
| Gallery with thumbnail strip | Yes | visible in `v2-detalle-body.png` | ✓ |
| Contact card locked (logged out) | "Datos de contacto protegidos" | visible in `v2-detalle-body.png` — shows login/register CTAs | ✓ |
| Related ads section | Yes | `v2-detalle-bottom.png` shows "Anuncios relacionados" with cards | ✓ |

#### ISSUES FOUND

**LOW — Hero announcement background not explicitly cream:**
- Mockup (line 765): `background: var(--cream)` + `border-bottom: 1px solid var(--line)` on the hero section
- SCSS `_hero.scss` for `.hero--announcement`: no explicit `background-color` set — page renders white, not cream
- Screenshot `v2-detalle-hero.png`: hero appears white where mockup shows cream
- **Fix:** Add `background: $cream` to `.hero--announcement` in `_hero.scss`
- **File:** `apps/website/app/scss/components/_hero.scss`, at `.hero--announcement` rule

---

### 9. Footer (global)

#### CONFIRMED CORRECT

| Element | Mockup (lines 1456-1476) | SCSS | Status |
|---------|-------------------------|------|--------|
| Background | `var(--cream)` | `$cream` (`_footer.scss` line 7) | ✓ |
| Border-top | `1px solid var(--line)` | `1px solid $line` (`_footer.scss` line 8) | ✓ |
| Indicators bar items | UF/USD/EUR/UTM/IPC | Rendered from Strapi data | ✓ |
| Indicators gap | `10px 26px` | `gap: 10px 26px` (`_footer.scss` line 21) | ✓ |
| Indicators padding | `13px` | `padding-top: 13px; padding-bottom: 13px` (`_footer.scss` lines 23-24) | ✓ |
| Logo height | `28px` | `height: 28px` (`_footer.scss` line 56) | ✓ |
| Nav link font | `14px weight:500` | `font-size: 14px; font-weight: 500` (`_footer.scss` lines 67-68) | ✓ |
| Copyright margin-left | `auto` | `margin-left: auto` (`_footer.scss` line 79) | ✓ |

**No issues found in footer.**

---

### 10. Global Header

#### CONFIRMED CORRECT (from all screenshots)

- Transparent + `backdrop-filter: blur` ✓
- Amber CTA button "Anunciar ahora" ✓
- 74px height ✓
- "Anuncios / Por qué Waldo / Blog" nav links ✓
- `position: sticky` (not fixed) — content below is always in normal flow

---

## Global Issues

### GLOBAL-1 — Gift popup persistently visible (LOW, UX only)
The "¡Consigue 3 anuncios gratis al registrarte!" toast renders on every page visit for logged-out users and partially overlaps card content on the right side. This is a product/UX decision, not a pure CSS bug.

### GLOBAL-2 — Cookie banner reappears after scroll (LOW, UX only)
The cookie consent banner reappears on scroll or re-render. Not a CSS regression.

---

## Priority Order for Fixes

| Priority | ID | Issue | File | Change |
|----------|-----|-------|------|--------|
| 1 — CRITICAL | PACK-4TH | 4th pack card (data integrity issue) | `ad_packs` DB table | Content/data review: remove duplicate or update packs count |
| 2 — MEDIUM | HIGHLIGHTS-PADDING | "Para comprar" section no vertical padding | `_highlights.scss` | Add `padding: 72px 0 64px` to `.highlights--default` |
| 3 — MEDIUM | LEGAL-PADDING | Legal header cream band 44px shorter than mockup | `_layout.scss` line 36 | `padding: 108px 32px 40px` |
| 4 — LOW | HERO-ANN-BG | Ad detail hero no cream background | `_hero.scss` | Add `background: $cream` to `.hero--announcement` |
| 5 — LOW | SIDEBAR-TOP | Legal sidebar sticky top 90px → 96px | `_layout.scss` line 112 | `top: 96px` |

---

## Not in Scope (out-of-phase)

These views were NOT audited (not implemented or out of scope):
- **Blog list (`/articulos`)** — exists but not part of phase 07/08 visual scope
- **Blog article (`/articulos/[slug]`)** — same
- **Public seller profile** — not implemented
- **Auth pages (login, register, etc.)** — separate phase
- **Account/dashboard** — separate phase

---

## Code Examples for Fixes

### Fix 1: DB Pack Integrity (content/data review — no automatic DELETE)

```sql
-- Query current state:
SELECT id, name, total_ads, price FROM ad_packs ORDER BY total_ads;
-- ID=4: "50 Avisos" / total_ads=60 / $199,900  ← total_ads mislabeled
-- ID=5: "60 Avisos" / total_ads=60 / $199,900  ← duplicate value

-- Option A: Fix ID=4 total_ads to 50 (if keeping 4 packs at 15/30/50/60)
UPDATE ad_packs SET total_ads = 50 WHERE id = 4;
-- Then grid needs to support 4 columns (CSS change too)

-- Option B: Remove ID=5 if only 3 packs are desired (15/30/50 or 15/30/60)
-- Handle via Strapi admin panel, not raw DELETE
```

Run via: `sqlite3 apps/strapi/.tmp/data.db "<SQL>"` (or Strapi admin)

### Fix 2: Highlights Section Padding

```scss
// _highlights.scss — BEFORE
.highlights {
  &--default {
    // no padding — section collapses against neighbors

// AFTER
.highlights {
  &--default {
    padding: 72px 0 64px;
    // mockup line 456: padding:72px 0 0 (header) + line 466: padding:10px 0 64px (steps)
```

### Fix 3: Legal Header Padding

```scss
// _layout.scss line 33-37 — BEFORE
&__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 32px 40px;   // <-- 44px short on top
  position: relative;
}

// AFTER
&__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 108px 32px 40px;  // <-- matches mockup line 1109
  position: relative;
}
```

### Fix 4: Ad Detail Hero Background

```scss
// _hero.scss — in .hero--announcement
&--announcement {
  padding-top: 0;
  border-bottom: 1px solid $line;
  background: $cream;   // ADD THIS — mockup line 765
```

### Fix 5: Legal Sidebar Sticky Top

```scss
// _layout.scss line 111-113 — BEFORE
&__sidebar {
  position: sticky;
  top: 90px;   // <-- 6px off
  align-self: start;
}

// AFTER
&__sidebar {
  position: sticky;
  top: 96px;   // <-- matches mockup line 1124
  align-self: start;
}
```

---

## Sources

### HIGH confidence (direct source verification)
- `apps/design/index.dc.html` — full mockup, lines 1-1476 read
- `apps/website/app/scss/components/_layout.scss` — full file read
- `apps/website/app/scss/components/_hero.scss` — full file read (899 lines)
- `apps/website/app/scss/components/_howto.scss` — full file read
- `apps/website/app/scss/components/_highlights.scss` — full file read
- `apps/website/app/scss/components/_packs.scss` — full file read
- `apps/website/app/scss/components/_why.scss` — full file read
- `apps/website/app/scss/components/_sell-cta.scss` — full file read
- `apps/website/app/scss/components/_article.scss` — full file read
- `apps/website/app/scss/components/_announcement.scss` — lines 1-450 read
- `apps/website/app/scss/components/_footer.scss` — full file read
- `apps/website/app/scss/components/_category.scss` — full file read
- `apps/website/app/components/PacksDefault.vue` — full file read
- `apps/website/app/components/HowtoDefault.vue` — full file read (confirmed = "Para vender" section)
- `apps/website/app/components/HighlightsDefault.vue` — full file read (confirmed = "Para comprar" section)
- `apps/website/app/pages/por-que-waldo.vue` — full file read (confirmed component order)
- `.planning/STATE.md` — sidebar decision confirmed (line 38)
- `apps/strapi/.tmp/data.db` — queried `ad_packs` table directly

### Screenshots taken (1440×900, overlays dismissed)
All at `/tmp/waldo-shots/v2-*.png`:
- `v2-home-top/featured/cats/sellcta/blog` — home all sections
- `v2-why-hero/howto/vendedores/packs/faq-cta` — por qué waldo all sections
- `v2-faq-top/content` — FAQ page
- `v2-politicas-top/body` — políticas
- `v2-condiciones-top/body` — condiciones
- `v2-contacto-top/form` — contacto
- `v2-anuncios-hero/toolbar/grid` — anuncios listing
- `v2-detalle-hero/body/bottom` — ad detail page
- `v2-footer` — footer via home page
