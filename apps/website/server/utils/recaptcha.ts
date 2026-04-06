// apps/website/server/utils/recaptcha.ts
import { createError } from "h3";

const RECAPTCHA_PROTECTED_METHODS = new Set(["POST", "PUT", "DELETE"]);

/**
 * Verifies a reCAPTCHA v3 token against Google's siteverify API.
 * Throws createError(400) if token is missing, invalid, or score <= 0.5.
 */
export async function verifyRecaptchaToken(
  token: string | null | undefined,
  secretKey: string,
): Promise<void> {
  if (!token || !token.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "reCAPTCHA token is required",
    });
  }

  const result = await $fetch<{
    success: boolean;
    score: number;
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
}

export function isRecaptchaProtectedRoute(
  _fullPath: string,
  method: string,
): boolean {
  return RECAPTCHA_PROTECTED_METHODS.has(method.toUpperCase());
}
