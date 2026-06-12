/**
 * ad.ts — JWT decode block unit tests (SEC2-AUTH)
 * Requirements: SEC2-AUTH — remove hardcoded JWT fallback secret
 * AAA pattern — all external dependencies mocked.
 * Wave 0: RED tests — verifies the plugin JWT service is used, no fallback secret.
 */

// ─── Mock jsonwebtoken (must NOT be called with fallback secret) ──────────────
const mockJwtVerify = jest.fn();
jest.mock("jsonwebtoken", () => ({
  verify: mockJwtVerify,
}));

// ─── Mock sanitizeAdForPublic ─────────────────────────────────────────────────
jest.mock("../../../src/api/ad/services/sanitize-ad", () => ({
  sanitizeAdForPublic: jest.fn((ad: Record<string, unknown>) => ({
    ...ad,
    sanitized: true,
  })),
}));

// ─── Capture the controller extension via factories mock ──────────────────────
let capturedExtension: Record<string, (..._args: unknown[]) => unknown> = {};
jest.mock("@strapi/strapi", () => ({
  factories: {
    createCoreController: jest.fn(
      (_uid: string, fn: (..._args: unknown[]) => unknown) => {
        capturedExtension = fn({
          strapi: (global as unknown as { strapi: object }).strapi,
        }) as Record<string, (..._args: unknown[]) => unknown>;
        return capturedExtension;
      },
    ),
  },
}));

// ─── Strapi global mock with users-permissions JWT service ───────────────────
const mockPluginJwtVerify = jest.fn();
const mockFindBySlug = jest.fn();
const mockLogError = jest.fn();

(global as unknown as { strapi: object }).strapi = {
  service: jest.fn().mockReturnValue({ findBySlug: mockFindBySlug }),
  log: { error: mockLogError },
  plugins: {
    "users-permissions": {
      services: {
        jwt: {
          verify: mockPluginJwtVerify,
        },
      },
    },
  },
};

// ─── Import controller (triggers jest.mock side effects) ──────────────────────
import "../../../src/api/ad/controllers/ad";

// ─── Build a mock Koa context ──────────────────────────────────────────────────
function makeCtx(overrides: Partial<object> = {}) {
  return {
    params: { slug: "test-slug" },
    request: { headers: {} },
    notFound: jest.fn(),
    internalServerError: jest.fn(),
    send: jest.fn(),
    ...overrides,
  };
}

describe("SEC2-AUTH: ad.ts JWT decode — plugin JWT service, no fallback secret", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.JWT_SECRET;
    // Default: service returns a non-null result (focus is on JWT decode, not 404)
    mockFindBySlug.mockResolvedValue({
      ad: { id: 1, title: "Test" },
      access: { role: "public" },
    });
  });

  it("calls strapi.plugins['users-permissions'].services.jwt.verify with the bearer token", async () => {
    // Arrange
    mockPluginJwtVerify.mockReturnValue({ id: 42 });
    const ctx = makeCtx({
      request: {
        headers: { authorization: "Bearer valid-token" },
      },
    });

    // Act
    await capturedExtension.findBySlug(ctx);

    // Assert — plugin JWT service called with the token
    expect(mockPluginJwtVerify).toHaveBeenCalledWith("valid-token");
  });

  it("does NOT call jwt.verify (jsonwebtoken) with 'strapi-jwt-secret' fallback", async () => {
    // Arrange — JWT_SECRET is unset; plugin verify throws (invalid token)
    mockPluginJwtVerify.mockImplementation(() => {
      throw new Error("invalid token");
    });
    const ctx = makeCtx({
      request: {
        headers: { authorization: "Bearer arbitrary-token" },
      },
    });

    // Act
    await capturedExtension.findBySlug(ctx);

    // Assert — the OLD hardcoded fallback MUST NOT be used
    expect(mockJwtVerify).not.toHaveBeenCalledWith(
      expect.anything(),
      "strapi-jwt-secret",
    );
  });

  it("yields userId = null when plugin JWT verify throws (invalid/unverifiable token)", async () => {
    // Arrange — invalid token → plugin throws
    mockPluginJwtVerify.mockImplementation(() => {
      throw new Error("invalid signature");
    });
    // Service should still be called (with null userId); spy on what userId reaches findBySlug
    let capturedUserId: number | null | undefined = undefined;
    mockFindBySlug.mockImplementation(
      (_slug: string, userId: number | null) => {
        capturedUserId = userId;
        return Promise.resolve(null); // → notFound
      },
    );
    const ctx = makeCtx({
      request: {
        headers: { authorization: "Bearer bad-token" },
      },
    });

    // Act
    await capturedExtension.findBySlug(ctx);

    // Assert — userId must be null (not a number from a forged token)
    expect(capturedUserId).toBeNull();
  });

  it("yields userId = null when no authorization header is present", async () => {
    // Arrange
    let capturedUserId: number | null | undefined = undefined;
    mockFindBySlug.mockImplementation(
      (_slug: string, userId: number | null) => {
        capturedUserId = userId;
        return Promise.resolve(null);
      },
    );
    const ctx = makeCtx({ request: { headers: {} } });

    // Act
    await capturedExtension.findBySlug(ctx);

    // Assert
    expect(capturedUserId).toBeNull();
    expect(mockPluginJwtVerify).not.toHaveBeenCalled();
  });
});
