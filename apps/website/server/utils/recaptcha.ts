// apps/website/server/utils/recaptcha.ts
import { createError } from "h3";

export const RECAPTCHA_PROTECTED_ROUTES = [
  "auth/local",
  "auth/local/register",
  "auth/forgot-password",
  "auth/reset-password",
  "contacts",
] as const;

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
    throw createError({
      statusCode: 400,
      statusMessage: "reCAPTCHA verification failed. Please try again.",
    });
  }
}

export function isRecaptchaProtectedRoute(
  fullPath: string,
  method: string,
): boolean {
  if (method !== "POST") return false;
  return RECAPTCHA_PROTECTED_ROUTES.some((route) => fullPath.startsWith(route));
}
