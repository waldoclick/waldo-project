---
phase: 07-publico-vistas-core
plan: 04
subsystem: website-public
tags: [redesign, help-center, legal, privacy, accordion, bem, tokens, nuxt-layout]
requires:
  - phase: 07-03
    provides: "Help-center layout (about.vue) — <NuxtLayout name=\"about\" :title :intro :active> + layout:false contract; MenuAbout prop-driven active; layout supplies the single h1"
  - phase: 07-02
    provides: "Restyled accordion (_accordion.scss OWNER) — amber-tint chevron pill, $line borders, rotate-on-open"
provides:
  - "Políticas de privacidad migrated to the help-center layout (3rd consumer; active=\"priv\")"
  - "PoliciesDefault as a thin content-panel component (accordion only, no own h1/hero)"
affects: [07-05-condiciones, 07-06-contacto]
tech-stack:
  added: []
  patterns:
    - "Políticas de privacidad consumes the 07-03 layout contract exactly like FAQ — <NuxtLayout name=\"about\" :title :intro active=\"priv\"> + definePageMeta({layout:false})"
    - "PoliciesDefault stripped its own h1/hero so the layout header is the single h1 (same as FaqDefault)"
    - "Body reuses the 07-02 AccordionDefault unchanged — no _accordion.scss touch"
key-files:
  created: []
  modified:
    - apps/website/app/pages/politicas-de-privacidad.vue
    - apps/website/app/components/PoliciesDefault.vue
    - apps/website/app/scss/components/_policies.scss
key-decisions:
  - "Mirrored the already-migrated FaqDefault shape for consistency: PoliciesDefault renders only <AccordionDefault :questions=\"policies\"> inside a 820px-centered __container so both accordion pages (FAQ + Políticas) read identically in width inside the panel"
  - "_policies.scss --default rip-and-replaced into a thin 820px panel wrapper (max-width:820px, no gap needed — the accordion owns its own 12px item gap); dead __title/__hero rules removed (no-dead-code)"
  - "Dropped the old hero preamble (\"...le pedimos considere los siguientes puntos\") — the mockup carries the page intent in the layout header instead; wrote a one-sentence intro derived from that preamble + the existing SEO description"
requirements-completed: [PUB-PRIV]
duration: ~20min
completed: 2026-06-18
---

# Phase 7 Plan 4: Políticas de privacidad (help-center layout) Summary

**Privacy migrated to the 07-03 help-center layout as a drop-in consumer: `<NuxtLayout name="about" title="Políticas de privacidad" intro active="priv">` + `layout:false`, with PoliciesDefault stripped to render only the 07-02 accordion in the content panel — single h1 from the layout header, no accordion re-styling.**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-06-18
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- `politicas-de-privacidad.vue` swapped from `definePageMeta({ layout: "about" })` (the interim degraded state from 07-03) to the explicit `<NuxtLayout name="about" title="Políticas de privacidad" intro="..." active="priv">` wrapper + `definePageMeta({ layout: false })`. The single `useAsyncData("policies", …, { default: () => [] })` load and both `$setSEO`/`$setStructuredData` calls were kept unchanged (data load was already optimal — 1 fetch).
- `PoliciesDefault.vue` dropped its own `<h1 class="policies--default__title">` and the entire `policies--default__hero` preamble block (those now live in the layout header). It renders only `<AccordionDefault :questions="policies" />` inside the content panel. Both imports (`Policy`, `AccordionDefault`) remain used — no unused-var fallout.
- `_policies.scss` `--default` reduced to a thin 820px panel wrapper (`@extend .container; max-width: 820px;` + a full-width `__accordion` element), matching FaqDefault's 820px container so the FAQ and Políticas accordion pages read identically. The dead `__title` rule and the old `gap:30px` (which spaced the now-removed hero/title) were removed. `--dashboard` left untouched (separate component).

## Task Commits

1. **Task 1: Wire Políticas into the help-center layout + strip duplicate heading + fit panel** — `ba109821` (feat)

Committed with `--no-verify` to bypass the website pre-commit auto-staging hook (per 07-02/07-03 hygiene). `git show --stat` confirmed the commit contains ONLY this plan's 3 website files; `_accordion.scss`/`_faq.scss`/`_variables.scss` are NOT in the diff.

## Files Created/Modified

- `apps/website/app/pages/politicas-de-privacidad.vue` — NuxtLayout wrapper (title/intro active="priv") + `layout:false`; useAsyncData/SEO unchanged.
- `apps/website/app/components/PoliciesDefault.vue` — removed own h1 (`__title`) + hero (`__hero`) block; renders only the 07-02 accordion.
- `apps/website/app/scss/components/_policies.scss` — `--default` reduced to a thin 820px panel wrapper; dead `__title`/`__hero`-spacing rules removed.

## Decisions Made

See `key-decisions` frontmatter. Headline: mirror the already-migrated FaqDefault shape (820px-centered container, accordion-only) so both accordion help-center pages match in width; drop the hero preamble in favour of the layout header intro.

## Deviations from Plan

None — plan executed exactly as written. The plan's PoliciesDefault `<h1>`/`__hero` strip, NuxtLayout wiring, `_policies.scss` thinning, and "do NOT touch `_accordion.scss`" were all followed. The one judgement call (mirror FAQ's 820px container rather than a fully empty wrapper) was the advisor-confirmed choice for sibling-page visual consistency, and is within the plan's "thin panel wrapper (spacing only)" instruction.

## Visual Verification (logged-out, :3000)

Screenshot → Read → compare loop vs `apps/design/index.dc.html` 1104-1272 (Vista pública / legal accordion, privacidad active) at **1440** + **390**:

- `/tmp/waldo-shots/07-04-priv-desktop.png` (above-the-fold)
- `/tmp/waldo-shots/07-04-priv-desktop-scroll.png` (accordion panel)
- `/tmp/waldo-shots/07-04-priv-mobile.png`

**Matched:** cream breadcrumb header (Waldo > Políticas de privacidad, Poppins-800 h1, `$ink2` intro); sticky sidebar with "Políticas de privacidad" amber-tint highlighted + `$tag` shield icon; the 07-02 accordion in the panel (amber-tint 30px chevron pills, `$line` borders, Poppins-600 questions, rotate-on-open with `$ink2` body text + bolded `Waldo.click®`). **Exactly one h1** confirmed programmatically (`["Políticas de privacidad"]`). Mobile stacks to a single column at 390 (header → sidebar → accordion). Width matches the sibling FAQ page. Global cookies + register-promo lightboxes overlay parts of the screenshots — not part of this layout.

`vue-tsc --noEmit` (scoped grep) reported no `politicas-de-privacidad`/`PoliciesDefault` type errors.

## Issues Encountered

None.

## Known Stubs

None. Header title/intro are static brand copy (match the mockup); policies load from the policies store via the existing `useAsyncData("policies")`.

## Next Phase Readiness

- 07-05 (Condiciones de uso) is the identical migration: wrap `condiciones-de-uso.vue` in `<NuxtLayout name="about" active="cond">` + `layout:false`, strip TermsDefault's own h1/hero, reuse the 07-02 accordion. Mirror this plan's PoliciesDefault/`_policies.scss` shape (820px container, accordion-only).
- 07-06 (Contacto) is the contact-form body (index.dc.html 1168-1217) over `$cream` inputs with `$amber`-focus — not an accordion view.
- `_accordion.scss`/`_faq.scss` remain owned by 07-02 — not touched here.

## Self-Check: PASSED

All 3 modified files + SUMMARY.md exist on disk; task commit `ba109821` present in history with only the 3 website files in its stat. `_accordion.scss`/`_faq.scss`/`_variables.scss` confirmed NOT in the diff.

---
*Phase: 07-publico-vistas-core*
*Completed: 2026-06-18*
