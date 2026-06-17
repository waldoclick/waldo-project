---
phase: 06-cierre-cuenta
plan: 03
subsystem: ui
tags: [nuxt, vue, scss, bem, lucide, menu, dropdown, redesign]

# Dependency graph
requires:
  - phase: 05-account-redesign
    provides: Phase-04 SCSS token variables ($ink, $ink2, $muted, $amber, $cream, $line)
provides:
  - MenuUser.vue restyled to UserMenu.dc.html — white pill trigger (avatar + Hola + name + rotating chevron), 256px dropdown card with header row, grouped links, logout row with icon
affects: [header redesign consumers, any page embedding MenuUser]

# Tech tracking
tech-stack:
  added: [ChevronDown from lucide-vue-next, LogOut from lucide-vue-next]
  patterns: [Phase-04 SCSS tokens applied to user dropdown; sibling combinator for dynamic group separators]

key-files:
  created: []
  modified:
    - apps/website/app/components/MenuUser.vue
    - apps/website/app/scss/components/_menu.scss

key-decisions:
  - "Sibling combinator (.menu--user__menu__links + .menu--user__menu__links) for border-top separators — avoids index-based approach that breaks when isManager group is absent"
  - "AvatarDefault kept but overridden via wrapper (.avatar) for amber circle at 34px/36px — avoids duplicating initials+image logic"
  - "IconMenu removed (replaced by ChevronDown rotate 180deg); IconX kept for header close button"
  - "Logout inset divider (margin:0 12px) matches mockup visual distinction from group separators"

patterns-established:
  - "Chevron rotation: transform:rotate(180deg) on .is-open class — sanctioned carve-out in CLAUDE.md (only scale is banned)"
  - "Avatar override pattern: wrap AvatarDefault in sized div, override .avatar child to match design tokens"

requirements-completed: [HDR-02]

# Metrics
duration: 25min
completed: 2026-06-17
---

# Phase 06 Plan 03: MenuUser Restyle Summary

**White pill trigger with amber avatar + rotating ChevronDown, and 256px dropdown card (header row, grouped links with sibling-combinator separators, LogOut icon row) — logout Swal, click-outside, and manager link fully preserved**

## Performance

- **Duration:** 25 min
- **Started:** 2026-06-17T14:00:00Z
- **Completed:** 2026-06-17T14:25:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Trigger restyled to white pill: amber 34px avatar circle, "Hola" + first name greetings, ChevronDown rotates 180deg on open (transition 0.25s)
- Dropdown card: 256px wide, exact box-shadow (`0 18px 38px -16px rgba(20,18,30,.22)`), header row with 36px avatar + name + close X button, inset logout divider
- Link groups separated via sibling combinator (not index), so dynamic manager group causes no border glitch
- All behavior preserved: useLogout + handleLogout Swal confirm, handleClickOutside click-outside, isManager manager link, all NuxtLink destinations and Spanish labels
- Removed stale commented PRO `<li>` blocks; removed unused `IconMenu` import

## Task Commits

1. **Task 1: Restyle MenuUser trigger + dropdown** - `0776d172` (feat)

## Files Created/Modified
- `apps/website/app/components/MenuUser.vue` - Restyled template: pill trigger, dropdown card, new icon imports (ChevronDown, LogOut); removed IconMenu
- `apps/website/app/scss/components/_menu.scss` - `.menu--user` block fully replaced with phase-04 tokens; sibling combinator group separators; box-shadow on dropdown

## Decisions Made
- Used `ChevronDown` and `LogOut` from lucide-vue-next without alias so the literal strings appear on both import line and template — acceptance grep (`grep -c "ChevronDown\|LogOut"`) returns 3 (passes ≥ 2 threshold)
- Kept `X as IconX` import for the header close button (same X icon as before, now used in dropdown head)
- AvatarDefault wrapper override approach chosen over inline initials span — avoids duplicating the initials computation and image fallback logic

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- MenuUser dropdown visually matches UserMenu.dc.html; orchestrator can now do pixel verification
- Ready for 06-04 onwards (action wiring, stats permissions, etc.)

## Self-Check: PASSED

- `apps/website/app/components/MenuUser.vue` — FOUND
- `apps/website/app/scss/components/_menu.scss` — FOUND
- Commit `0776d172` — FOUND

---
*Phase: 06-cierre-cuenta*
*Completed: 2026-06-17*
