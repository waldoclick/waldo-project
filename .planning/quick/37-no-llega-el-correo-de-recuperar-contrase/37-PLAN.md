---
quick: 37
type: execute
description: "Password reset email not arriving from dashboard"
files_modified:
  - apps/strapi/src/services/mjml/send-email.ts
  - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
autonomous: true

must_haves:
  truths:
    - "Strapi logs show a clear error message if the reset-password email fails to send"
    - "Errors in sendMjmlEmail propagate to the caller instead of being silently swallowed"
    - "A password reset request from the dashboard produces either a delivered email or a visible Strapi log error"
  artifacts:
    - path: "apps/strapi/src/services/mjml/send-email.ts"
      provides: "MJML email delivery with errors re-thrown to surface failures"
    - path: "apps/strapi/src/extensions/users-permissions/controllers/authController.ts"
      provides: "overrideForgotPassword with error logging on email failure"
  key_links:
    - from: "overrideForgotPassword"
      to: "sendMjmlEmail"
      via: "try/catch — must log failures, not silently discard them"
---

<objective>
The password reset email from the dashboard does not arrive. Task #36 fixed the missing reCAPTCHA token, so requests now reach `overrideForgotPassword`. However, the email still isn't delivered.

Root cause: `sendMjmlEmail` catches ALL errors internally and returns `false` without re-throwing. `overrideForgotPassword` wraps the call in `try/catch (_)` — silently discarding any exception. Result: Mailgun delivery failures, template rendering errors, or misconfiguration errors are completely invisible. The controller always returns `{ ok: true }`, making it impossible to diagnose the issue.

Fix:
1. Make `sendMjmlEmail` re-throw after logging, so callers know about failures.
2. Add `strapi.log.error()` in `overrideForgotPassword`'s catch block so failures appear in Strapi logs.

Purpose: Surface the actual delivery error so it can be diagnosed and resolved.
Output: Strapi logs will show the real reason the email isn't arriving.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/strapi/src/services/mjml/send-email.ts
@apps/strapi/src/extensions/users-permissions/controllers/authController.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Re-throw errors in sendMjmlEmail so callers receive failures</name>
  <files>apps/strapi/src/services/mjml/send-email.ts</files>
  <action>
    In `send-email.ts`, modify the `catch` block to re-throw the error AFTER logging it.
    Currently it catches, logs via `console.error`, and returns `false` — callers have no
    way to know the email failed.

    Change:
    ```typescript
    } catch (error) {
      console.error("Error enviando email MJML:", error);
      return false;
    }
    ```

    To:
    ```typescript
    } catch (error) {
      console.error("Error enviando email MJML:", error);
      throw error;
    }
    ```

    Remove the `return true` at the end (it's unreachable after the throw, but remove for clarity).
    The function return type becomes `Promise<void>` — update the return type annotation if present.

    IMPORTANT: Do NOT change any other logic. Only the catch block behavior changes.
  </action>
  <verify>
    TypeScript check: `yarn workspace @waldo/strapi typecheck` passes (or at minimum
    no new errors on `send-email.ts`).
  </verify>
  <done>
    `sendMjmlEmail` now throws on delivery failure instead of returning `false`.
    All callers (`overrideForgotPassword`, `overrideAuthLocal`, `resendCode`) will
    receive the exception instead of silently continuing.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add strapi.log.error in overrideForgotPassword catch block</name>
  <files>apps/strapi/src/extensions/users-permissions/controllers/authController.ts</files>
  <action>
    In `authController.ts`, update the `overrideForgotPassword` email catch block
    to log the error using `strapi.log.error` so it appears in Strapi's structured logs.

    Find:
    ```typescript
    try {
      await sendMjmlEmail(
        strapi,
        "reset-password",
        user.email,
        "Restablece tu contraseña",
        { name: user.firstname || user.username || user.email, resetUrl }
      );
    } catch (_) {
      // Non-fatal: token is saved; user can request again
    }
    ```

    Replace with:
    ```typescript
    try {
      await sendMjmlEmail(
        strapi,
        "reset-password",
        user.email,
        "Restablece tu contraseña",
        { name: user.firstname || user.username || user.email, resetUrl }
      );
    } catch (err) {
      strapi.log.error(
        `[overrideForgotPassword] Failed to send reset-password email to ${user.email}: ${err?.message ?? err}`
      );
    }
    ```

    The behavior remains non-fatal (token is saved, user can request again), but
    the failure is now visible in Strapi logs. This will immediately reveal whether
    the issue is a Mailgun auth error, a template render error, or something else.

    Do NOT change any other part of `overrideForgotPassword`.
  </action>
  <verify>
    TypeScript check: `yarn workspace @waldo/strapi typecheck` passes.
    Manual test: Submit forgot-password from dashboard → check Strapi logs for
    either successful email delivery (no log line) or a clear error message
    (e.g., "Mailgun API error", "template not found").
  </verify>
  <done>
    `overrideForgotPassword` logs any email delivery failure to Strapi's log output.
    The next time a user submits forgot-password from the dashboard and the email
    doesn't arrive, the Strapi log will show the exact reason.
  </done>
</task>

</tasks>

<verification>
After both tasks:

1. `yarn workspace @waldo/strapi typecheck` — no TypeScript errors
2. Submit a forgot-password request from the dashboard
3. Check Strapi logs:
   - If email delivers successfully: no error log line, email arrives in inbox ✓
   - If email fails: a `[overrideForgotPassword] Failed to send...` line appears with the exact error
4. If an error appears in logs, it reveals the root cause (e.g., Mailgun domain misconfiguration, network issue, template error) for follow-up action
</verification>

<success_criteria>
- `sendMjmlEmail` re-throws on delivery failure (no longer silently returns `false`)
- `overrideForgotPassword` logs failures with `strapi.log.error` including the email address and error message
- Dashboard forgot-password flow now produces either a delivered email or a visible diagnosis in Strapi logs
</success_criteria>

<output>
After completion, create `.planning/quick/37-no-llega-el-correo-de-recuperar-contrase/37-SUMMARY.md`
</output>
