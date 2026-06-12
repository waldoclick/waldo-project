declare module "koa2-ratelimit" {
  import type { Context, Next } from "koa";

  type KoaMiddleware = (ctx: Context, next: Next) => Promise<void>;

  interface RateLimitOptions {
    interval?: { min?: number; hour?: number; day?: number; ms?: number };
    max?: number;
    message?: string;
    headers?: boolean;
    keyGenerator?: (ctx: Context) => string;
  }

  export const RateLimit: {
    middleware(options: RateLimitOptions): KoaMiddleware;
  };
}
