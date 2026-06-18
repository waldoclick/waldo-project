/**
 * Tests for the five per-channel reveal controller handlers (08-04).
 *
 * AAA pattern. Verifies:
 *   - anonymous (no/invalid Bearer) → ctx.unauthorized (401)
 *   - authed ad-keyed reveal → returns the seller's real channel + records contact
 *     (phone/whatsapp → "call", email → "message")
 *   - authed seller-keyed reveal → returns real channel and does NOT record a contact
 *   - unknown documentId → ctx.notFound
 */

// ─── Mock sanitizeAdForPublic (imported by the controller module) ────────────
jest.mock("../../../src/api/ad/services/sanitize-ad", () => ({
  sanitizeAdForPublic: jest.fn((ad: Record<string, unknown>) => ad),
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
      },
    ),
  },
}));

// ─── Mock strapi global ──────────────────────────────────────────────────────
const mockJwtVerify = jest.fn();
const mockAdFindOne = jest.fn();
const mockUserFindOne = jest.fn();
const mockRecordContact = jest.fn().mockResolvedValue(undefined);

(global as unknown as { strapi: object }).strapi = {
  plugins: {
    "users-permissions": { services: { jwt: { verify: mockJwtVerify } } },
  },
  db: {
    query: jest.fn((uid: string) => {
      if (uid === "api::ad.ad") return { findOne: mockAdFindOne };
      if (uid === "plugin::users-permissions.user")
        return { findOne: mockUserFindOne };
      return { findOne: jest.fn() };
    }),
  },
  service: jest.fn((uid: string) => {
    if (uid === "api::ad-contact.ad-contact")
      return { recordContact: mockRecordContact };
    return {};
  }),
  log: { error: jest.fn() },
};

// ─── Import controller (triggers factory capture) ────────────────────────────
import "../../../src/api/ad/controllers/ad";

// ─── Mock Koa context ────────────────────────────────────────────────────────
function makeCtx(overrides: Record<string, unknown> = {}) {
  return {
    params: {},
    request: { headers: {}, ip: "1.2.3.4" },
    unauthorized: jest.fn(),
    notFound: jest.fn(),
    send: jest.fn(),
    throw: jest.fn(),
    ...overrides,
  } as unknown as Record<string, jest.Mock> & {
    params: Record<string, string>;
    request: { headers: Record<string, string>; ip: string };
  };
}

const BEARER = { authorization: "Bearer valid-token" };

describe("reveal controller handlers (08-04)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockJwtVerify.mockResolvedValue({ id: 99 });
  });

  it("revealAdPhone returns 401 for an anonymous viewer (no Bearer)", async () => {
    // Arrange
    const ctx = makeCtx({ params: { documentId: "ad-1" } });

    // Act
    await capturedExtension.revealAdPhone(ctx);

    // Assert
    expect(ctx.unauthorized).toHaveBeenCalled();
    expect(mockAdFindOne).not.toHaveBeenCalled();
    expect(mockRecordContact).not.toHaveBeenCalled();
  });

  it("revealAdPhone returns the seller's real phone and records a 'call' contact", async () => {
    // Arrange
    mockAdFindOne.mockResolvedValueOnce({
      id: 5,
      documentId: "ad-1",
      user: { phone: "+56 9 1234 5678", whatsapp: "x", email: "a@b.cl" },
    });
    const ctx = makeCtx({
      params: { documentId: "ad-1" },
      request: { headers: { ...BEARER }, ip: "1.2.3.4" },
    });

    // Act
    await capturedExtension.revealAdPhone(ctx);

    // Assert
    expect(ctx.send).toHaveBeenCalledWith({
      data: { channel: "phone", value: "+56 9 1234 5678" },
    });
    expect(mockRecordContact).toHaveBeenCalledWith(
      "ad-1",
      "call",
      "1.2.3.4",
      expect.any(String),
    );
  });

  it("revealAdEmail records a 'message' contact and returns the seller email", async () => {
    // Arrange
    mockAdFindOne.mockResolvedValueOnce({
      id: 5,
      documentId: "ad-1",
      user: { email: "gabriel@waldo.cl" },
    });
    const ctx = makeCtx({
      params: { documentId: "ad-1" },
      request: { headers: { ...BEARER }, ip: "1.2.3.4" },
    });

    // Act
    await capturedExtension.revealAdEmail(ctx);

    // Assert
    expect(ctx.send).toHaveBeenCalledWith({
      data: { channel: "email", value: "gabriel@waldo.cl" },
    });
    expect(mockRecordContact).toHaveBeenCalledWith(
      "ad-1",
      "message",
      "1.2.3.4",
      expect.any(String),
    );
  });

  it("revealAdPhone returns notFound for an unknown documentId", async () => {
    // Arrange
    mockAdFindOne.mockResolvedValueOnce(null);
    const ctx = makeCtx({
      params: { documentId: "missing" },
      request: { headers: { ...BEARER }, ip: "1.2.3.4" },
    });

    // Act
    await capturedExtension.revealAdPhone(ctx);

    // Assert
    expect(ctx.notFound).toHaveBeenCalled();
    expect(ctx.send).not.toHaveBeenCalled();
    expect(mockRecordContact).not.toHaveBeenCalled();
  });

  it("revealSellerPhone returns the real phone and does NOT record a contact", async () => {
    // Arrange
    mockUserFindOne.mockResolvedValueOnce({ phone: "+56 9 1111 2222" });
    const ctx = makeCtx({
      params: { username: "gabo" },
      request: { headers: { ...BEARER }, ip: "1.2.3.4" },
    });

    // Act
    await capturedExtension.revealSellerPhone(ctx);

    // Assert
    expect(ctx.send).toHaveBeenCalledWith({
      data: { channel: "phone", value: "+56 9 1111 2222" },
    });
    expect(mockRecordContact).not.toHaveBeenCalled();
  });

  it("revealSellerWhatsapp returns 401 for an anonymous viewer", async () => {
    // Arrange
    const ctx = makeCtx({ params: { username: "gabo" } });

    // Act
    await capturedExtension.revealSellerWhatsapp(ctx);

    // Assert
    expect(ctx.unauthorized).toHaveBeenCalled();
    expect(mockUserFindOne).not.toHaveBeenCalled();
  });
});
