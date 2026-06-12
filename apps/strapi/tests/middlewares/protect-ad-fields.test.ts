// protect-ad-fields.test.ts

import type { Context } from "koa";
import type { Core } from "@strapi/strapi";
import protectAdFields from "../../src/middlewares/protect-ad-fields";

function createMiddleware() {
  return protectAdFields({}, { strapi: {} as unknown as Core.Strapi });
}

function createContext(
  method: string,
  path: string,
  body: Record<string, unknown>,
) {
  return {
    request: {
      method,
      path,
      body,
    },
  };
}

describe("protect-ad-fields middleware", () => {
  // Test 1: strips is_paid and active from body.data on POST /api/ads, keeps name
  it("strips is_paid and active from body.data on POST /api/ads, keeps name", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("POST", "/api/ads", {
      data: { is_paid: true, active: true, name: "My ad" },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).not.toHaveProperty("is_paid");
    expect(ctx.request.body.data).not.toHaveProperty("active");
    expect(ctx.request.body.data).toHaveProperty("name", "My ad");
    expect(next).toHaveBeenCalled();
  });

  // Test 2: strips draft, banned, rejected from body.data on PUT /api/ads/123, keeps price
  it("strips draft, banned, rejected from body.data on PUT /api/ads/123, keeps price", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/ads/123", {
      data: { draft: false, banned: true, rejected: true, price: "1000" },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).not.toHaveProperty("draft");
    expect(ctx.request.body.data).not.toHaveProperty("banned");
    expect(ctx.request.body.data).not.toHaveProperty("rejected");
    expect(ctx.request.body.data).toHaveProperty("price", "1000");
    expect(next).toHaveBeenCalled();
  });

  // Test 3: strips remaining_days, duration_days, actived_by, user on POST, keeps description
  it("strips remaining_days, duration_days, actived_by, user on POST, keeps description", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("POST", "/api/ads", {
      data: {
        remaining_days: 99,
        duration_days: 99,
        actived_by: 1,
        user: 7,
        description: "desc",
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).not.toHaveProperty("remaining_days");
    expect(ctx.request.body.data).not.toHaveProperty("duration_days");
    expect(ctx.request.body.data).not.toHaveProperty("actived_by");
    expect(ctx.request.body.data).not.toHaveProperty("user");
    expect(ctx.request.body.data).toHaveProperty("description", "desc");
    expect(next).toHaveBeenCalled();
  });

  // Test 4: strips protected fields from flat body (no data wrapper) on POST
  it("strips protected fields from flat body (no data wrapper) on POST", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("POST", "/api/ads", {
      is_paid: true,
      name: "Flat",
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body).not.toHaveProperty("is_paid");
    expect(ctx.request.body).toHaveProperty("name", "Flat");
    expect(next).toHaveBeenCalled();
  });

  // Test 5: strips all nine protected fields on PUT /api/ads/456
  it("strips all nine protected fields on PUT /api/ads/456, preserves name", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/ads/456", {
      data: {
        active: true,
        is_paid: true,
        banned: true,
        rejected: true,
        remaining_days: 30,
        duration_days: 30,
        draft: false,
        actived_by: 1,
        user: 2,
        name: "Test Ad",
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    const protectedFields = [
      "active",
      "is_paid",
      "banned",
      "rejected",
      "remaining_days",
      "duration_days",
      "draft",
      "actived_by",
      "user",
    ];
    for (const field of protectedFields) {
      expect(ctx.request.body.data).not.toHaveProperty(field);
    }
    expect(ctx.request.body.data).toHaveProperty("name", "Test Ad");
    expect(next).toHaveBeenCalled();
  });

  // Test 6: passes normal fields through unchanged
  it("passes normal fields through unchanged", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("POST", "/api/ads", {
      data: { name: "Bike", description: "Nice", price: "500" },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).toEqual({
      name: "Bike",
      description: "Nice",
      price: "500",
    });
    expect(next).toHaveBeenCalled();
  });

  // Test 7: does NOT strip on GET /api/ads
  it("does NOT strip on GET /api/ads", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("GET", "/api/ads", {
      data: { is_paid: true },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).toHaveProperty("is_paid", true);
    expect(next).toHaveBeenCalled();
  });

  // Test 8: does NOT strip on sub-path POST /api/ads/draft
  it("does NOT strip on sub-path POST /api/ads/draft", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("POST", "/api/ads/draft", {
      data: { is_paid: true },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).toHaveProperty("is_paid", true);
    expect(next).toHaveBeenCalled();
  });

  // Test 9: does NOT strip on sub-path PUT /api/ads/123/approve
  it("does NOT strip on sub-path PUT /api/ads/123/approve", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/ads/123/approve", {
      data: { active: true },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).toHaveProperty("active", true);
    expect(next).toHaveBeenCalled();
  });

  // Test 10: strips on PUT with trailing slash /api/ads/123/
  it("strips on PUT with trailing slash /api/ads/123/", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/ads/123/", {
      data: { is_paid: true, name: "X" },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).not.toHaveProperty("is_paid");
    expect(ctx.request.body.data).toHaveProperty("name", "X");
    expect(next).toHaveBeenCalled();
  });
});
