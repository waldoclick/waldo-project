// protect-user-fields.test.ts

import type { Context } from "koa";
import type { Core } from "@strapi/strapi";
import protectUserFields from "../../src/middlewares/protect-user-fields";

function createMiddleware() {
  return protectUserFields({}, { strapi: {} as unknown as Core.Strapi });
}

function createContext(
  method: string,
  path: string,
  body: Record<string, unknown>
) {
  return {
    request: {
      method,
      path,
      body,
    },
  };
}

describe("protect-user-fields middleware", () => {
  // Test 1: strips pro_status field, keeps firstname
  it("strips pro_status from body.data when PUT /api/users/:id, keeps safe fields", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/users/123", {
      data: { pro_status: "active", firstname: "Alice" },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).not.toHaveProperty("pro_status");
    expect(ctx.request.body.data).toHaveProperty("firstname", "Alice");
    expect(next).toHaveBeenCalled();
  });

  // Test 2: strips pro_status, pro_expires_at, tbk_user — keeps lastname
  it("strips pro_status, pro_expires_at, tbk_user from body.data, keeps lastname", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/users/123", {
      data: {
        pro_status: "active",
        pro_expires_at: "2026-01-01",
        tbk_user: "token123",
        lastname: "Smith",
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).not.toHaveProperty("pro_status");
    expect(ctx.request.body.data).not.toHaveProperty("pro_expires_at");
    expect(ctx.request.body.data).not.toHaveProperty("tbk_user");
    expect(ctx.request.body.data).toHaveProperty("lastname", "Smith");
    expect(next).toHaveBeenCalled();
  });

  // Test 3: strips username, avatar, cover — keeps phone
  it("strips username, avatar, cover from body.data, keeps phone", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/users/123", {
      data: { username: "hack", avatar: 5, cover: 3, phone: "123" },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).not.toHaveProperty("username");
    expect(ctx.request.body.data).not.toHaveProperty("avatar");
    expect(ctx.request.body.data).not.toHaveProperty("cover");
    expect(ctx.request.body.data).toHaveProperty("phone", "123");
    expect(next).toHaveBeenCalled();
  });

  // Test 4: strips role, provider, confirmed, blocked — keeps address
  it("strips role, provider, confirmed, blocked from body.data, keeps address", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/users/123", {
      data: {
        role: 1,
        provider: "local",
        confirmed: true,
        blocked: true,
        address: "Main St",
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).not.toHaveProperty("role");
    expect(ctx.request.body.data).not.toHaveProperty("provider");
    expect(ctx.request.body.data).not.toHaveProperty("confirmed");
    expect(ctx.request.body.data).not.toHaveProperty("blocked");
    expect(ctx.request.body.data).toHaveProperty("address", "Main St");
    expect(next).toHaveBeenCalled();
  });

  // Test 5: GET /api/users/me does not trigger middleware
  it("does NOT strip fields for GET /api/users/me", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("GET", "/api/users/me", {
      data: { pro_status: "active" },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).toHaveProperty("pro_status", "active");
    expect(next).toHaveBeenCalled();
  });

  // Test 6: only safe fields pass through unchanged
  it("passes all safe fields through unmodified", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/users/456", {
      data: {
        firstname: "Bob",
        lastname: "Jones",
        phone: "555-1234",
        address: "42 Elm St",
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).toEqual({
      firstname: "Bob",
      lastname: "Jones",
      phone: "555-1234",
      address: "42 Elm St",
    });
    expect(next).toHaveBeenCalled();
  });

  // Test 7: always calls next()
  it("always calls next() even when stripping fields", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/users/123", {
      data: { pro_status: "active" },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  // Test 8: card enrollment fields — still protected even though canonical source moved to subscription-pro
  it("strips pro_card_type, pro_card_last4, pro_inscription_token from body.data (card fields remain protected)", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/users/123", {
      data: {
        pro_card_type: "Visa",
        pro_card_last4: "1234",
        pro_inscription_token: "insc-token-abc",
        firstname: "Alice",
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body.data).not.toHaveProperty("pro_card_type");
    expect(ctx.request.body.data).not.toHaveProperty("pro_card_last4");
    expect(ctx.request.body.data).not.toHaveProperty("pro_inscription_token");
    expect(ctx.request.body.data).toHaveProperty("firstname", "Alice");
    expect(next).toHaveBeenCalled();
  });

  // Test 9: complete PROTECTED_USER_FIELDS list — all 13 fields are stripped
  it("strips all 13 protected fields: pro_status, pro_expires_at, tbk_user, pro_card_type, pro_card_last4, pro_inscription_token, username, avatar, cover, role, provider, confirmed, blocked", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/users/123", {
      data: {
        pro_status: "active",
        pro_expires_at: "2026-05-01",
        tbk_user: "tok",
        pro_card_type: "Visa",
        pro_card_last4: "4321",
        pro_inscription_token: "insc",
        username: "hack",
        avatar: 5,
        cover: 3,
        role: 1,
        provider: "local",
        confirmed: true,
        blocked: false,
        phone: "555-0000",
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    const protectedFields = [
      "pro_status",
      "pro_expires_at",
      "tbk_user",
      "pro_card_type",
      "pro_card_last4",
      "pro_inscription_token",
      "username",
      "avatar",
      "cover",
      "role",
      "provider",
      "confirmed",
      "blocked",
    ];
    for (const field of protectedFields) {
      expect(ctx.request.body.data).not.toHaveProperty(field);
    }
    // Safe field is preserved
    expect(ctx.request.body.data).toHaveProperty("phone", "555-0000");
    expect(next).toHaveBeenCalled();
  });

  // Test 10: body without data wrapper — strips from body directly
  it("strips protected fields from body directly when no data wrapper", async () => {
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/users/123", {
      firstname: "Alice",
      pro_status: "active",
    });
    const next = jest.fn().mockResolvedValue(undefined);

    await middleware(ctx as unknown as Context, next);

    expect(ctx.request.body).not.toHaveProperty("pro_status");
    expect(ctx.request.body).toHaveProperty("firstname", "Alice");
    expect(next).toHaveBeenCalled();
  });
});
