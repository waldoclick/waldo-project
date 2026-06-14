import { verifyRecaptchaToken } from "../../../utils/recaptcha";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // reCAPTCHA — this JWT-issuing route bypasses the catch-all's reCAPTCHA (Pitfall 10).
  if (config.recaptchaEnabled) {
    const recaptchaToken = getHeader(event, "x-recaptcha-token");
    await verifyRecaptchaToken(
      recaptchaToken,
      config.recaptchaSecretKey as string,
    );
  }

  const apiUrl = process.env.API_URL || "http://localhost:1337";
  const { access_token } = await readBody<{ access_token: string }>(event);

  const result = await $fetch<{ jwt: string; user: unknown }>(
    `${apiUrl}/api/auth/google/callback?access_token=${encodeURIComponent(access_token)}`,
    { headers: { "X-Proxy-Key": config.proxySecretWeb as string } },
  );

  setCookie(event, "waldo_jwt", result.jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 604800,
  });

  return { user: result.user };
});
