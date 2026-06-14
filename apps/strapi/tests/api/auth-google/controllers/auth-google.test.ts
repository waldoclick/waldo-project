/**
 * auth-google Controller — Unit Tests
 * Requirement: APICLIENT-SSR-COOKIE, STRAPI-JSON-MODE (plan 129-03)
 * Tests the ?json=true branch (JSON response) and the default HTML popup branch.
 * AAA pattern — all external dependencies mocked.
 */

// Mock google-auth-library BEFORE imports
jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    generateAuthUrl: jest
      .fn()
      .mockReturnValue("https://accounts.google.com/oauth"),
    getToken: jest.fn(),
  })),
}));

// Mock googleOneTapService BEFORE imports
jest.mock("../../../../src/services/google-one-tap", () => ({
  googleOneTapService: {
    verifyCredential: jest.fn(),
    findOrCreateUser: jest.fn(),
  },
}));

// Mock authController (createUserReservations) to avoid dynamic import resolution
jest.mock(
  "../../../../src/extensions/users-permissions/controllers/authController",
  () => ({
    createUserReservations: jest.fn().mockResolvedValue(undefined),
  }),
);

import { OAuth2Client } from "google-auth-library";
import controller from "../../../../src/api/auth-google/controllers/auth-google";
import { googleOneTapService } from "../../../../src/services/google-one-tap";

// --- Strapi global mock ---
const mockJwtIssue = jest.fn(() => "test-jwt-token");

(global as unknown as Record<string, unknown>).strapi = {
  plugins: {
    "users-permissions": {
      services: { jwt: { issue: mockJwtIssue } },
    },
  },
  log: { error: jest.fn() },
};

// --- OAuth2Client mock helpers ---
let mockGetToken: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.FRONTEND_URL = "http://localhost:3000";
  process.env.GOOGLE_CLIENT_ID = "test-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

  // Wire getToken mock on the OAuth2Client instance
  const MockOAuth2Client = OAuth2Client as jest.MockedClass<
    typeof OAuth2Client
  >;
  mockGetToken = jest.fn();
  MockOAuth2Client.mockImplementation(
    () =>
      ({
        generateAuthUrl: jest
          .fn()
          .mockReturnValue("https://accounts.google.com/oauth"),
        getToken: mockGetToken,
      }) as unknown as OAuth2Client,
  );
});

// --- Test data ---
const VALID_PAYLOAD = {
  sub: "google-sub-123",
  email: "alice@example.com",
  email_verified: true,
  given_name: "Alice",
  family_name: "García",
};

const EXISTING_USER = { id: 42, email: "alice@example.com", username: "alice" };

// --- makeCtx factory ---
// Mirrors the makeCtx pattern from auth-one-tap.test.ts
const makeCtx = (
  overrides: {
    query?: Record<string, unknown>;
    body?: unknown;
  } = {},
) => ({
  query: overrides.query ?? {},
  body: overrides.body ?? undefined,
  type: undefined as string | undefined,
});

// ─── JSON branch (?json=true) ─────────────────────────────────────────────────

describe("auth-google callback: JSON mode (?json=true)", () => {
  it("sets ctx.body = { jwt } and does NOT set ctx.type = 'html' when ?json is set", async () => {
    // Arrange
    const idToken = "valid-id-token";
    mockGetToken.mockResolvedValue({ tokens: { id_token: idToken } });

    const mockVerify = googleOneTapService.verifyCredential as jest.Mock;
    const mockFindOrCreate = googleOneTapService.findOrCreateUser as jest.Mock;
    mockVerify.mockResolvedValue(VALID_PAYLOAD);
    // isNew: false avoids the dynamic createUserReservations import
    mockFindOrCreate.mockResolvedValue({ user: EXISTING_USER, isNew: false });

    const ctx = makeCtx({ query: { code: "auth-code-123", json: "1" } });

    // Act
    await controller.callback(ctx as unknown as import("koa").Context);

    // Assert: JSON path — jwt in body, NOT HTML
    expect(ctx.body).toEqual({ jwt: "test-jwt-token" });
    expect(ctx.type).not.toBe("html");
  });

  it("calls jwt.issue() with { id: user.id } in JSON mode", async () => {
    // Arrange
    mockGetToken.mockResolvedValue({ tokens: { id_token: "valid-token" } });
    const mockVerify = googleOneTapService.verifyCredential as jest.Mock;
    const mockFindOrCreate = googleOneTapService.findOrCreateUser as jest.Mock;
    mockVerify.mockResolvedValue(VALID_PAYLOAD);
    mockFindOrCreate.mockResolvedValue({ user: EXISTING_USER, isNew: false });

    const ctx = makeCtx({ query: { code: "auth-code", json: "1" } });

    // Act
    await controller.callback(ctx as unknown as import("koa").Context);

    // Assert
    expect(mockJwtIssue).toHaveBeenCalledWith({ id: EXISTING_USER.id });
  });
});

// ─── HTML branch (no ?json) ───────────────────────────────────────────────────

describe("auth-google callback: HTML popup mode (no ?json)", () => {
  it("sets ctx.type = 'html' and body contains 'google-oauth-success' when ?json is absent", async () => {
    // Arrange
    mockGetToken.mockResolvedValue({ tokens: { id_token: "valid-token" } });
    const mockVerify = googleOneTapService.verifyCredential as jest.Mock;
    const mockFindOrCreate = googleOneTapService.findOrCreateUser as jest.Mock;
    mockVerify.mockResolvedValue(VALID_PAYLOAD);
    mockFindOrCreate.mockResolvedValue({ user: EXISTING_USER, isNew: false });

    const ctx = makeCtx({ query: { code: "auth-code-123" } });

    // Act
    await controller.callback(ctx as unknown as import("koa").Context);

    // Assert: HTML popup path — ctx.type = 'html', body has BroadcastChannel script
    expect(ctx.type).toBe("html");
    expect(typeof ctx.body).toBe("string");
    expect(ctx.body as string).toContain("google-oauth-success");
    expect(ctx.body as string).toContain("BroadcastChannel");
  });

  it("HTML popup body does NOT expose jwt directly (legacy path, backward compatible)", async () => {
    // Arrange
    mockGetToken.mockResolvedValue({ tokens: { id_token: "valid-token" } });
    const mockVerify = googleOneTapService.verifyCredential as jest.Mock;
    const mockFindOrCreate = googleOneTapService.findOrCreateUser as jest.Mock;
    mockVerify.mockResolvedValue(VALID_PAYLOAD);
    mockFindOrCreate.mockResolvedValue({ user: EXISTING_USER, isNew: false });

    const ctx = makeCtx({ query: { code: "auth-code-123" } });

    // Act
    await controller.callback(ctx as unknown as import("koa").Context);

    // Assert: legacy popup includes jwt in HTML payload (existing behavior preserved)
    expect(ctx.body as string).toContain("test-jwt-token");
  });
});

// ─── Error paths ─────────────────────────────────────────────────────────────

describe("auth-google callback: error paths", () => {
  it("returns HTML error popup when ?code is missing", async () => {
    // Arrange
    const ctx = makeCtx({ query: {} });

    // Act
    await controller.callback(ctx as unknown as import("koa").Context);

    // Assert: error path always returns HTML (no ?json bypass on error)
    expect(ctx.type).toBe("html");
    expect(ctx.body as string).toContain("google-oauth-error");
  });

  it("returns HTML error popup when getToken throws", async () => {
    // Arrange
    mockGetToken.mockRejectedValue(new Error("invalid_grant"));
    const ctx = makeCtx({ query: { code: "bad-code" } });

    // Act
    await controller.callback(ctx as unknown as import("koa").Context);

    // Assert
    expect(ctx.type).toBe("html");
    expect(ctx.body as string).toContain("google-oauth-error");
  });

  it("returns HTML error popup when id_token is missing from tokens", async () => {
    // Arrange
    mockGetToken.mockResolvedValue({ tokens: {} }); // no id_token
    const ctx = makeCtx({ query: { code: "auth-code" } });

    // Act
    await controller.callback(ctx as unknown as import("koa").Context);

    // Assert
    expect(ctx.type).toBe("html");
    expect(ctx.body as string).toContain("google-oauth-error");
  });
});
