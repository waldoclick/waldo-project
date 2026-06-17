---
phase: 05-rediseno-cuenta
plan: "05"
subsystem: website/account-profile
tags: [redesign, profile, scss, vue, account]
dependency_graph:
  requires: ["05-04"]
  provides: ["account--profile Ver mode", "account--edit Editar mode"]
  affects: ["apps/website/app/components/AccountProfile.vue", "apps/website/app/components/AccountEdit.vue", "apps/website/app/scss/components/_account.scss"]
tech_stack:
  added: []
  patterns: ["BEM nested SCSS rewrite in-place", "NuxtLink segmented toggle", "plain label/value info grid instead of CardInfo", "computed completeness ratio"]
key_files:
  created: []
  modified:
    - apps/website/app/components/AccountProfile.vue
    - apps/website/app/components/AccountEdit.vue
    - apps/website/app/scss/components/_account.scss
decisions:
  - "Used plain label/value divs instead of CardInfo for info grid to avoid touching CardInfo SCSS and regressing other views"
  - "Omitted bio and WhatsApp fields — not in User type or FormProfile"
  - "Verificado badge tied to user.confirmed (real field)"
  - "Identidad publica cards link unconditionally to existing /cuenta/username|avatar|cover routes (no PRO gate added)"
  - "Plan PRO card: active state links to /mis-ordenes; cancelled state links to /mis-ordenes — no new backend"
  - "AccountEdit = eyebrow + h1 + toggle + FormProfile wrapped in account--edit__card only; no fields rebuilt"
  - "Only the completeness bar uses :style (dynamic width); all other styling in SCSS"
  - "Segmented active pill box-shadow 0 1px 2px rgba(38,37,43,.08) — only allowed box-shadow per mockup"
  - "#a9772e literal for identity card CTA color (no token, same precedent as orders --tag)"
metrics:
  duration: "~35 minutes"
  completed: "2026-06-17T17:04:00Z"
  tasks: 2
  files: 3
---

# Phase 05 Plan 05: Mi perfil (Ver + Editar) Redesign Summary

Restyled AccountProfile.vue (Ver mode) and AccountEdit.vue (Editar mode) to match design/account.dc.html lines 262-417 using phase-04 tokens ($ink, $amber, $cream, $line, $success, $muted). Existing `&--profile` and `&--edit` SCSS blocks rewritten in-place in `_account.scss`; all computeds, validation, and FormProfile logic preserved with zero regression.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Restyle AccountProfile.vue — Ver mode | 861ec2cb |
| 2 | Restyle AccountEdit.vue + update _account.scss | 64938695 |

## What Was Built

### AccountProfile.vue (Ver mode)
- Eyebrow "Cuenta" + h1 "Mi perfil" + intro + Ver/Editar segmented toggle (NuxtLink, "Ver" active)
- `account--profile__preview` card: amber cover gradient band (NuxtImg if user.cover), avatar circle ($amber bg with initials fallback, NuxtImg if user.avatar), name + PRO badge ($ink) + Verificado badge ($success tint, tied to `user.confirmed`), meta row (@username, commune with MapPin, member year with Calendar), tipo chip (Persona Natural/Empresa)
- `account--profile__completeness` card: "Tu perfil está N% completo" label + $success percentage + $cream track with $success fill via `:style` (only allowed dynamic inline style)
- `account--profile__info`: 2-col label/value grid for 10 personal fields + 7 company fields (v-if user.is_company), with "Editar" button → /cuenta/perfil/editar
- `account--profile__identity`: 3-card grid → /cuenta/username, /cuenta/avatar, /cuenta/cover (existing routes)
- PRO plan card: dark ($ink bg) active state + white cancelled state; both link to /mis-ordenes

### AccountEdit.vue (Editar mode)
- Eyebrow + h1 + intro + Ver/Editar segmented toggle ("Editar" active)
- `account--edit__card` wrapper (1px $line, $white bg, 14px radius, 28px/30px padding) containing `<FormProfile />` unchanged

### _account.scss
- `&--profile` block fully rewritten: all sub-elements with phase-04 tokens only; old `__box/__heading/__grid` rules removed
- `&--edit` block fully rewritten: new structure with eyebrow, toggle, card; old `__header/__text/__form` rules removed
- All other modifiers (`&--main`, `&--announcements`, `&--orders`, etc.) left untouched

## Deviations from Plan

### Auto-fixed Issues

None — plan executed cleanly with the following notable adaptation:

**[Advisor guidance] Omit bio and WhatsApp from info grid**
- Bio field does not exist in `User` type or FormProfile — omitted from both Ver and Editar views per advisor guidance
- WhatsApp does not exist in `User` type — omitted from personalFields grid
- No functional regression since these fields were never present

**[Advisor guidance] Use plain label/value divs instead of CardInfo**
- CardInfo is a shared component; restyling it would affect dashboard and other views
- Replaced with `account--profile__info__row` divs scoped entirely to `_account.scss`

## Known Stubs

None — all displayed data is wired to real `user.*` fields from `useSessionUser()`.

## Self-Check: PASSED

- AccountProfile.vue: FOUND
- AccountEdit.vue: FOUND
- _account.scss: FOUND
- Commit 861ec2cb: FOUND
- Commit 64938695: FOUND
