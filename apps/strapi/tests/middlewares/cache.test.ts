import type { Context } from "koa";

const mockRedisInstance = {
  connect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  keys: jest.fn(),
  del: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
};

jest.mock("ioredis", () =>
  jest.fn().mockImplementation(() => mockRedisInstance),
);

describe("cache middleware — Content Manager write invalidation", () => {
  let cacheMiddlewareFactory: typeof import("../../src/middlewares/cache").default;

  const buildCtx = (overrides: Partial<Context>): Context =>
    ({
      method: "GET",
      url: "/api/ad-packs",
      query: {},
      response: { set: jest.fn() },
      status: 200,
      body: undefined,
      ...overrides,
    }) as unknown as Context;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockRedisInstance.keys.mockResolvedValue(["cache:GET:/api/ad-packs:{}"]);

    Object.assign(global, {
      strapi: {
        contentTypes: {
          "api::ad-pack.ad-pack": { info: { pluralName: "ad-packs" } },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cacheMiddlewareFactory = require("../../src/middlewares/cache").default;
  });

  // Arrange, Act, Assert
  it("invalidates the public REST cache when Content Manager updates a collection", async () => {
    const middleware = cacheMiddlewareFactory();
    const ctx = buildCtx({
      method: "PUT",
      url: "/content-manager/collection-types/api::ad-pack.ad-pack/abc123",
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(mockRedisInstance.keys).toHaveBeenCalledWith(
      "cache:*:/api/ad-packs*",
    );
    expect(mockRedisInstance.del).toHaveBeenCalledWith(
      "cache:GET:/api/ad-packs:{}",
    );
  });

  it("does not attempt invalidation when the content type UID is unknown", async () => {
    const middleware = cacheMiddlewareFactory();
    const ctx = buildCtx({
      method: "PUT",
      url: "/content-manager/collection-types/api::unknown.unknown/abc123",
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(mockRedisInstance.del).not.toHaveBeenCalled();
  });

  it("still skips caching for Content Manager GET requests", async () => {
    const middleware = cacheMiddlewareFactory();
    const ctx = buildCtx({
      method: "GET",
      url: "/content-manager/collection-types/api::ad-pack.ad-pack",
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(mockRedisInstance.get).not.toHaveBeenCalled();
    expect(mockRedisInstance.del).not.toHaveBeenCalled();
  });
});
