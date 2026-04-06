/**
 * Tests for findBySlug controller handler — STRP-01
 * Verifies that unexpected DB errors return ctx.internalServerError (no stack trace),
 * null results return ctx.notFound, and happy paths return ctx.send.
 */

// ─── Mock jsonwebtoken (no real JWT needed) ──────────────────────────────────
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn().mockReturnValue({ id: 42 }),
}));

// ─── Mock sanitizeAdForPublic ────────────────────────────────────────────────
jest.mock("../../../../src/api/ad/services/sanitize-ad", () => ({
  sanitizeAdForPublic: jest.fn((ad: Record<string, unknown>) => ({
    ...ad,
    sanitized: true,
  })),
}));

// ─── Capture the controller extension via factories mock ─────────────────────
let capturedExtension: Record<string, (..._args: unknown[]) => unknown> = {};
jest.mock("@strapi/strapi", () => ({
  factories: {
    createCoreController: jest.fn(
      (_uid: string, fn: (..._args: unknown[]) => unknown) => {
        capturedExtension = fn({
          strapi: (global as unknown as { strapi: object }).strapi,
        }) as Record<string, (..._args: unknown[]) => unknown>;
        return capturedExtension;
      }
    ),
  },
}));

// ─── Mock strapi global ───────────────────────────────────────────────────────
const mockFindBySlug = jest.fn();
const mockLogError = jest.fn();

(global as unknown as { strapi: object }).strapi = {
  service: jest.fn().mockReturnValue({ findBySlug: mockFindBySlug }),
  log: { error: mockLogError },
};

// ─── Import controller (triggers jest.mock side effects) ─────────────────────
import "../../../../src/api/ad/controllers/ad";
import { sanitizeAdForPublic } from "../../../../src/api/ad/services/sanitize-ad";

// ─── Build a mock Koa context ─────────────────────────────────────────────────
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

describe("findBySlug controller handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns notFound when service resolves null", async () => {
    // Arrange
    mockFindBySlug.mockResolvedValueOnce(null);
    const ctx = makeCtx();

    // Act
    await capturedExtension.findBySlug(ctx);

    // Assert
    expect(ctx.notFound).toHaveBeenCalledWith("Ad not found or access denied");
    expect(ctx.send).not.toHaveBeenCalled();
    expect(ctx.internalServerError).not.toHaveBeenCalled();
  });

  it("returns internalServerError and logs when service throws", async () => {
    // Arrange
    const dbError = new Error("DB failure");
    mockFindBySlug.mockRejectedValueOnce(dbError);
    const ctx = makeCtx();

    // Act
    await capturedExtension.findBySlug(ctx);

    // Assert
    expect(ctx.internalServerError).toHaveBeenCalledWith(
      "Internal server error"
    );
    expect(mockLogError).toHaveBeenCalled();
    expect(ctx.send).not.toHaveBeenCalled();
  });

  it("returns ctx.send with full ad for manager role", async () => {
    // Arrange
    const managerResult = {
      ad: { id: 1, title: "Test Ad" },
      access: { role: "manager" },
    };
    mockFindBySlug.mockResolvedValueOnce(managerResult);
    const ctx = makeCtx();

    // Act
    await capturedExtension.findBySlug(ctx);

    // Assert
    expect(ctx.send).toHaveBeenCalledWith({
      data: managerResult.ad,
      access: managerResult.access,
    });
    expect(ctx.notFound).not.toHaveBeenCalled();
    expect(ctx.internalServerError).not.toHaveBeenCalled();
  });

  it("calls sanitizeAdForPublic for non-manager role", async () => {
    // Arrange
    const publicResult = {
      ad: { id: 2, title: "Public Ad" },
      access: { role: "public" },
    };
    mockFindBySlug.mockResolvedValueOnce(publicResult);
    const ctx = makeCtx();

    // Act
    await capturedExtension.findBySlug(ctx);

    // Assert
    expect(jest.mocked(sanitizeAdForPublic)).toHaveBeenCalledWith(
      publicResult.ad
    );
    expect(ctx.send).toHaveBeenCalled();
    expect(ctx.notFound).not.toHaveBeenCalled();
  });
});
