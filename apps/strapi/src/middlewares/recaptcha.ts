import GoogleServices from "../services/google";
import { Context } from "koa";
import crypto from "crypto";

const protectedPostPaths = [
  "/api/contacts",
  "/api/auth/local", // Ruta de login de Strapi
  "/api/auth/local/register", // Ruta de registro de Strapi
  "/api/auth/forgot-password", // Ruta de recuperación de contraseña
  "/api/auth/reset-password", // Ruta de reset de contraseña
  "/api/payments/pack", // Ruta de pago de packs
];

const protectedPutPaths = [
  // "/api/users/me", // Ruta de actualización de perfil
];

// Get valid mobile app API keys from environment
const getValidMobileApiKeys = (): string[] => {
  const keysEnv = process.env.MOBILE_APP_API_KEYS;
  if (!keysEnv) return [];
  return keysEnv
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
};

// Validate mobile app API key using constant-time comparison to prevent timing attacks
const isValidMobileApiKey = (providedKey: string | undefined): boolean => {
  if (!providedKey) return false;

  const validKeys = getValidMobileApiKeys();
  if (validKeys.length === 0) return false;

  return validKeys.some((validKey) => {
    if (providedKey.length !== validKey.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(providedKey),
      Buffer.from(validKey)
    );
  });
};

// Check if request comes from mobile app with valid API key
const isMobileAppRequest = (ctx: Context): boolean => {
  const apiKey = ctx.request.headers["x-mobile-app-api-key"];
  return isValidMobileApiKey(apiKey as string);
};

const shouldVerifyRecaptcha = (ctx: Context): boolean => {
  // Skip recaptcha for mobile app requests with valid API key
  if (isMobileAppRequest(ctx)) {
    return false;
  }

  if (ctx.method === "POST") {
    return protectedPostPaths.includes(ctx.path);
  }
  if (ctx.method === "PUT") {
    return protectedPutPaths.includes(ctx.path);
  }
  return false;
};

const getRecaptchaToken = (ctx: Context): string | undefined => {
  // Para endpoints personalizados que usan data
  const dataToken = ctx.request.body?.data?.recaptchaToken;
  if (dataToken) return dataToken;

  // Para el login y registro de Strapi que usa el body directamente
  return ctx.request.body?.recaptchaToken;
};

const removeRecaptchaToken = (ctx: Context): void => {
  // Eliminar de data si existe
  if (ctx.request.body?.data?.recaptchaToken) {
    delete ctx.request.body.data.recaptchaToken;
  }
  // Eliminar del body directo si existe
  if (ctx.request.body?.recaptchaToken) {
    delete ctx.request.body.recaptchaToken;
  }
};

export default () => {
  return async (ctx: Context, next: () => Promise<void>) => {
    if (!shouldVerifyRecaptcha(ctx)) {
      return next();
    }

    const recaptchaToken = getRecaptchaToken(ctx);

    if (!recaptchaToken) {
      return ctx.badRequest("reCAPTCHA token is required");
    }

    const isValidRecaptcha = await GoogleServices.recaptcha.verifyToken(
      recaptchaToken
    );
    if (!isValidRecaptcha) {
      return ctx.badRequest("Security verification failed. Please try again.");
    }

    // Eliminar el token después de validarlo
    removeRecaptchaToken(ctx);

    await next();
  };
};
