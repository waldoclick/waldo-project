import { verifyRecaptchaToken } from "../../utils/recaptcha";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // reCAPTCHA — this route bypasses the catch-all's reCAPTCHA (Pitfall 10).
  if (config.recaptchaEnabled) {
    const recaptchaToken = getHeader(event, "x-recaptcha-token");
    await verifyRecaptchaToken(
      recaptchaToken,
      config.recaptchaSecretKey as string,
    );
  }

  const apiUrl = process.env.API_URL || "http://localhost:1337";
  const body = await readBody(event);

  const strapiResponse = await $fetch<{ jwt: string; user: unknown }>(
    `${apiUrl}/api/auth/google-one-tap`,
    {
      method: "POST",
      body,
      headers: { "X-Proxy-Key": config.proxySecretWeb as string },
    },
  );

  // jwt NEVER returned to client
  setCookie(event, "waldo_jwt", strapiResponse.jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 604800,
  });

  return { user: strapiResponse.user };
});
