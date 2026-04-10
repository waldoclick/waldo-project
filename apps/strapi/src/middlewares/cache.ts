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

// Configuración de TTL por ruta
const ONE_HOUR = 3600;
const ONE_DAY = ONE_HOUR * 24;
const ONE_MINUTE = 60;

const CACHE_CONFIG: Record<string, number> = {
  default: ONE_HOUR * 4,

  // Mantenedores — rarely change, active invalidation on edit
  "/api/categories": ONE_DAY,
  "/api/conditions": ONE_DAY,
  "/api/ad-packs": ONE_DAY,
  "/api/regions": ONE_DAY,
  "/api/communes": ONE_DAY,
  "/api/faqs": ONE_DAY,
  "/api/policies": ONE_DAY,
  "/api/terms": ONE_DAY,

  // High-traffic, frequently changing
  "/api/ads": ONE_MINUTE,

  // Analytics/indicators — moderate freshness
  "/api/indicators": ONE_HOUR,
};

const getCacheTTL = (url: string): number => {
  const matchingRoute = Object.keys(CACHE_CONFIG)
    .filter((route) => url.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  return matchingRoute ? CACHE_CONFIG[matchingRoute] : CACHE_CONFIG.default;
};

const generateCacheKey = (ctx: Context): string => {
  return `cache:${ctx.method}:${ctx.url}:${JSON.stringify(ctx.query)}`;
};

const shouldNotCache = (url: string): boolean => {
  if (
    url.startsWith("/api/admin") ||
    url.startsWith("/admin") || // No cachear admin panel
    url.startsWith("/content-manager") ||
    url.startsWith("/api/connect") || // No cachear rutas de autenticación
    url.startsWith("/api/auth") || // No cachear rutas de auth
    url.startsWith("/api/orders") || // No cachear órdenes
    url.startsWith("/api/users") || // No cachear datos de usuario (user-specific)
    url.includes("/callback") || // No cachear callbacks de auth
    url.includes("/uploads")
  )
    return true;

  const fileExtensions =
    /\.(jpg|jpeg|png|gif|svg|pdf|doc|docx|xls|xlsx|zip|rar)$/i;
  return fileExtensions.test(url);
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

export default () => {
  return async (ctx: Context, next: () => Promise<void>) => {
    // Header de prueba para confirmar que el middleware se ejecuta
    ctx.response.set("X-Cache-Middleware", "active");

    // Si no hay Redis, inicializar
    if (!redis) {
      await initRedis();
    }

    // Si aún no hay Redis después de inicializar, skip Redis cache pero mantener headers HTTP
    if (!redis) {
      console.error("[Cache] Redis not available, skipping Redis cache");
      // Solo para métodos GET y HEAD, agregar headers de cache
      if (ctx.method === "GET" || ctx.method === "HEAD") {
        const ttl = getCacheTTL(ctx.url);
        ctx.response.set(
          "Cache-Control",
          `public, max-age=${ttl}, s-maxage=${ttl}`
        );
        ctx.response.set("X-Cache", "MISS");
      }
      return await next();
    }

    // Establecer headers de cache SIEMPRE para métodos GET y HEAD
    if (ctx.method === "GET" || ctx.method === "HEAD") {
      const ttl = getCacheTTL(ctx.url);
      ctx.response.set(
        "Cache-Control",
        `public, max-age=${ttl}, s-maxage=${ttl}`
      );
      ctx.response.set("X-Cache", "MISS");
    }

    // Si no debemos cachear esta ruta, continuar
    if (shouldNotCache(ctx.url)) {
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
      redis?.get(key)
    );

    console.log("cachedResponse", cachedResponse);

    if (cachedResponse) {
      ctx.body = JSON.parse(cachedResponse as string);
      const ttl = getCacheTTL(ctx.url);
      ctx.response.set(
        "Cache-Control",
        `public, max-age=${ttl}, s-maxage=${ttl}`
      );
      ctx.response.set("X-Cache", "HIT");
      return;
    }

    // Si no hay en cache, ejecutar y guardar
    await next();

    // Solo guardar en caché si la respuesta fue exitosa
    if (ctx.status === 200 && ctx.body) {
      const ttl = getCacheTTL(ctx.url);
      ctx.response.set(
        "Cache-Control",
        `public, max-age=${ttl}, s-maxage=${ttl}`
      );
      ctx.response.set("X-Cache", "MISS");

      await handleRedisOperation(async () => {
        await redis?.set(key, JSON.stringify(ctx.body), "EX", ttl);
      });
    }
  };
};
