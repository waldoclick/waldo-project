---
gsd_state_version: 1.0
milestone: v1.45
milestone_name: User Onboarding
status: shipped
last_updated: "2026-03-20"
last_activity: "2026-03-20 — Milestone v1.45 User Onboarding archived and tagged"
progress:
  total_phases: 3
  completed_phases: 3
  total_plans: 5
  completed_plans: 5
  percent: 100
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-20)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Planning next milestone

## Position

Phase: N/A — between milestones
Status: v1.45 User Onboarding shipped and archived
Last activity: 2026-03-20 — Milestone archived, git tagged v1.45

```
Progress: [██████████] 100% — milestone complete
```

## Accumulated Context

### Key Decisions (carry forward)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- Auth extension pattern: override plugin controllers in `src/extensions/users-permissions/strapi-server.ts`
- `overrideAuthLocal` guards `ctx.method === "GET"` to skip 2-step for OAuth callbacks
- New Strapi auth endpoints use `src/api/` (standard content API) — plugin route factory broken in Strapi v5
- `google_sub` field: lookup by sub first (immutable), then email fallback for existing account linking
- `disableAutoSelect()` before `strapiLogout()` in `useLogout.ts` — clears GIS `g_state` cookie
- SSR-safe 404/500: throw `createError({ statusCode, fatal: true })` inside `useAsyncData` callback
- `isProfileComplete()` in me.store.ts checks: firstname, lastname, rut, phone, commune
- Onboarding guard is client-only (`if (import.meta.server) return`) — same pattern as `wizard-guard.ts`
- Guard escape routes: `/onboarding`, `/login`, `/registro`, `/logout`
- `appStore.referer` persisted to localStorage — survives One Tap `window.location.reload()`
- FormProfile emit pattern: `defineEmits(["success"]) + defineProps({ onboardingMode })` — backward-compatible
- `meStore.reset()` after profile save prevents post-onboarding redirect loop from stale cache

### Blockers/Concerns (open)

(none)
