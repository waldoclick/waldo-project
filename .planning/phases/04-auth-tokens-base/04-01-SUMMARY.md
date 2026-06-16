---
phase: 04-auth-tokens-base
plan: 01
subsystem: ui
tags: [scss, design-tokens, variables, poppins, rebrand]

# Dependency graph
requires: []
provides:
  - 13 new SCSS design tokens for v1.47 auth redesign in _variables.scss
  - $amber, $amber_hover, $cream, $line brand/surface tokens
  - $ink, $ink2, $muted, $placeholder text tokens
  - $error, $warning, $success, $success_strong, $strength_empty feedback tokens
  - Poppins confirmed as global font (weights 100-900, no change needed)
affects:
  - 04-02 (auth layout restyling — will consume $ink, $amber, $cream, $line)
  - all future auth SCSS components in phase 04

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "New design tokens appended after existing color block with // v1.47 redesign tokens comment header"
    - "Semantic token naming mirrors maqueta CSS custom properties (--ink → $ink, --amberH → $amber_hover)"

key-files:
  created: []
  modified:
    - apps/website/app/scss/abstracts/_variables.scss

key-decisions:
  - "$amber_hover chosen as the SCSS name for maqueta --amberH (semantic, avoids abbreviation)"
  - "$success_strong chosen for the score-4 color (#1f8a5b) in password strength meter"
  - "D-03 confirmed: Poppins declared in nuxt.config.ts line 310 via @nuxtjs/google-fonts (weights 100-900) and applied globally in apps/website/app/scss/base/_fonts.scss line 12 — zero font changes needed"
  - "Existing 16 variables (lines 4-19) left byte-identical: $charcoal, $cultured, $davys_grey, $dodger_blue, $eerie_black, $ghost_white, $gainsboro, $independence, $jet, $light_peach, $magic_mint, $platinum, $red_salsa, $silver, $white, $white_smoke"

patterns-established:
  - "Auth redesign tokens live in a clearly labeled section at the bottom of _variables.scss to avoid collisions with existing palette"

requirements-completed: [TOK-01, TOK-02]

# Metrics
duration: 1min
completed: 2026-06-16
---

# Phase 04 Plan 01: Auth + Tokens Base Summary

**13 new v1.47 SCSS design tokens ($amber, $ink, $cream, $line + feedback set) appended to _variables.scss; Poppins global font confirmed via @nuxtjs/google-fonts weights 100-900**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-06-16T20:46:49Z
- **Completed:** 2026-06-16T20:47:32Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Appended 13 new SCSS design token variables to `_variables.scss` under a clearly-labelled v1.47 section, without touching any of the 16 existing variables
- Verified Poppins is already the global font: `nuxt.config.ts` line 310 declares `Poppins: [100, 200, 300, 400, 500, 600, 700, 800, 900]` via `@nuxtjs/google-fonts`; `_fonts.scss` line 12 applies it globally as `font-family: "Poppins", sans-serif`
- All acceptance criteria for TOK-01 and TOK-02 pass: existing variable values intact (grep returns 1 each for `$charcoal` and `$light_peach`), all 13 new tokens present with exact mockup hex values

## Task Commits

1. **Task 1: Append new design tokens to _variables.scss** - `42af5aee` (feat)
2. **Task 2: Confirm Poppins global font** - verification only, no commit (zero files modified)

## Files Created/Modified

- `apps/website/app/scss/abstracts/_variables.scss` — 13 new design token variables appended after existing color block

## Decisions Made

- `$amber_hover` chosen for maqueta `--amberH` — avoids the abbreviation, matches the SCSS underscore convention already used by `$white_smoke`, `$red_salsa`, etc.
- `$success_strong` chosen for the score-4 color `#1f8a5b` — semantic, matches maqueta intent
- Poppins confirmed via two sources: `nuxt.config.ts` (module-level google-fonts config) and `_fonts.scss` (CSS application) — D-03 is fully satisfied, no action taken

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- TOK-01 and TOK-02 complete: all 13 new tokens are available globally via `@use "../abstracts/variables" as *`
- Plan 04-02 (auth layout `.auth` restyling) and all subsequent auth SCSS plans can consume `$amber`, `$ink`, `$cream`, `$line`, `$error`, `$success`, etc. immediately
- No blockers

---
*Phase: 04-auth-tokens-base*
*Completed: 2026-06-16*
