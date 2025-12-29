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
const CACHE_CONFIG = {
  default: 3600,
  "/api/connect": 1,
  "/api/payments": 1,
  "/api/user": 1,
  "/api/ads": 1,
  "/api/indicators": 3600,
  "/api/filter": 60,
  "/api/related": 60,
  "/api/regions": 86400,
  "/api/communes": 86400,
  "/api/conditions": 86400,
  "/api/categories": 86400,
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
    url.includes("/callback") || // No cachear callbacks de auth
    url.includes("/uploads")
  )
    return true;

  const fileExtensions =
    /\.(jpg|jpeg|png|gif|svg|pdf|doc|docx|xls|xlsx|zip|rar)$/i;
  return fileExtensions.test(url);
};

const handleRedisOperation = async (operation: () => Promise<any>) => {
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
        const baseUrl = ctx.url.split("?")[0];
        await handleRedisOperation(async () => {
          const keys = await redis?.keys(`cache:*${baseUrl}*`);
          if (keys?.length) {
            await redis?.del(...keys);
          }
        });
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
      ctx.body = JSON.parse(cachedResponse);
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
