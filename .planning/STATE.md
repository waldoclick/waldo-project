---
gsd_state_version: 1.0
milestone: v1.45
milestone_name: User Onboarding
status: completed
last_updated: "2026-03-20T02:52:04.147Z"
last_activity: "2026-03-19 — Completed 101-01: One Tap suppression and referer exclusion for onboarding"
progress:
  total_phases: 3
  completed_phases: 3
  total_plans: 5
  completed_plans: 5
  percent: 100
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 101 — Integration (complete)

## Position

Phase: 101 of 101 (Integration)
Plan: 1 of 1 in current phase (101-01 complete)
Status: Complete — v1.45 User Onboarding milestone done
Last activity: 2026-03-19 — Completed 101-01: One Tap suppression and referer exclusion for onboarding

```
Progress: [██████████] 100%
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
- `FormProfile.vue` on success hardcodes redirect to `/cuenta/perfil` — onboarding needs `@success` emit to override
- Onboarding guard must be client-only (`if (import.meta.server) return`) — same pattern as `wizard-guard.ts`
- Guard escape routes: `/onboarding`, `/login`, `/registro`, `/logout` — omitting any causes redirect loops
- REQUIREMENTS.md defers `onboarding_completed` boolean field to out of scope — guard uses `isProfileComplete()` only
- `layout: "auth"` reuse preferred over new `layouts/onboarding.vue` — verify against auth.vue before creating duplicate
- `appStore.referer` persisted to localStorage — survives One Tap `window.location.reload()`
- Wave 0 TDD stub pattern: use it.todo() (not it.skip()) for scaffolding before components exist — Vitest reports pending without failure
- `nuxt-meta-client-stub` Vite plugin in vitest.config.ts replaces import.meta.client/server literals at transform time — required for components with `import.meta.client ? useStore() : {}` guards to work in tests
- FormProfile emit pattern: `defineEmits(["success"]) + defineProps({ onboardingMode })` — emit fires always, redirect only when `!props.onboardingMode`; AccountEdit unchanged (no props = default false = redirect fires)
- OnboardingThankyou requires explicit `import { computed } from "vue"` — vitest does not auto-import Vue APIs
- NuxtLink stub in vitest: `{ template: '<a :href="to"><slot /></a>', props: ['to'] }` — needed for anchor href assertions
- OnboardingDefault/Thankyou component stubs passed via `global.components` in buildWrapper — standard pattern for auto-imported components
- returnUrl in OnboardingThankyou: `appStore.getReferer || "/"` — no client-only wrapper needed, referer available before user can click
- AUTH_EXEMPT_PATHS = {/login, /registro, /logout} only — /onboarding excluded so GUARD-02 reverse guard can fire for complete-profile users
- Middleware test pattern: dynamic import (beforeAll + await import()) required when guard uses global auto-imports — static import is hoisted before global.xxx assignments
- FormProfile save sequence: updateUserProfile → fetchUser() → useMeStore().reset() → Swal.fire → emit/redirect; reset() prevents post-onboarding redirect loop from stale meStore cache
- One Tap route guard uses `startsWith("/onboarding")` — single condition covers /onboarding and /onboarding/thankyou (INTEG-01)
- Referer middleware uses `startsWith("/onboarding")` exclusion — consistent with /cuenta and /login patterns (INTEG-02)
- INTEG-03 required no code change — onboarding-guard.global.ts already calls appStore.setReferer(to.fullPath) before redirect
- vi.hoisted() mutable ref pattern (mockRoutePath) — controls useRoute() path per test without separate vi.mock factories

### Blockers/Concerns (open)

(none)
