---
phase: 08-publico-anuncios-perfil
plan: 02
subsystem: website-public
tags: [ad-detail, contact-reveal, masking, sticky-sidebar, restyle, redesign]
requires:
  - sanitizeAdForPublic masked email/phone/whatsapp + has_* flags (08-04)
  - GET /ads/:documentId/reveal/{email,phone,whatsapp} reveal endpoints (08-04)
  - CardAnnouncement restyled (08-01) for related ads
provides:
  - restyled ad interior (/anuncios/[slug]) hero + body + sticky sidebar
  - logged-IN masked contact card with per-channel eye-reveal + WhatsApp + Call
  - logged-OUT "Datos de contacto protegidos" gate
affects:
  - ReminderDefault (shared) — restyled to the contact gate, also used by SidebarProfile (08-03)
  - ShareDefault (shared) — restyled to the compartir card (LinkedIn dropped to match mockup)
  - GalleryDefault — gains a condition prop for the gallery chip
tech-stack:
  added: []
  patterns:
    - "per-channel reveal: each handler builds its own ads/:id/reveal/<channel> path (channels stay explicit) + GA4 contactSeller, no client-side contact POST"
    - "has_X || X render gating — keeps managers (masking-bypass, no has_* flags) from an empty contact card"
    - "reveal records the ad-contact server-side; the old duplicate POST /ads/:id/contact is removed"
key-files:
  created: []
  modified:
    - apps/website/app/components/AdSingle.vue
    - apps/website/app/components/HeroAnnouncement.vue
    - apps/website/app/components/GalleryDefault.vue
    - apps/website/app/components/ReminderDefault.vue
    - apps/website/app/components/ShareDefault.vue
    - apps/website/app/pages/anuncios/[slug].vue
    - apps/website/app/scss/components/_announcement.scss
    - apps/website/app/scss/components/_hero.scss
    - apps/website/app/scss/components/_gallery.scss
    - apps/website/app/scss/components/_reminder.scss
    - apps/website/app/scss/components/_share.scss
decisions:
  - "has_X || X gating (not has_X alone) so a manager seller — whose findBySlug payload bypasses masking and carries no has_* flags — still renders a full contact card (matches CLAUDE.md 'no excluir managers')"
  - "Per-channel reveal handlers (revealEmail/revealPhone/openWhatsapp/openCall) each hold their own reveal/<channel> literal — DRY only in the response extractor — so all three channels are explicit and grep-verifiable"
  - "ReminderDefault links to routes login + registro (LinkLogin opened a lightbox; the mockup gate uses two full-width CTAs)"
  - "ShareDefault dropped LinkedIn to match the mockup compartir card (FB / X / WhatsApp + copy-link)"
  - "HeroAnnouncement QR replaced by the mockup 'Volver a resultados' button; hero gains a published prop (publishedAt||createdAt) for the meta row; views omitted (no view count on the payload — scope guard)"
metrics:
  duration: "~55m"
  tasks: 3
  completed: 2026-06-18
---

# Phase 8 Plan 02: Ad Interior Restyle + Masked Contact Reveal Summary

The public ad interior (`/anuncios/[slug]`) restyled to the v1.47 "Detalle de producto" mockup — breadcrumb hero, framed gallery + Acerca/Ubicación/Especificación left column, and a sticky three-card sidebar (precio / vendedor-contacto / compartir) — with the user-approved obfuscated-contact model: logged-IN email/phone render from the masked payload and reveal the real value per-channel on the eye click via the 08-04 reveal endpoints (which record the contact server-side), plus WhatsApp (wa.me) and Call (tel:) reveal-then-open; logged-OUT shows the "Datos de contacto protegidos" gate with no contact data.

## What was built

### Task 1 — detail hero (commit 5d00aab4)
`HeroAnnouncement` rewritten to the mockup breadcrumb header: Waldo › Anuncios › {categoría} › {título} breadcrumb (chevron separators, $muted links, $ink current crumb), Poppins 800 title (clamp 30–44px), meta row (category pill with color dot + "Publicado {fecha}" clock icon), and a "Volver a resultados" button (replaces the old QR). Light category-tinted bg + bottom $line border; 104px top padding clears the 06-02 headroom header. `[slug].vue` feeds a new `published` prop from `publishedAt || createdAt`. Views omitted — no view count on the payload (scope guard, no new fetch). Only `&--announcement` in `_hero.scss` touched.

### Task 2 — detail body left column (commit e81aaa4b)
- **Gallery** (`GalleryDefault` + `_gallery.scss`): main image in a 16/10 framed box (1px $line, 4px radius, $cream bg) with the "Ampliar" badge (top-left), photos-count badge (bottom-left), and the condition chip (top-right, new `condition` prop); thumbnails row restyled. Lightbox behavior unchanged.
- **Acerca**: Poppins 800 24px heading + $ink2 1.65 body, max-width 640px; keeps `v-html="sanitizeRich(...)"`.
- **Ubicación + Especificación técnica**: flat 2-col label/value grid (label 12px $muted 600, value 15.5px $ink 700, "No especificado" italic $silver when empty). Replaced the CardInfo rows; Dirección is an amber-underlined Google Maps link. The `--single` container is now a CSS grid `minmax(0,1fr) 372px`. Only the `.announcement--single` body section of `_announcement.scss` touched.

### Task 3 — sticky sidebar + masked contact reveal (commit 8ef7b5dd)
- **Sidebar**: sticky (top 94px), 16px gap, three #fff/$line/4px cards.
- **Precio card**: PRECIO eyebrow + Poppins 800 30px price + "+ IVA" + the existing converted-price/USD tooltip restyled.
- **Vendedor/contacto card — logged-IN**: amber-initials avatar, name, PRO badge (`pro_status === "active"`), "Sin verificar" outline chip (no verified field on the payload), "Ver perfil y todos sus avisos →" link to `/{username}`. Email + Phone rows show the MASKED payload value (08-04) with a 36px eye button. Click → `GET ads/:documentId/reveal/{email|phone}` → real value displayed + `navigator.clipboard.writeText` + green check for 1.5s (eye → spinner → check). Helper line "Datos protegidos contra robots · se revelan al copiarlos o al contactar." WhatsApp button (only when `has_whatsapp || whatsapp`) → `reveal/whatsapp` → `wa.me/<digits>`; Call button (only when `has_phone || phone`) → `reveal/phone` → `tel:` (reuses an already-revealed value). Every click still fires GA4 `contactSeller(type)`; the duplicate `POST /ads/:id/contact` is removed (reveal records server-side).
- **Vendedor/contacto card — logged-OUT**: `ReminderDefault` restyled to the gate — lock icon in a $cream circle, "Datos de contacto protegidos" title, $ink2 copy, amber "Iniciar sesión" CTA (→ login) + outline "Crear cuenta gratis" CTA (→ registro). No contact data, no masked values.
- **Compartir card**: `ShareDefault` restyled to the mockup card — "Compartir aviso" label + FB / X / WhatsApp + copy-link 34px $cream tiles (copy shows a green check on success).

## Verification

### Automated — PASS
- `vue-tsc --noEmit` clean on all touched files (HeroAnnouncement, AdSingle, GalleryDefault, ReminderDefault, ShareDefault, [slug].vue, all SCSS).
- Grep gate (per plan Task 3 verify):
  - `grep -c "reveal/" AdSingle.vue` → **4** (≥3): email, phone (reveal + Call), whatsapp; distinct channels `reveal/email`, `reveal/phone`, `reveal/whatsapp` all present.
  - `grep -E "ads/.*/contact\b" AdSingle.vue` → **no match** (old POST path removed).
  - `grep -c "contactSeller" AdSingle.vue` → **6** (≥2): GA4 still fires on reveal/WhatsApp/Call.
- `_variables.scss` unchanged (no diff); `_card.scss` and the `.announcement--archive` section (08-01) untouched.

### Visual — PASS WITH CAVEATS (screenshot → Read → compare → fix loop, desktop 1440 + mobile 390)

> **Two states could NOT be visually verified with the available resources (not a regression — a data/token limitation):**
> 1. **The literal masked-bullet email/phone appearance.** Masking is keyed to the *viewer's* role (`controllers/ad.ts:942` — managers get the full unmasked ad). The only available JWT (id=2) is a **manager**, so logged-IN screenshots show the REAL email/phone, not bullets. The masked path is a trivial render of the payload string in a monospace span; it is Jest-tested in 08-04. **To screenshot the true masked state, a non-manager JWT is required** (the payload is fetched SSR via `useAsyncData(server:true)`, so Playwright cannot rewrite it client-side).
> 2. **The WhatsApp button.** No seller across all 30 catalog ads has a non-null `whatsapp` value, so the amber "Escribir por WhatsApp" button never renders in the available data. The gating (`has_whatsapp || whatsapp`) and the `reveal/whatsapp → wa.me` handler are present and typecheck-clean, but were not exercised on screen. Needs a seller with a whatsapp value to verify visually.

Real ad used: `george-woodard-1774814097210` (seller has `pro_status:active` → exercises the PRO badge).
- **Hero**: `08-02-hero-{desktop,mobile}.png` — breadcrumb + Poppins title + meta + Volver button + headroom clearance match the mockup.
- **Body**: `08-02-body-{desktop,mobile}.png` + `08-02-body-crop.png` — gallery frame/badges/condition chip, Acerca, Ubicación grid, Especificación grid match the DC source (~800–853).
- **Logged-OUT sidebar**: `08-02-side-out-{desktop,mobile}.png` + `08-02-side-out-crop.png` — precio card + "Datos de contacto protegidos" gate + compartir card; confirmed NO email/phone/WhatsApp/Call and NO masked values.
- **Logged-IN sidebar**: `08-02-side-in-crop.png` + `08-02-card-in.png` + `08-02-side-in-mobile.png` — seller row (GB avatar, PRO, Sin verificar, Ver perfil link), email/phone rows + eye buttons, note, Call button. (No WhatsApp button — this seller has no whatsapp; correct gating.)
- **Reveal interaction**: `08-02-reveal-check.png` — clicking the email eye fires `GET ads/krgoersgotkziko9sjvyr2u3/reveal/email` → **200** (captured via Playwright network listener) → the value is shown and the button flips to the green check (copied) state, while the phone row stays masked-with-eye. **Reveal-endpoint integration confirmed end-to-end.**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Correctness] `has_X || X` contact-row gating (not `has_X` alone)**
- **Found during:** Task 0 (payload verification before building).
- **Issue:** The plan/mockup assume a regular authenticated user receives masked email/phone + `has_email/has_phone/has_whatsapp` flags. The provided test JWT (id=2) is a **manager**; `findBySlug` returns the manager the FULL unmasked ad (controller bypass, confirmed at `controllers/ad.ts:942`), so `has_*` are absent. Gating rows/buttons purely on `has_*` would give every manager an empty contact card — contradicting CLAUDE.md "no excluir managers" and making Task 3 unverifiable with the supplied token.
- **Fix:** gate each channel on `has_X || X` (flag true OR value present). Regular user → masked value via flag; manager → real value via presence. Verified that `sanitizeAdForPublic` masks unconditionally for non-managers, so the regular-user contract is intact.
- **Files:** `apps/website/app/components/AdSingle.vue` (`hasEmail`/`hasPhone`/`hasWhatsapp`). **Commit:** 8ef7b5dd.

### Scope notes (mockup translation, not behavioral deviations)
- `HeroAnnouncement` QR replaced by the mockup "Volver a resultados" button (the mockup hero has no QR).
- `ShareDefault` dropped the LinkedIn share to match the mockup (FB / X / WhatsApp + copy).
- `ReminderDefault` now links to `login`/`registro` routes (was a `<LinkLogin />` lightbox) — required for the gate's two CTAs. It is also consumed by `SidebarProfile` (08-03) in the same logged-out gate context, which now inherits the restyled gate.

## Authentication Gates
None — the provided JWT authenticated cleanly; all reveal calls returned 200 through the proxy.

## Known stub-relevant note
The "Verificado/Sin verificar" state always renders "Sin verificar" because the user payload exposes no verified flag. This is intentional per the plan ("omit Verificado if no data, render the Sin verificar outline pill otherwise") — not a stub blocking the plan's goal. The optional "Anunciante verificado por Waldo" line in the logged-OUT gate is omitted for the same reason (no verified flag, no new fetch).

## Deferred Issues (logged to deferred-items.md — out of scope)

- **HIGH: the Nuxt proxy caches reveal PII and serves it to anonymous callers.** Confirmed root cause (NOT a backend gap): a direct anonymous call to Strapi `:1337/api/ads/:id/reveal/email` correctly returns **401**, but the Nuxt proxy `:3000` returns **200** with the real email and `x-cache: HIT` / `x-cache-middleware: active` — it cached a prior authenticated reveal (response carries `cache-control: no-store, s-maxage=14400`, which the proxy cache ignores) and now serves the real PII to anyone for ~4h. This defeats the entire 08-04 anti-scraping model. **Scope:** Nuxt proxy cache middleware in `apps/website` (relates to open MEMORY item `project_proxy_cache_headers`), NOT 08-02 component code and NOT the Strapi reveal handlers. **08-02 impact:** none on the component (reveals only fire from the logged-IN block), but the cached endpoint is reachable by any direct caller. Recommended fix: exclude `**/reveal/**` (and per-viewer/PII routes) from the proxy cache, or honor the upstream `no-store`.

## Commits
- `5d00aab4` — feat(08-02): restyle detail hero to mockup breadcrumb header
- `e81aaa4b` — feat(08-02): restyle detail body left column to mockup
- `8ef7b5dd` — feat(08-02): restyle sticky sidebar + wire masked contact reveal

## Self-Check: PASSED

All 10 modified files exist on disk; all three commit hashes (5d00aab4, e81aaa4b, 8ef7b5dd) present in git history.
