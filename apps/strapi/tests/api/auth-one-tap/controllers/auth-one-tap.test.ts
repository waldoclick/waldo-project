/**
 * auth-one-tap Controller — Unit Tests
 * Requirement: GTAP-06 — endpoint bypasses 2-step, returns { jwt, user } directly
 * AAA pattern — all external dependencies mocked.
 * Wave 0: RED tests — implementation does not exist yet.
 */

// Mock the GoogleOneTapService BEFORE imports
jest.mock("../../../../src/services/google-one-tap", () => ({
  googleOneTapService: {
    verifyCredential: jest.fn(),
    findOrCreateUser: jest.fn(),
  },
}));

// Mock authController import (createUserReservations)
jest.mock(
  "../../../../src/extensions/users-permissions/controllers/authController",
  () => ({
    createUserReservations: jest.fn().mockResolvedValue(undefined),
  })
);

import controller from "../../../../src/api/auth-one-tap/controllers/auth-one-tap";
import { googleOneTapService } from "../../../../src/services/google-one-tap";

// --- Strapi global mock ---
const mockJwtIssue = jest.fn(() => "test-jwt-token");
const mockSanitizeOutput = jest.fn((user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
}));

(global as unknown as Record<string, unknown>).strapi = {
  plugins: {
    "users-permissions": {
      services: { jwt: { issue: mockJwtIssue } },
    },
  },
  contentAPI: {
    sanitize: { output: mockSanitizeOutput },
  },
  getModel: jest.fn().mockReturnValue({}),
  log: { error: jest.fn() },
};

// --- Mock ctx factory ---
const makeCtx = (body: Record<string, unknown> = {}) => ({
  request: { body },
  state: { auth: null },
  body: null as unknown,
  badRequest: jest.fn(),
  unauthorized: jest.fn(),
});

const VALID_PAYLOAD = {
  sub: "google-sub-123",
  email: "alice@example.com",
  given_name: "Alice",
  family_name: "García",
};

const EXISTING_USER = { id: 42, email: "alice@example.com", username: "alice" };

// ─── GTAP-06: 2-step bypass ───────────────────────────────────────────────────

describe("GTAP-06: googleOneTap controller — issues JWT directly (no pendingToken)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns { jwt, user } for a valid credential — NOT { pendingToken, email }", async () => {
    // Arrange
    const mockVerify = googleOneTapService.verifyCredential as jest.Mock;
    const mockFindOrCreate = googleOneTapService.findOrCreateUser as jest.Mock;
    mockVerify.mockResolvedValue(VALID_PAYLOAD);
    mockFindOrCreate.mockResolvedValue({ user: EXISTING_USER, isNew: false });
    const ctx = makeCtx({ credential: "valid-token" });

    // Act
    await controller.googleOneTap(ctx as unknown as import("koa").Context);

    // Assert: response is { jwt, user } — 2-step BYPASSED
    expect(ctx.body).toEqual({
      jwt: "test-jwt-token",
      user: expect.objectContaining({ id: 42, email: "alice@example.com" }),
    });
    expect(ctx.body).not.toHaveProperty("pendingToken");
    expect(ctx.body).not.toHaveProperty("email");
  });

  it("returns 400 when credential is missing from request body", async () => {
    // Arrange
    const ctx = makeCtx({});

    // Act
    await controller.googleOneTap(ctx as unknown as import("koa").Context);

    // Assert
    expect(ctx.badRequest).toHaveBeenCalledWith("credential is required");
  });

  it("returns 401 when Google credential is invalid or expired", async () => {
    // Arrange
    const mockVerify = googleOneTapService.verifyCredential as jest.Mock;
    mockVerify.mockResolvedValue(null); // null = invalid token
    const ctx = makeCtx({ credential: "expired-token" });

    // Act
    await controller.googleOneTap(ctx as unknown as import("koa").Context);

    // Assert
    expect(ctx.unauthorized).toHaveBeenCalledWith(
      expect.stringContaining("Invalid")
    );
  });

  it("calls jwt.issue() with { id: user.id } — Strapi session format", async () => {
    // Arrange
    const mockVerify = googleOneTapService.verifyCredential as jest.Mock;
    const mockFindOrCreate = googleOneTapService.findOrCreateUser as jest.Mock;
    mockVerify.mockResolvedValue(VALID_PAYLOAD);
    mockFindOrCreate.mockResolvedValue({ user: EXISTING_USER, isNew: false });
    const ctx = makeCtx({ credential: "valid-token" });

    // Act
    await controller.googleOneTap(ctx as unknown as import("koa").Context);

    // Assert: exact jwt.issue() call shape
    expect(mockJwtIssue).toHaveBeenCalledWith({ id: EXISTING_USER.id });
  });
});
