import Redis from "ioredis";
import { Context } from "koa";

let redis: Redis | null = null;
let isConnecting = false;

const initRedis = async () => {
  if (redis || isConnecting) return;

  try {
    isConnecting = true;
    console.log("[Redis] Initializing connection...");

    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      // Isolates environments that share one Redis server. Cache keys are built
      // from method+url+query only, so prod and staging would otherwise collide
      // on the same `cache:GET:/api/ads:...` entries. A separate DB index also
      // keeps the KEYS/DEL invalidation scans scoped to this environment.
      db: Number(process.env.REDIS_DB) || 0,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.error("[Redis] Max retries reached, giving up");
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    redis.on("error", (err) => {
      console.error("[Redis] Error:", err);
      redis = null;
    });

    redis.on("connect", () => {
      console.log("[Redis] Connected successfully");
    });

    redis.on("close", () => {
      console.log("[Redis] Connection closed");
      redis = null;
    });

    // Intentar conectar
    await redis.connect();
    console.log("[Redis] Connection established");
  } catch (error) {
    console.error("[Redis] Failed to initialize:", error);
    redis = null;
  } finally {
    isConnecting = false;
  }
};

const DEFAULT_TTL = Number(process.env.REDIS_TTL) || 3600 * 4;

const getCacheTTL = (): number => DEFAULT_TTL;

const generateCacheKey = (ctx: Context): string => {
  return `cache:${ctx.method}:${ctx.url}:${JSON.stringify(ctx.query)}`;
};

// These /api/ads/* routes return per-user or per-auth-state data (ownership
// filters via ctx.state.user, or auth-conditional contact-info visibility) —
// caching them by URL+query alone serves one requester's response to every
// other requester who hits the same path (e.g. /api/ads/count takes no
// query params at all, so every user collided on the exact same cache key).
const PERSONALIZED_AD_PREFIXES = [
  "/api/ads/count",
  "/api/ads/actives",
  "/api/ads/pendings",
  "/api/ads/archiveds",
  "/api/ads/banneds",
  "/api/ads/rejecteds",
  "/api/ads/drafts",
  "/api/ads/thankyou",
  "/api/ads/slug",
];

// GET /api/ads/:id (core findOne) hides phone/email for unauthenticated
// requests — same cross-requester leak if a cached authenticated response
// is later served to an anonymous visitor. In Strapi v5 `:id` is the
// alphanumeric documentId, not just a numeric id, so this must match ANY
// single-segment id — matching only `\d+` left `/api/ads/<documentId>`
// cacheable and leaking contact info. The only single-segment GET under
// /api/ads that IS safe to cache is the public catalog; everything else with
// one trailing segment is treated as the personalized findOne and excluded.
const AD_DETAIL_PATTERN = /^\/api\/ads\/([^/?]+)(\?.*)?$/;
const CACHEABLE_AD_SINGLE_SEGMENTS = new Set(["catalog"]);

const matchesPathPrefix = (url: string, prefix: string): boolean =>
  url === prefix ||
  url.startsWith(`${prefix}/`) ||
  url.startsWith(`${prefix}?`);

const shouldNotCache = (url: string): boolean => {
  if (!url.startsWith("/api/")) return true;
  if (
    url.startsWith("/api/admin") ||
    url.startsWith("/api/connect") ||
    url.startsWith("/api/auth") ||
    url.startsWith("/api/orders") ||
    url.startsWith("/api/users") ||
    url.startsWith("/api/payments")
  )
    return true;
  if (PERSONALIZED_AD_PREFIXES.some((prefix) => matchesPathPrefix(url, prefix)))
    return true;
  const adDetail = url.match(AD_DETAIL_PATTERN);
  if (adDetail && !CACHEABLE_AD_SINGLE_SEGMENTS.has(adDetail[1])) return true;
  return false;
};

const handleRedisOperation = async (operation: () => Promise<unknown>) => {
  if (!redis) {
    await initRedis();
  }

  if (!redis) {
    console.error("[Redis] No connection available");
    return null;
  }

  try {
    return await operation();
  } catch (error) {
    console.error("[Redis] Operation failed:", error);
    return null;
  }
};

const invalidateCollectionCache = async (url: string) => {
  const segments = url.split("?")[0].split("/");
  const collectionBase = "/" + segments.slice(1, 3).join("/");
  await handleRedisOperation(async () => {
    const keys = await redis?.keys(`cache:*:${collectionBase}*`);
    if (keys?.length) {
      await redis?.del(...keys);
    }
  });
};

// Admin (Content Manager) writes hit /content-manager/collection-types/<uid>/...,
// never /api/<pluralName>/... — shouldNotCache() skips those requests entirely,
// so without this they never invalidate the public REST API cache.
const invalidateForContentManagerWrite = async (url: string) => {
  const match = url.match(/^\/content-manager\/collection-types\/([^/]+)/);
  const uid = match?.[1];
  if (!uid) return;

  const contentType = strapi.contentTypes[uid];
  const pluralName = contentType?.info?.pluralName;
  if (!pluralName) return;

  await handleRedisOperation(async () => {
    const keys = await redis?.keys(`cache:*:/api/${pluralName}*`);
    if (keys?.length) {
      await redis?.del(...keys);
    }
  });
};

export default () => {
  return async (ctx: Context, next: () => Promise<void>) => {
    // Header de prueba para confirmar que el middleware se ejecuta
    ctx.response.set("X-Cache-Middleware", "active");

    // Si no hay Redis, inicializar
    if (!redis) {
      await initRedis();
    }

    // Escrituras desde el panel de administración (Content Manager) — nunca se
    // cachean, pero SÍ deben invalidar el cache público de esa colección.
    if (
      ctx.url.startsWith("/content-manager/collection-types/") &&
      ["POST", "PUT", "DELETE", "PATCH"].includes(ctx.method)
    ) {
      await next();
      await invalidateForContentManagerWrite(ctx.url);
      return;
    }

    // Rutas que no deben cachearse (admin, content-manager, auth, etc.)
    // Este guard debe ejecutarse ANTES de establecer cualquier header Cache-Control
    if (shouldNotCache(ctx.url)) {
      return await next();
    }

    // Desde aquí, la ruta es cacheable — cache en Redis + CDN, nunca en browser
    if (ctx.method === "GET" || ctx.method === "HEAD") {
      const ttl = getCacheTTL();
      // no-store: browser nunca cachea (evita data stale en dashboard)
      // s-maxage: CDN (Cloudflare) puede cachear por TTL
      ctx.response.set("Cache-Control", `no-store, s-maxage=${ttl}`);
      ctx.response.set("X-Cache", "MISS");
    }

    // Si aún no hay Redis después de inicializar, skip Redis cache pero mantener headers HTTP
    if (!redis) {
      console.error("[Cache] Redis not available, skipping Redis cache");
      return await next();
    }

    // Para métodos no-GET/HEAD, invalidar cache y continuar
    if (ctx.method !== "GET" && ctx.method !== "HEAD") {
      if (["POST", "PUT", "DELETE", "PATCH"].includes(ctx.method)) {
        await invalidateCollectionCache(ctx.url);
      }
      return await next();
    }

    // Intentar obtener de cache
    const key = generateCacheKey(ctx);
    const cachedResponse = await handleRedisOperation(async () =>
      redis?.get(key),
    );

    if (cachedResponse) {
      ctx.body = JSON.parse(cachedResponse as string);
      const ttl = getCacheTTL();
      ctx.response.set("Cache-Control", `no-store, s-maxage=${ttl}`);
      ctx.response.set("X-Cache", "HIT");
      return;
    }

    // Si no hay en cache, ejecutar y guardar
    await next();

    // Solo guardar en caché si la respuesta fue exitosa
    if (ctx.status === 200 && ctx.body) {
      await handleRedisOperation(async () => {
        const ttl = getCacheTTL();
        await redis?.set(key, JSON.stringify(ctx.body), "EX", ttl);
      });
    }
  };
};
