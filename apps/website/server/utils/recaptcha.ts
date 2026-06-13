// apps/website/server/utils/recaptcha.ts
import { createError } from "h3";

const RECAPTCHA_PROTECTED_METHODS = new Set(["POST", "PUT", "DELETE"]);

// SEC2-AUTH: expose for tests and proxy middleware
export const RECAPTCHA_PROTECTED_ROUTES = [
  "auth/local",
  "auth/local/register",
  "auth/forgot-password",
  "auth/reset-password",
  "contacts",
];

/**
 * Verifies a reCAPTCHA v3 token against Google's siteverify API.
 * Throws createError(400) if token is missing, invalid, score <= 0.5,
 * or the hostname is not in the RECAPTCHA_ALLOWED_HOSTNAMES allowlist.
 *
 * SEC2-AUTH: hostname binding guards against token replay across sites.
 * Action binding (verifying response.action === expected) requires the
 * frontend to pass the action name — deferred to a follow-up (see SUMMARY).
 */
export async function verifyRecaptchaToken(
  token: string | null | undefined,
  secretKey: string,
): Promise<void> {
  if (!token || !token.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Security verification failed. Please try again.",
    });
  }

  const result = await $fetch<{
    success: boolean;
    score: number;
    hostname?: string;
    action?: string;
    "error-codes"?: string[];
  }>("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }).toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!result.success || result.score <= 0.5) {
    console.warn(
      `[recaptcha] Verification failed. success=${result.success}, score=${result.score ?? "n/a"}, error-codes=${(result["error-codes"] ?? []).join(",")}`,
    );
    throw createError({
      statusCode: 400,
      statusMessage: "reCAPTCHA verification failed. Please try again.",
    });
  }

  // SEC2-AUTH: hostname allowlist — reject tokens issued by disallowed origins
  const allowedHostnames = (
    process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? "waldo.click,www.waldo.click"
  ).split(",");
  if (!allowedHostnames.includes(result.hostname ?? "")) {
    console.warn(
      `[recaptcha] Hostname mismatch. hostname=${result.hostname}, allowed=${allowedHostnames.join(",")}`,
    );
    throw createError({
      statusCode: 400,
      statusMessage: "Security verification failed. Please try again.",
    });
  }
}

export function isRecaptchaProtectedRoute(
  _fullPath: string,
  method: string,
): boolean {
  return RECAPTCHA_PROTECTED_METHODS.has(method.toUpperCase());
}
