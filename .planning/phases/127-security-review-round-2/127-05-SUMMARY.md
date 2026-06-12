---
phase: 127-security-review-round-2
plan: 05
subsystem: api
tags: [security, mjml, nunjucks, file-upload, file-type, xss, pii, route-lockdown]

requires:
  - phase: 127-03
    provides: users-permissions ratelimit and reCAPTCHA in config/plugins.ts

provides:
  - MJML nunjucks autoescape (autoescape: true) with audited templates
  - Upload magic-byte validation via file-type@16.5.4 + 5MB sizeLimit
  - GET /api/users filter whitelist (ALLOWED_FILTER_KEYS) + PII strip for non-managers
  - verification-code core routes disabled (only: [])
  - contact routes limited to create only
  - subscription-payment write actions gated behind global::isManager

affects: [any phase touching MJML templates, upload middleware, users controller, or these content-type routes]

tech-stack:
  added: [file-type@16.5.4]
  patterns:
    - magic-byte validation via fileTypeFromFile before accepting upload
    - autoescape at template engine level (not call site) to prevent double-escaping
    - ALLOWED_FILTER_KEYS whitelist pattern for user-controlled filter input
    - PII_FIELDS strip pattern for non-manager responses

key-files:
  created:
    - apps/strapi/tests/middlewares/upload.test.ts
    - apps/strapi/tests/extensions/users-permissions/controllers/userController.test.ts
  modified:
    - apps/strapi/package.json
    - apps/strapi/src/services/mjml/index.ts
    - apps/strapi/src/api/contact/services/contact.service.ts
    - apps/strapi/src/middlewares/upload.ts
    - apps/strapi/config/plugins.ts
    - apps/strapi/src/extensions/users-permissions/controllers/userController.ts
    - apps/strapi/src/api/verification-code/routes/verification-code.ts
    - apps/strapi/src/api/contact/routes/contact.ts
    - apps/strapi/src/api/subscription-payment/routes/subscription-payment.ts
    - apps/strapi/tests/api/contact/contact-escape.test.ts

key-decisions:
  - "file-type@16.5.4 pinned — v17+ is ESM-only and breaks Strapi's CJS build"
  - "autoescape: true at nunjucks configure level — escaping all {{ vars }} globally, not per-template"
  - "escapeHtml() removed from contact.service.ts call site — keeping it caused double-escaping (& → &amp; → &amp;amp;)"
  - "No MJML template variable needs | safe — all vars are plain text, numeric, or server-generated URLs"
  - "subscription-payment find/findOne left unrestricted — dashboard uses these to display subscription history"
  - "contact-escape.test.ts updated to verify raw values at call site (escaping now at render time)"

patterns-established:
  - "Magic-byte pattern: import fileTypeFromFile; validate after MIME allowlist check in upload loop"
  - "PII strip pattern: const isManager = ...; if (!isManager) for (const field of PII_FIELDS) delete safe[field]"
  - "Filter whitelist pattern: ALLOWED_FILTER_KEYS.includes(key) before merging into where clause"

requirements-completed: [SEC2-LOCKDOWN]

duration: 35min
completed: 2026-06-12
---

# Plan 127-05: SEC2-LOCKDOWN Summary

**Four-vector hardening: MJML autoescape, upload magic-byte + sizeLimit, user-list PII strip + filter whitelist, and content-API route lockdown**

## Performance

- **Duration:** ~35 min
- **Completed:** 2026-06-12
- **Tasks:** 3
- **Files modified:** 9 production + 3 test files

## Accomplishments

- `autoescape: true` in nunjucks — all MJML email templates now HTML-escape user-controlled variables at render time; contact service `escapeHtml()` pre-calls removed (double-escape prevented)
- Upload middleware: `fileTypeFromFile` validates magic bytes against declared MIME type; mismatches yield HTTP 400; `sizeLimit: 5MB` added to plugins.ts (plan 03 ratelimit preserved)
- `GET /api/users` (`getUserDataWithFilters`): `ALLOWED_FILTER_KEYS` whitelist drops unsupported filters before merging into `where`; `PII_FIELDS` (email, phone, rut, address, birthdate, etc.) stripped for non-manager callers
- verification-code: `only: []` — CRUD fully disabled (OTP/token not web-accessible)
- contact: `only: ["create"]` — public form submission only
- subscription-payment: create/update/delete behind `global::isManager`

## Task Commits

1. **Task 1: file-type install + failing tests** - `5835b055` (test)
2. **Task 2: upload magic-byte + sizeLimit + filter whitelist + PII strip** - `27113ea1` (fix)
3. **Task 3: MJML autoescape + template audit + route lockdown** - `29b4f1f7` (fix)

## Template Audit

All 14 MJML templates audited (including layouts/partials):

| Template | Variables | `| safe` needed | Action |
|----------|-----------|----------------|--------|
| ad-approved.mjml | name, adTitle, adUrl | No | No change |
| ad-banned.mjml | name, adTitle, reason, frontendUrl | No | No change |
| ad-creation-admin.mjml | name, email, slug, adUrl | No | No change |
| ad-creation-user.mjml | name, adUrl | No | No change |
| ad-rejected.mjml | name, adTitle, reason, frontendUrl | No | No change |
| contact-admin.mjml | name, email, phone, company, message | No | No change (autoescape handles) |
| contact-user.mjml | name, phone, company | No | No change (autoescape handles) |
| email-confirmation.mjml | name, confirmationUrl | No | No change |
| gift-reservation.mjml | name, quantity, type | No | No change |
| report-ads-daily-update.mjml | ad.id, ad.name, ad.duration_days, ad.remaining_days | No | No change |
| report-free-ads-restoration.mjml | user.id, user.username, user.email, user.neededReservations, etc. | No | No change |
| report-free-reservations-restoration.mjml | user.id, user.username, user.email, user.neededSlots, etc. | No | No change |
| reset-password.mjml | name, resetUrl | No | No change |
| verification-code.mjml | name, code | No | No change |
| partials/footer.mjml | year, frontendUrl | No | No change |

**Result:** No template variable carries pre-rendered HTML — all are plain text, numbers, or server-generated URLs. No `| safe` additions needed.

**`escapeHtml()` removed from:** `contact.service.ts` (fullname, phone, company, message, email passed raw to sendMjmlEmail)

## Decisions Made

- **file-type pinned to 16.5.4**: v17+ is ESM-only; Strapi uses CJS. Installing v17 would break the entire backend.
- **autoescape at configure level**: Global protection is better than per-variable `| safe` discipline. Only mark safe when genuinely serving HTML.
- **escapeHtml() removed from contact.service.ts**: With autoescape on, passing already-escaped strings causes double-escaping. The function itself is kept in `escape.ts` for potential future use.
- **subscription-payment find/findOne unrestricted**: Dashboard reads these for subscription history display; only write actions need manager gating.

## Deviations from Plan

### Auto-fixed Issues

**1. contact-escape.test.ts expectations updated**
- **Found during:** Task 3 (autoescape change)
- **Issue:** Tests asserted pre-escaped values at the sendMjmlEmail call boundary; after removing escapeHtml() from contact.service.ts, tests failed expecting `&lt;script&gt;` but receiving `<script>` (raw value)
- **Fix:** Updated test assertions to verify raw values are passed to sendMjmlEmail (escaping now deferred to nunjucks at render time); updated describe/test names to document the architectural intent
- **Files modified:** tests/api/contact/contact-escape.test.ts
- **Committed in:** 29b4f1f7 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (test assertions updated to match new architecture)
**Impact on plan:** Necessary correction — the test was validating the wrong layer after the autoescape migration.

## Issues Encountered

- Three test suites fail pre-existing (before plan 05): `authController.test.ts` (strapi.getModel mock issue), `indicador.test.ts` (TypeScript type mismatch), `ad.approve.zoho.test.ts` (incomplete mock type). None introduced by plan 05 — verified via git stash.
- `general.utils.test.ts` is an integration test requiring a running Strapi/DB — expected failure in CI without DB.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All four SEC2-LOCKDOWN vectors closed
- Phase 127 (security-review-round-2) fully executed — ready for verification
- Manual verification note: export Strapi Public vs Authenticated DB role permissions and confirm verification-code/subscription-payment write actions are not granted to non-managers in the DB role configuration

---
*Phase: 127-security-review-round-2*
*Completed: 2026-06-12*
