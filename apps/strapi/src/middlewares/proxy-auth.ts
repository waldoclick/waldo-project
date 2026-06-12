import { Context } from "koa";
import crypto from "crypto";

// Read valid proxy keys from environment — both web and mobile app keys are accepted
const getValidProxyKeys = (): string[] => {
  const keys = [process.env.PROXY_SECRET_WEB, process.env.PROXY_SECRET_APP];
  return keys.filter((key): key is string => Boolean(key));
};

// Validate the provided key against all valid keys using constant-time comparison
// to prevent timing attacks. Length check must precede timingSafeEqual — it throws
// on unequal buffer lengths.
const isValidProxyKey = (providedKey: string | undefined): boolean => {
  if (!providedKey) return false;

  const validKeys = getValidProxyKeys();
  if (validKeys.length === 0) return false;

  return validKeys.some((validKey) => {
    if (providedKey.length !== validKey.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(providedKey),
      Buffer.from(validKey),
    );
  });
};

export default () => {
  return async (ctx: Context, next: () => Promise<void>) => {
    // Only enforce on /api/* — admin panel paths (/admin, /content-manager,
    // /upload, /content-type-builder, /i18n, etc.) use admin JWTs, not proxy keys
    if (!ctx.path.startsWith("/api")) {
      return next();
    }

    const providedKey = ctx.request.headers["x-proxy-key"] as
      | string
      | undefined;

    if (!providedKey) {
      return ctx.unauthorized("Proxy key is required");
    }

    if (!isValidProxyKey(providedKey)) {
      return ctx.forbidden("Invalid proxy key");
    }

    await next();
  };
};
