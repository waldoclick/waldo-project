# Quick Task 30: Fix Strapi Handler not found auth.verifyCode startup error

**Date:** 2026-03-13
**Commit:** afb78d6

## What was done

Fixed Strapi startup crash: `Error creating endpoint POST /auth/verify-code: Handler not found "auth.verifyCode"`.

**Root cause:** `plugin.routes["content-api"]` in the users-permissions plugin is a **factory function** in Strapi v5. Calling `.routes.push()` on it sets a property on the function object, which is silently discarded when `instantiateRouterInputs()` calls the factory during server bootstrap. The pushed routes were never actually registered. The error itself was caused by a stale `dist/` file that still contained the broken push — Strapi runs compiled JS from `dist/`, not TypeScript source directly.

**Fix:**
- Created `apps/strapi/src/api/auth-verify/` as a standard Strapi content API
  - `controllers/auth-verify.ts` — delegates to `verifyCode` and `resendCode` from `authController.ts`
  - `routes/auth-verify.ts` — registers `POST /api/auth/verify-code` and `POST /api/auth/resend-code` with `auth: false` (user has no JWT yet at this step)
- Removed broken `plugin.routes["content-api"].routes.push()` calls from `strapi-server.ts`
- Cleaned up unused `verifyCode`/`resendCode` imports from `strapi-server.ts`

**Also fixed:** Previous commit (f087a5b) had added `info.pluginName` to the push calls — reverted that approach since the fundamental issue is that pushed routes on a factory function are never processed.

## Files modified

- `apps/strapi/src/api/auth-verify/controllers/auth-verify.ts` (created)
- `apps/strapi/src/api/auth-verify/routes/auth-verify.ts` (created)
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` (modified)
