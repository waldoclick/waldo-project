# Quick Task 31: Add /auth/verify-code to guard.global.ts publicRoutes

**Date:** 2026-03-13
**Commit:** ebf9324

## What was done

`/auth/verify-code` was missing from the `publicRoutes` list in `guard.global.ts`.

When `FormLogin.vue` called `router.push('/auth/verify-code')` after receiving `{ pendingToken }` from Strapi, the global middleware ran before the navigation completed. Since no JWT exists at that point (`useStrapiUser()` returns null), the guard intercepted the navigation and redirected back to `/auth/login` — creating a loop.

Fix: added `"/auth/verify-code"` to `publicRoutes`. The verify-code page handles its own authentication guard via `pendingToken` check in `onMounted` (FormVerifyCode.vue).

## Files modified

- `apps/dashboard/app/middleware/guard.global.ts`
