---
phase: 098-frontend-rewrite-logout-fix
plan: "03"
status: complete
started: 2026-03-19
completed: 2026-03-19
commits: [8517bdb, 60de5a1, 216c57c]
requirements_covered: [GTAP-08, GTAP-09, GTAP-10, GTAP-11]
---

# Plan 098-03 Summary: Google One Tap Plugin + Layout Cleanup

## What Was Built

Created the `google-one-tap.client.ts` Nuxt plugin — the SSR-safe GIS initializer that wires the One Tap overlay to the Strapi `/api/auth/google-one-tap` endpoint. Removed dead comment blocks from layouts. Added route guard to suppress overlay on `/login/*` auth callback pages.

## Key Files

### Created
- `apps/website/app/plugins/google-one-tap.client.ts` — GIS initialization plugin; auth guard + route guard; 100ms retry loop for script load; credential → POST endpoint → setToken + fetchUser

### Modified
- `apps/website/app/layouts/default.vue` — dead comment block removed (purely subtractive)
- `apps/website/app/layouts/auth.vue` — dead comment block removed (purely subtractive)

## Deviations

- Added route guard (`route.path.startsWith("/login/")`) not in original plan — discovered during smoke test that One Tap overlay appeared on `/login/google` OAuth callback page while mid-authentication

## Verification

- 14 tests GREEN (3 plugin + 5 useLogout + 6 useGoogleOneTap)
- TypeCheck passes
- Manual smoke test approved: overlay on home, no overlay on private routes or `/login/*`, sign-in sets waldo_jwt cookie, logout does not re-trigger overlay
