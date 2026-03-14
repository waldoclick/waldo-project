---
quick: 37
type: summary
description: "Surface silent email delivery failures in forgot-password flow"
date: "2026-03-14"
duration_minutes: 5
tasks_completed: 2
files_modified:
  - apps/strapi/src/services/mjml/send-email.ts
  - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
commits:
  - hash: ea558e5
    message: "fix(37): re-throw errors in sendMjmlEmail so callers receive failures"
  - hash: 5934cf1
    message: "fix(37): add strapi.log.error in overrideForgotPassword catch block"
key_decisions:
  - "sendMjmlEmail now re-throws after logging — callers are notified of all delivery failures"
  - "overrideForgotPassword catch block logs failures via strapi.log.error with email + error message"
  - "Failure remains non-fatal (token saved, user can retry) but is now visible in Strapi logs"
---

# Quick Task 37: Surface Silent Email Delivery Failures in Forgot-Password Flow

**One-liner:** Surfaced silent Mailgun/template failures in forgot-password by re-throwing from `sendMjmlEmail` and logging in `overrideForgotPassword`.

## Problem

Password reset email from the dashboard was not arriving. Task #36 fixed the missing reCAPTCHA token so requests now reach `overrideForgotPassword`, but the email still wasn't delivered.

Root cause: Two levels of silent failure:
1. `sendMjmlEmail` caught all errors internally and returned `false` — callers had no way to detect failure
2. `overrideForgotPassword` used `catch (_)` — discarding any exception without logging

Result: Mailgun delivery failures, template rendering errors, and misconfiguration were completely invisible. The controller always returned `{ ok: true }`.

## Fix

### Task 1 — `send-email.ts`

Modified the `catch` block to re-throw the error after logging it. Removed the unreachable `return true` statement. The function now propagates failures to callers instead of silently returning `false`.

```typescript
// Before
} catch (error) {
  console.error("Error enviando email MJML:", error);
  return false;
}

// After
} catch (error) {
  console.error("Error enviando email MJML:", error);
  throw error;
}
```

### Task 2 — `authController.ts`

Updated `overrideForgotPassword`'s catch block to log failures via `strapi.log.error` with the recipient email and error message.

```typescript
// Before
} catch (_) {
  // Non-fatal: token is saved; user can request again
}

// After
} catch (err) {
  strapi.log.error(
    `[overrideForgotPassword] Failed to send reset-password email to ${user.email}: ${err?.message ?? err}`
  );
}
```

## Outcome

The next time a dashboard user submits forgot-password and the email fails to deliver, Strapi logs will show the exact reason — Mailgun API error, template not found, network issue, etc. This enables immediate diagnosis and targeted remediation.

The behavior remains non-fatal: the reset token is saved to the database and the user can request again.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `apps/strapi/src/services/mjml/send-email.ts` — modified, committed ea558e5
- [x] `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — modified, committed 5934cf1
- [x] TypeScript check passed (no new errors)
- [x] Both commits exist in git log
