# Quick Task 260619-pr7: Audit-and-fix 5 legal/about views vs maqueta + remove apps/design — Summary

Audit (screenshot → diff vs maqueta → fix only real diffs → re-verify) of the 5 legal/about
public views (faq, privacidad, condiciones, contacto, sitemap), then removal of the unused
`apps/design` workspace. Phase 07 (07-02/07-03) had already migrated these views; this task
verified each against the maqueta with clean screenshots (promo/cookie overlays hard-hidden)
and fixed the measurable divergences found.

Screenshots in `reference/after/`. Tooling: a dedicated `pr7-shot.cjs` (repo root, deleted at
end / kept out of commits) was used to hard-hide `.lightbox--register` + `.lightbox--site-checker`
overlays that the shared `shot.cjs` did not dismiss, otherwise the contact block and accordion
open-state were occluded.

---

## Per-view results

### Task 1 — Legal shell (header, sidebar, CTA) — VERIFIED, no change
- Files: `_layout.scss` (`.layout--about`), `_menu.scss` (`.menu--about`) — untouched.
- Compared `/preguntas-frecuentes` desktop (1440) + mobile (390) and `/contacto` against
  `legal-faq.png` / `legal-contacto.png` and the maqueta HTML.
- Header (cream bg, amber radial glow top-right, breadcrumb "Waldo › {title}", Poppins-800 H1,
  17px intro max 680px), 248px/minmax sidebar grid, sticky sidebar with `$amber_tint`+`$ink`+`$tag`
  active state, and dark "Empieza ahora" WhyCta all match. No measurable diff → nothing committed.
- After-shots: `shell-faq-desktop.png`, `shell-faq-mobile.png`.

### Task 2 — Accordion (faq / privacidad / condiciones) — FIXED (commit `ae25bfaa`)
- File: `_accordion.scss` (`.accordion`).
- Divergence found (the user's "accordion chevron-box" item): the open accordion item's
  chevron box rendered as the pale `$amber_tint` constant, but `legal-faq.png` shows the OPEN
  box as **solid `$amber`** with a dark up-chevron. The maqueta HTML parameterizes
  `background:{{ it.iconBg }}` (it toggles); the SCSS hardcoded a single tint for all states.
- Fix: `.rotated` (applied to the svg on open) now sets `background-color: $amber` + `color: $ink`;
  added `background-color`/`color` to the svg transition so it animates like the maqueta
  (`transition: background .25s ease`). Closed items keep `$amber_tint` + `$tag` (unchanged).
- Also aligned to maqueta measurements: head padding `22px 24px` → `20px 22px`, body
  `0 24px 24px` → `0 22px 22px`.
- Regression: `.accordion` is shared with the `/por-que-waldo` featured FAQ. Re-screenshotted —
  open box is solid amber, closed boxes pale tint, no visual regression. (Note: the homepage `/`
  does NOT render AccordionDefault; the shared surface is `/por-que-waldo`.)
- typecheck (`vue-tsc --noEmit`) exit 0.
- After-shots: `accordion-faq.png` (open item solid amber), `accordion-priv.png`,
  `accordion-cond.png`, `accordion-porque.png` (regression).

### Task 3 — Contacto (form + contact block) — VERIFIED, no change
- Files: `_contact.scss` (`.contact--default`), `_address.scss` (`.address--default`) — untouched.
- Compared `/contacto` desktop (1440) + mobile (390) against `legal-contacto.png` + maqueta HTML.
- 600px form column, label typography (13px 600 `$ink`, "(opcional)" `$muted`), cream field fills
  with amber focus, phone row (CL +56 select + number, `$cream`/`$line` themed InputPhone), textarea
  + "300 caracteres restantes" counter, `$amber`/`$ink` Enviar button align-start, and the white
  `.address--default` block (CORREO ELECTRÓNICO eyebrow + mailto:contacto@waldo.click with `$tag`
  icon, REDES SOCIALES eyebrow + 3 social buttons 38×38) all match.
- Form field background reads light at screenshot scale but is `background: $cream` in SCSS
  (matches maqueta `var(--cream)`) — not a divergence.
- FormContact/ContactDefault/AddressDefault scripts + markup untouched (validation/submit/Swal/
  prefill/counter logic preserved). No measurable diff → nothing committed.
- After-shots: `contacto-desktop.png`, `contacto-mobile.png`.

### Task 4 — Sitemap (3-col grid treatment) — VERIFIED, no change
- File: `_sitemap.scss` (`.sitemap--default`) — untouched.
- Compared `/sitemap` desktop (1440) + mobile (390) against the maqueta `<!-- MAPA DEL SITIO -->`
  block (no PNG exists; HTML treatment is the target).
- 3-col grid `repeat(3, minmax(0,1fr))` gap 44px 40px; column headers (Poppins 700 13px uppercase
  `$ink` with 7px `$amber` dot + `$line` underline); link rows (flex space-between, 15px `$ink2`,
  11px 0 padding, `$line` separators, `$silver` right chevron) all match.
- Dynamic content preserved: PÁGINAS PRINCIPALES + real CATEGORÍAS + real COMUNAS from the existing
  stores render in the grid; `sitemap.vue` / `SitemapDefault.vue` / `useAsyncData "sitemap-data"` /
  store calls untouched. No measurable diff → nothing committed.
- After-shots: `sitemap-desktop.png`, `sitemap-mobile.png`.
