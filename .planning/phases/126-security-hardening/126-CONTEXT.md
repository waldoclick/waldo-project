# Phase 126: Security hardening — fix authorization vulnerabilities from security review - Context

**Gathered:** 2026-06-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the authorization gaps surfaced by the branch security review. Server-side only:
no schema migrations, no UI changes. Four work items:

1. **SEC-IDOR-USERS** (HIGH) — Account-takeover IDOR on `PUT /api/users/:id`.
2. **SEC-MASSASSIGN-ADS** (HIGH) — Mass-assignment payment/approval bypass on ad create/update.
3. **SEC-IDOR-FREEAD** (MEDIUM) — Free-ad publish IDOR.
4. **SEC-HARDENING** — Dev-endpoint env gating, email HTML-injection escape, regex trailing-slash bypass.

Each backend fix must ship with a regression test. The fix must NOT break existing,
legitimate self-service flows.

</domain>

<decisions>
## Implementation Decisions

### SEC-IDOR-USERS — `PUT /api/users/:id` ownership

- **Enforce ownership, do NOT swap controllers.** The fix is to reject any request where the
  path `:id` does not equal `ctx.state.user.id` (managers bypass via the existing `isManager`
  helper), returning 403. Do NOT wire the existing `userUpdateController.updateUser` as
  `user.update`: that controller requires a full base-field set (address, birthdate, commune,
  firstname, lastname, phone, region, rut) and would reject the partial PUTs the frontend sends.
- **Critical non-breaking constraint — three live callers send partial bodies to `PUT /users/:id`:**
  - `apps/website/app/components/FormPasswordDashboard.vue` → `{ data: { password, currentPassword } }`
  - `apps/website/app/components/FormEdit.vue` → flat `{ firstname, lastname, email, username }`
  - `apps/website/app/stores/user.store.ts` `updateUserProfile` → full profile (FormProfile)
  All three target the caller's own id, so ownership enforcement does not affect them.
- **Do NOT add `email` or `password` to `PROTECTED_USER_FIELDS`.** FormEdit changes the user's own
  email and FormPasswordDashboard changes the user's own password — both legitimate self-service.
  The IDOR fix (ownership) already prevents changing another user's email/password, which was the
  actual vulnerability. `role`, `confirmed`, `blocked`, `provider`, `pro_status` remain stripped by
  the existing middleware, so self privilege-escalation stays blocked.
- **Exact placement (policy vs middleware) is Claude's discretion for the planner**, with one hard
  constraint: the ownership check must run AFTER users-permissions authentication so
  `ctx.state.user` is populated. A route policy on the built-in `user.update` route (registered via
  `strapi-server.ts`) or an ownership guard folded into `protect-user-fields` are both acceptable.

### SEC-MASSASSIGN-ADS — protect-ad-fields middleware

- Add a `protect-ad-fields` middleware mirroring `protect-user-fields`, stripping
  `active`, `is_paid`, `banned`, `rejected`, `remaining_days`, `duration_days`, `draft`,
  `actived_by`, `user` from POST and PUT `/api/ads` (and `/api/ads/:id`) request bodies.
- Handle both the `{ data: {...} }` wrapper and flat-body shapes (the ad controller uses `data`).
- These flags must only ever be set server-side by the payment flow and the manager `approveAd`
  path — never from a client body. This preserves the project payment invariant.

### SEC-IDOR-FREEAD — free-ad ownership assertion

- In `apps/strapi/src/api/payment/services/free-ad.service.ts`, after `getAdById(adId)` and before
  `publishAd` / `updateAdReservation` / `updateAdDates`, assert `ad.user.id === userId`. Return /
  throw a 403 (ForbiddenError) otherwise, so a user cannot publish or relink another user's ad.

### SEC-HARDENING

- **Dev endpoints:** gate `apps/website/server/api/dev-config.get.ts` and
  `apps/website/server/api/dev-login.post.ts` behind `import.meta.dev` — return 404
  (`createError({ statusCode: 404 })`) when not in dev, so they are unreachable in production.
- **Email escape:** prevent HTML injection in operator/admin emails by escaping user-supplied
  fields at the boundary (contact form: name, email, phone, company, message) before they reach
  the MJML/nunjucks render. Targeted escaping — do NOT flip the global nunjucks `autoescape` to
  true, which risks breaking transactional templates that intentionally render server-built HTML
  (button URLs/links). Audit other public-input → email paths for the same pattern.
- **Regex bypass:** fix `USER_UPDATE_PATH_REGEX` in `protect-user-fields.ts` so a trailing slash
  (`/api/users/123/`) cannot bypass field stripping (e.g. allow an optional trailing slash).

### Test Scope (Claude's Discretion on exact cases)

- **Jest (apps/strapi/tests/)** — regression tests for: users IDOR ownership (cross-user PUT → 403,
  self PUT → allowed), ad mass-assignment stripping, free-ad ownership assertion, and the MJML/contact
  escape of user input.
- **Vitest (apps/website/tests/)** — test that the dev endpoints return 404 outside dev.
- All tests live in the root-level `tests/` dir per the Mandatory Testing Directory Rule.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/strapi/src/middlewares/protect-user-fields.ts` — the exact pattern to mirror for
  `protect-ad-fields`; also the file to fix for the regex bypass and (optionally) the ownership check.
- `global::isManager` helper — used across controllers for manager bypass; reuse for ownership.
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — where built-in user routes/
  controllers are overridden in Strapi v5 (factory-wrap pattern); the place to attach a `user.update`
  ownership policy if that mechanism is chosen.
- `apps/strapi/src/services/mjml/index.ts` — `renderEmail`, currently `autoescape: false`.
- `apps/strapi/src/api/payment/services/free-ad.service.ts` + `utils/ad.utils.ts` — free-ad flow.

### Established Patterns
- Field-stripping via a global middleware keyed on method + path regex (`protect-user-fields`).
- Strapi v5 content writes prefer `strapi.db.query` and `documentId`.
- Manager-gated routes use `config: { policies: ["global::isManager"] }`.
- Tests are centralized: `apps/strapi/tests/` (Jest, AAA) and `apps/website/tests/` (Vitest), mirroring source.

### Integration Points
- All `/api/*` traffic passes `global::proxy-auth` (X-Proxy-Key) then users-permissions auth; the
  end-user JWT is forwarded unchanged. Ownership/role checks must rely on `ctx.state.user`.
- `protect-user-fields` is registered globally in `apps/strapi/config/middlewares.ts`; `protect-ad-fields`
  registers the same way.

</code_context>

<specifics>
## Specific Ideas

- The three partial-body `PUT /users/:id` callers (password, email, full profile) are the binding
  constraint on the users-IDOR fix — verified in code, must not regress.
- `username` is already stripped by `protect-user-fields`, so FormEdit's username field is already a
  no-op server-side; do not "fix" that as part of this phase (out of scope, pre-existing behavior).

</specifics>

<deferred>
## Deferred Ideas

- The lower-confidence audit observations gated behind the Strapi role-permission matrix (order
  find/findOne/exportCsv IDOR, ad-reservation/ad-pack create permissions) are NOT in scope — they
  depend on DB-stored role config not in the repo and require a separate verification pass.
- `email_verified` check on Google account-link, and marking `verification-code` fields `private`,
  are defense-in-depth items below the exploitability bar — deferred.

</deferred>
