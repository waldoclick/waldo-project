---
gsd_state_version: 1.0
milestone: v1.36
milestone_name: Two-Step Login Verification
current_phase: 077
status: roadmap_ready
last_updated: "2026-03-13T22:30:00.000Z"
last_activity: "2026-03-13 — Roadmap created for v1.36 (3 phases: 077–079)"
progress:
  total_phases: 3
  completed_phases: 0
  total_plans: null
  completed_plans: 0
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13 after v1.36 milestone started)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 077 — Strapi 2-Step Backend (ready to plan)

## Position

**Milestone:** v1.36 — Two-Step Login Verification
**Current Phase:** 077 — Strapi 2-Step Backend
**Status:** Roadmap ready — awaiting `/gsd-plan-phase 077`

```
Progress: [░░░░░░░░░░] 0/3 phases complete
```

Last activity: 2026-03-13 — Roadmap created for v1.36 (3 phases: 077–079)

## Accumulated Context

### Key Decisions (carry forward)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- Auth extension pattern: override plugin controllers in `src/extensions/users-permissions/strapi-server.ts` — same pattern as `registerUserLocal`
- `recaptcha.ts` middleware already intercepts `POST /api/auth/local` — 2-step interception must be at **controller level** (after recaptcha passes), NOT in middleware
- `verification-code` content type fields: `userId` (integer), `code` (string), `expiresAt` (datetime), `attempts` (integer, default 0), `pendingToken` (string, unique)
- Three new routes: `POST /api/auth/local` (override), `POST /api/auth/verify-code` (new), `POST /api/auth/resend-code` (new)
- Google OAuth (`/api/connect/google/callback`) is unaffected — must bypass 2-step entirely
- `sendMjmlEmail()` for all email notifications; email failures wrapped in try/catch (non-fatal)
- `pendingToken` carried in transient state (not URL) between login → verify pages in both frontend apps
- Swal for user-facing errors (code expired, max attempts reached) in both apps
- AGENTS.md BEM convention applies to all new SCSS components

### Phase Dependency

- Phase 077 (Strapi backend) must complete before Phase 078 (Dashboard) and Phase 079 (Website) can begin
- Phases 078 and 079 are independent of each other — can be planned/executed in parallel

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 29 | Create InputAutocomplete.vue component with integrated search for FormGift | 2026-03-13 | a079dc0 | [29-create-inputautocomplete-vue-component-w](.planning/quick/29-create-inputautocomplete-vue-component-w/) |
