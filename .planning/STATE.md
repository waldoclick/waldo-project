---
gsd_state_version: 1.0
milestone: v1.45
milestone_name: User Onboarding
current_phase: null
status: defining_requirements
last_updated: "2026-03-19T20:00:00.000Z"
last_activity: "2026-03-19 — Milestone v1.45 started"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Defining requirements for v1.45 User Onboarding

## Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-19 — Milestone v1.45 started

```
Progress: [░░░░░░░░░░] 0%
```

## Accumulated Context

### Key Decisions (carry forward)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- Auth extension pattern: override plugin controllers in `src/extensions/users-permissions/strapi-server.ts`
- `recaptcha.ts` middleware intercepts `POST /api/auth/local` — 2-step interception at controller level (after recaptcha)
- `overrideAuthLocal` guards `ctx.method === "GET"` to skip 2-step for OAuth callbacks
- New Strapi auth endpoints use `src/api/` (standard content API), NOT plugin extension routes — plugin route factory broken in Strapi v5
- `google_sub` field: lookup by sub first (immutable), then email fallback for existing account linking
- `disableAutoSelect()` before `strapiLogout()` in `useLogout.ts` — clears GIS `g_state` cookie
- `google-one-tap.client.ts` plugin suffix ensures SSR exclusion automatically
- SSR populate hygiene: only include populate fields present in TypeScript User interface and consumed by components
- useApiClient returns raw body — no .data wrapper; Strapi SDK wrappers do wrap
- COOKIE_DOMAIN conditional spread in nuxt.config.ts strapi.cookie — production emits `Domain=.waldo.click`
- SSR-safe 404/500: throw `createError({ statusCode, fatal: true })` inside `useAsyncData` callback
- `isProfileComplete()` in me.store.ts checks: firstname, lastname, rut, phone, commune
- `FormProfile.vue` on success redirects to `/cuenta/perfil` — onboarding must override this behavior
- `useHistoryStore` tracks viewed ads, not page navigation — pre-onboarding URL stored separately

### Blockers/Concerns (open)

(none)
