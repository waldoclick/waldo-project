/**
 * Tests for owner-scope helpers — SEC: subscription read scoping.
 *
 * scopeReadToOwner must force filters.user = caller for non-managers and must
 * never let a client-supplied `user` filter widen the scope (IDOR). Managers pass through.
 */

import type { Context } from "koa";
import { isManagerCtx, scopeReadToOwner } from "../../src/utils/owner-scope";

const ctxWith = (state: unknown, query: unknown = {}): Context =>
  ({ state, query }) as unknown as Context;

describe("isManagerCtx", () => {
  it("is true for the manager role (case-insensitive)", () => {
    expect(isManagerCtx(ctxWith({ user: { role: { name: "Manager" } } }))).toBe(
      true,
    );
  });
  it("is false for a normal user", () => {
    expect(isManagerCtx(ctxWith({ user: { role: { name: "user" } } }))).toBe(
      false,
    );
  });
  it("is false when there is no user", () => {
    expect(isManagerCtx(ctxWith({}))).toBe(false);
  });
});

describe("scopeReadToOwner", () => {
  it("forces filters.user to the caller and strips a client-supplied user filter", () => {
    const ctx = ctxWith(
      { user: { id: 7, role: { name: "user" } } },
      { filters: { user: 99, payment_method: "webpay" } },
    );

    scopeReadToOwner(ctx);

    const filters = (ctx.query as { filters: Record<string, unknown> }).filters;
    expect(filters.user).toBe(7); // caller, not 99
    expect(filters.payment_method).toBe("webpay"); // legit filter preserved
    expect(JSON.stringify(filters)).not.toContain("99");
  });

  it("also blocks a nested filters[user][id] override", () => {
    const ctx = ctxWith(
      { user: { id: 7, role: { name: "user" } } },
      { filters: { user: { id: 99 } } },
    );

    scopeReadToOwner(ctx);

    const filters = (ctx.query as { filters: Record<string, unknown> }).filters;
    expect(filters.user).toBe(7);
    expect(JSON.stringify(filters)).not.toContain("99");
  });

  it("scopes to the caller when no filters are supplied", () => {
    const ctx = ctxWith({ user: { id: 7, role: { name: "user" } } }, {});
    scopeReadToOwner(ctx);
    expect(
      (ctx.query as { filters: Record<string, unknown> }).filters.user,
    ).toBe(7);
  });

  it("leaves the query untouched for managers", () => {
    const original = { filters: { payment_method: "webpay" } };
    const ctx = ctxWith(
      { user: { id: 1, role: { name: "manager" } } },
      original,
    );
    scopeReadToOwner(ctx);
    expect(ctx.query).toBe(original); // unchanged reference
  });
});
