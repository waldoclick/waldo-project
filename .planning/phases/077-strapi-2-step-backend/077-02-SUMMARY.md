---
phase: 077-strapi-2-step-backend
plan: "02"
subsystem: api
tags: [mjml, email, nunjucks, strapi, verification]

requires:
  - phase: 077-strapi-2-step-backend
    provides: "Base MJML email infrastructure (send-email.ts, layouts/base.mjml) already exists"

provides:
  - "verification-code.mjml — Spanish MJML email template for 2-step login code delivery"

affects:
  - 077-strapi-2-step-backend

tech-stack:
  added: []
  patterns:
    - "MJML template extends layouts/base.mjml via Nunjucks {% extends %}/{% block content %} — same pattern as all other templates"

key-files:
  created:
    - apps/strapi/src/services/mjml/templates/verification-code.mjml
  modified: []

key-decisions:
  - "Used separate <mj-text> element with font-size=32px, font-weight=bold, letter-spacing=8px, align=center for code display — makes code unmistakably visible"
  - "Template copy written entirely in Spanish; expiry stated as '5 minutos' per plan requirement"

patterns-established:
  - "Verification code templates follow same MJML base-layout extension pattern as all other Waldo email templates"

requirements-completed: [VSTEP-08]

duration: 1min
completed: 2026-03-13
---

# Phase 077 Plan 02: Verification Code Email Template Summary

**Spanish MJML email template for 2-step login verification code, with 32px bold centered code display and 5-minute expiry notice, extending the existing Waldo base layout**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-13T22:26:59Z
- **Completed:** 2026-03-13T22:27:21Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `verification-code.mjml` extending `layouts/base.mjml` — consistent with all other Waldo email templates
- Prominent 6-digit code block (`font-size="32px" font-weight="bold" letter-spacing="8px" align="center"`) for instant readability
- All copy in Spanish; communicates 5-minute expiry and security reassurance if user did not initiate login
- Accepts `{{ name }}` and `{{ code }}` Nunjucks variables — ready for `sendMjmlEmail(strapi, 'verification-code', email, subject, { name, code })` call in Plan 03

## Task Commits

Each task was committed atomically:

1. **Task 1: Create verification-code.mjml email template** - `3e37cd2` (feat)

**Plan metadata:** _(pending — final docs commit)_

## Files Created/Modified

- `apps/strapi/src/services/mjml/templates/verification-code.mjml` — Spanish MJML template for 2-step login verification code emails

## Decisions Made

- Used a dedicated `<mj-text>` element with `font-size="32px" font-weight="bold" letter-spacing="8px" align="center" padding="20px 0"` for the code block, making the 6-digit code unmistakably visible
- Template copy is entirely in Spanish, matching the audience of the platform

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `verification-code.mjml` template is in place — Plan 03 (`sendMjmlEmail(strapi, 'verification-code', ...)`) will find the template at render time without errors
- No blockers

---
*Phase: 077-strapi-2-step-backend*
*Completed: 2026-03-13*
