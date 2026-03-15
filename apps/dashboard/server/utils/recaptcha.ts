// apps/dashboard/server/utils/recaptcha.ts
// Dashboard only protects auth routes — no contacts or public registration
import { createError } from "h3";

export const RECAPTCHA_PROTECTED_ROUTES = [
  "auth/local",
  "auth/forgot-password",
  "auth/reset-password",
] as const;

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

  const result = await $fetch<{ success: boolean; score: number }>(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }).toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );

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
