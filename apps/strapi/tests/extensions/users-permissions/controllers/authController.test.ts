// Tests for overrideAuthLocal — VSTEP-01, VSTEP-02, VSTEP-03
// Tests for verifyCode — VSTEP-04, VSTEP-05
// Tests for resendCode — VSTEP-07
// AAA pattern (Arrange-Act-Assert), all dependencies mocked.

import {
  overrideAuthLocal,
  verifyCode,
  resendCode,
  overrideForgotPassword,
  registerUserLocal,
} from "../authController";

// --- Mock sendMjmlEmail ---
jest.mock("../../../../services/mjml", () => ({
  sendMjmlEmail: jest.fn().mockResolvedValue(undefined),
}));
import { sendMjmlEmail } from "../../../../services/mjml";
const mockSendMjmlEmail = sendMjmlEmail as jest.MockedFunction<
  typeof sendMjmlEmail
>;

// --- Mock crypto.randomUUID and randomBytes ---
jest.mock("crypto", () => ({
  ...jest.requireActual("crypto"),
  randomUUID: jest.fn(() => "test-pending-token-uuid"),
  randomBytes: jest.fn(() =>
    Buffer.from("test-reset-token-hex-64-bytes-padded-to-correct-length!!!!!!!")
  ),
}));

// --- Strapi DB mock factories ---
const mockVCCreate = jest.fn();
const mockVCFindOne = jest.fn();
const mockVCUpdate = jest.fn();
const mockVCDelete = jest.fn();

const mockUserFindOne = jest.fn();
const mockUserUpdate = jest.fn();
const mockJwtIssue = jest.fn(() => "test-jwt-token");
const mockSanitizeOutput = jest.fn((user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
}));

const strapiQueryMock = (contentType: string) => {
  if (contentType === "api::verification-code.verification-code") {
    return {
      create: mockVCCreate,
      findOne: mockVCFindOne,
      update: mockVCUpdate,
      delete: mockVCDelete,
    };
  }
  if (contentType === "plugin::users-permissions.user") {
    return { findOne: mockUserFindOne, update: mockUserUpdate };
  }
  return {};
};

(global as unknown as Record<string, unknown>).strapi = {
  db: { query: strapiQueryMock },
  plugins: {
    "users-permissions": {
      services: {
        jwt: { issue: mockJwtIssue },
        user: { sanitizeOutput: mockSanitizeOutput },
      },
    },
  },
};

// Helper to build a mock ctx
const buildCtx = (body: Record<string, unknown> = {}) => ({
  request: { body },
  response: { body: null as unknown },
  body: null as unknown,
  send: jest.fn((data: unknown) => {
    result.body = data;
    return undefined;
  }),
  badRequest: jest.fn((msg: string) => {
    const ctx = result;
    ctx.body = { error: { status: 400, message: msg } };
    return undefined;
  }),
  unauthorized: jest.fn((msg: string) => {
    const ctx = result;
    ctx.body = { error: { status: 401, message: msg } };
    return undefined;
  }),
  internalServerError: jest.fn((msg: string) => {
    const ctx = result;
    ctx.body = { error: { status: 500, message: msg } };
    return undefined;
  }),
  status: 200 as number,
});

// Needed for the helper self-reference
let result: ReturnType<typeof buildCtx>;
const makeCtx = (body: Record<string, unknown> = {}) => {
  result = buildCtx(body);
  return result;
};

describe("overrideAuthLocal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVCFindOne.mockResolvedValue(null); // no existing record
    mockVCCreate.mockResolvedValue({ id: 1 });
    mockSendMjmlEmail.mockResolvedValue(undefined);
  });

  describe("VSTEP-01: Valid credentials — returns pendingToken + email, no JWT", () => {
    it("intercepts valid login and returns { pendingToken, email } instead of JWT", async () => {
      // Arrange
      const originalController = jest.fn(async (ctx) => {
        ctx.response.body = {
          jwt: "original-jwt",
          user: {
            id: 10,
            email: "user@example.com",
            username: "user10",
            firstname: "Alice",
          },
        };
      });
      const ctx = makeCtx({});

      // Act
      const handler = overrideAuthLocal(originalController);
      await handler(ctx);

      // Assert: response is pendingToken + email (no JWT)
      expect(ctx.body).toEqual({
        pendingToken: "test-pending-token-uuid",
        email: "user@example.com",
      });
      expect(ctx.body as Record<string, unknown>).not.toHaveProperty("jwt");
    });

    it("creates a verification-code record with correct fields", async () => {
      // Arrange
      const originalController = jest.fn(async (ctx) => {
        ctx.response.body = {
          jwt: "original-jwt",
          user: {
            id: 10,
            email: "user@example.com",
            username: "user10",
            firstname: "Alice",
          },
        };
      });
      const ctx = makeCtx({});

      // Act
      const handler = overrideAuthLocal(originalController);
      await handler(ctx);

      // Assert: DB create called with correct shape
      expect(mockVCCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 10,
            code: expect.stringMatching(/^\d{6}$/),
            attempts: 0,
            pendingToken: "test-pending-token-uuid",
          }),
        })
      );
      // expiresAt is a future datetime string
      const callData = mockVCCreate.mock.calls[0][0].data;
      expect(new Date(callData.expiresAt).getTime()).toBeGreaterThan(
        Date.now()
      );
    });

    it("calls sendMjmlEmail with correct arguments", async () => {
      // Arrange
      const originalController = jest.fn(async (ctx) => {
        ctx.response.body = {
          jwt: "original-jwt",
          user: {
            id: 10,
            email: "user@example.com",
            username: "user10",
            firstname: "Alice",
          },
        };
      });
      const ctx = makeCtx({});

      // Act
      const handler = overrideAuthLocal(originalController);
      await handler(ctx);

      // Assert
      expect(mockSendMjmlEmail).toHaveBeenCalledWith(
        expect.anything(), // strapi
        "verification-code",
        "user@example.com",
        "Tu código de verificación",
        expect.objectContaining({
          name: "Alice",
          code: expect.stringMatching(/^\d{6}$/),
        })
      );
    });

    it("deletes existing pending record for same userId before creating new one", async () => {
      // Arrange
      mockVCFindOne.mockResolvedValue({
        id: 99,
        userId: 10,
        pendingToken: "old-token",
      });
      const originalController = jest.fn(async (ctx) => {
        ctx.response.body = {
          jwt: "original-jwt",
          user: { id: 10, email: "user@example.com", username: "user10" },
        };
      });
      const ctx = makeCtx({});

      // Act
      const handler = overrideAuthLocal(originalController);
      await handler(ctx);

      // Assert: old record deleted, new one created
      expect(mockVCDelete).toHaveBeenCalledWith({ where: { id: 99 } });
      expect(mockVCCreate).toHaveBeenCalled();
    });
  });

  describe("VSTEP-02: Invalid credentials — pass through original error unchanged", () => {
    it("does not intercept when original controller sets no JWT", async () => {
      // Arrange
      const originalController = jest.fn(async (ctx) => {
        ctx.response.body = {
          error: { status: 400, message: "Invalid credentials" },
        };
        ctx.status = 400;
      });
      const ctx = makeCtx({});

      // Act
      const handler = overrideAuthLocal(originalController);
      await handler(ctx);

      // Assert: response is unchanged error, no DB operations, no email
      expect(mockVCCreate).not.toHaveBeenCalled();
      expect(mockSendMjmlEmail).not.toHaveBeenCalled();
      // body not replaced
      expect(ctx.body).toBeNull(); // overrideAuthLocal returned early without setting ctx.body
    });
  });

  describe("Email failures are non-fatal", () => {
    it("still returns { pendingToken, email } even if sendMjmlEmail throws", async () => {
      // Arrange
      mockSendMjmlEmail.mockRejectedValueOnce(new Error("SMTP error"));
      const originalController = jest.fn(async (ctx) => {
        ctx.response.body = {
          jwt: "jwt",
          user: { id: 5, email: "e@x.com", username: "u5" },
        };
      });
      const ctx = makeCtx({});

      // Act — should not throw
      const handler = overrideAuthLocal(originalController);
      await expect(handler(ctx)).resolves.not.toThrow();

      // Assert: response still set
      expect(ctx.body).toEqual({
        pendingToken: "test-pending-token-uuid",
        email: "e@x.com",
      });
    });
  });
});

describe("verifyCode", () => {
  const futureDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const pastDate = new Date(Date.now() - 1000).toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("VSTEP-04: Valid pendingToken + correct code → returns { jwt, user }", () => {
    it("returns full login response on correct code", async () => {
      // Arrange
      mockVCFindOne.mockResolvedValue({
        id: 1,
        userId: 10,
        code: "123456",
        expiresAt: futureDate,
        attempts: 0,
      });
      mockUserFindOne.mockResolvedValue({
        id: 10,
        email: "user@example.com",
        username: "user10",
      });
      const ctx = makeCtx({ pendingToken: "valid-token", code: "123456" });

      // Act
      await verifyCode(ctx);

      // Assert: returns jwt + sanitized user
      expect(ctx.body).toEqual({
        jwt: "test-jwt-token",
        user: { id: 10, email: "user@example.com", username: "user10" },
      });
    });

    it("deletes the verification-code record after successful verification", async () => {
      // Arrange
      mockVCFindOne.mockResolvedValue({
        id: 1,
        userId: 10,
        code: "123456",
        expiresAt: futureDate,
        attempts: 0,
      });
      mockUserFindOne.mockResolvedValue({
        id: 10,
        email: "u@e.com",
        username: "u",
      });
      const ctx = makeCtx({ pendingToken: "valid-token", code: "123456" });

      // Act
      await verifyCode(ctx);

      // Assert
      expect(mockVCDelete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe("VSTEP-05: Wrong code → increments attempts; 3 failures → 401 + record deleted", () => {
    it("increments attempts on wrong code (below max)", async () => {
      // Arrange
      mockVCFindOne.mockResolvedValue({
        id: 1,
        userId: 10,
        code: "999999",
        expiresAt: futureDate,
        attempts: 1,
      });
      const ctx = makeCtx({ pendingToken: "valid-token", code: "000000" });

      // Act
      await verifyCode(ctx);

      // Assert: attempts incremented, record NOT deleted
      expect(mockVCUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: { attempts: 2 } })
      );
      expect(mockVCDelete).not.toHaveBeenCalled();
      expect(ctx.unauthorized).toHaveBeenCalledWith("Invalid code");
    });

    it("deletes record and returns 401 when max attempts (3) reached", async () => {
      // Arrange
      mockVCFindOne.mockResolvedValue({
        id: 1,
        userId: 10,
        code: "999999",
        expiresAt: futureDate,
        attempts: 2, // next failure → 3
      });
      const ctx = makeCtx({ pendingToken: "valid-token", code: "000000" });

      // Act
      await verifyCode(ctx);

      // Assert: record deleted on third failure
      expect(mockVCDelete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockVCUpdate).not.toHaveBeenCalled();
      expect(ctx.unauthorized).toHaveBeenCalledWith(
        "Maximum attempts reached — please login again"
      );
    });
  });

  describe("Expired code → 401 + record deleted", () => {
    it("returns 401 and deletes record when code is expired", async () => {
      // Arrange
      mockVCFindOne.mockResolvedValue({
        id: 1,
        userId: 10,
        code: "123456",
        expiresAt: pastDate,
        attempts: 0,
      });
      const ctx = makeCtx({ pendingToken: "valid-token", code: "123456" });

      // Act
      await verifyCode(ctx);

      // Assert
      expect(mockVCDelete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(ctx.unauthorized).toHaveBeenCalledWith(
        "Verification code has expired"
      );
    });
  });

  describe("Unknown pendingToken → 400", () => {
    it("returns 400 when pendingToken not found", async () => {
      // Arrange
      mockVCFindOne.mockResolvedValue(null);
      const ctx = makeCtx({ pendingToken: "nonexistent", code: "123456" });

      // Act
      await verifyCode(ctx);

      // Assert
      expect(ctx.badRequest).toHaveBeenCalledWith("Invalid or expired token");
    });

    it("returns 400 when pendingToken or code missing from request", async () => {
      // Arrange
      const ctx = makeCtx({ pendingToken: "token-only" }); // no code

      // Act
      await verifyCode(ctx);

      // Assert
      expect(ctx.badRequest).toHaveBeenCalledWith(
        "pendingToken and code are required"
      );
    });
  });
});

describe("resendCode", () => {
  const futureDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMjmlEmail.mockResolvedValue(undefined);
  });

  describe("VSTEP-07: Valid pendingToken within 60s → 429 (rate limited)", () => {
    it("returns 429 if last update was less than 60 seconds ago", async () => {
      // Arrange: updatedAt = now (within window)
      const recentDate = new Date(Date.now() - 10 * 1000).toISOString(); // 10s ago
      mockVCFindOne.mockResolvedValue({
        id: 1,
        userId: 10,
        code: "111111",
        expiresAt: futureDate,
        attempts: 0,
        updatedAt: recentDate,
      });
      const ctx = makeCtx({ pendingToken: "valid-token" });

      // Act
      await resendCode(ctx);

      // Assert: 429 returned, no update/email
      expect(ctx.status).toBe(429);
      expect(ctx.body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({ status: 429 }),
        })
      );
      expect(mockVCUpdate).not.toHaveBeenCalled();
      expect(mockSendMjmlEmail).not.toHaveBeenCalled();
    });
  });

  describe("VSTEP-07: Valid pendingToken after 60s → sends new code", () => {
    it("replaces code + expiresAt + resets attempts, sends email, returns { ok: true }", async () => {
      // Arrange: updatedAt = 2 minutes ago (outside cooldown)
      const oldDate = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      mockVCFindOne.mockResolvedValue({
        id: 1,
        userId: 10,
        code: "111111",
        expiresAt: futureDate,
        attempts: 1,
        updatedAt: oldDate,
      });
      mockUserFindOne.mockResolvedValue({
        id: 10,
        email: "user@example.com",
        username: "user10",
        firstname: "Bob",
      });
      const ctx = makeCtx({ pendingToken: "valid-token" });

      // Act
      await resendCode(ctx);

      // Assert: record updated with new code, reset attempts
      expect(mockVCUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: expect.stringMatching(/^\d{6}$/),
            attempts: 0,
          }),
        })
      );
      // expiresAt is a future date
      const updateData = mockVCUpdate.mock.calls[0][0].data;
      expect(new Date(updateData.expiresAt).getTime()).toBeGreaterThan(
        Date.now()
      );

      // Assert: email sent
      expect(mockSendMjmlEmail).toHaveBeenCalledWith(
        expect.anything(),
        "verification-code",
        "user@example.com",
        "Tu código de verificación",
        expect.objectContaining({
          name: "Bob",
          code: expect.stringMatching(/^\d{6}$/),
        })
      );

      // Assert: response is { ok: true }
      expect(ctx.body).toEqual({ ok: true });
    });
  });

  describe("Unknown pendingToken → 400", () => {
    it("returns 400 when pendingToken not found", async () => {
      // Arrange
      mockVCFindOne.mockResolvedValue(null);
      const ctx = makeCtx({ pendingToken: "ghost-token" });

      // Act
      await resendCode(ctx);

      // Assert
      expect(ctx.badRequest).toHaveBeenCalledWith("Invalid or expired token");
    });

    it("returns 400 when pendingToken missing from request", async () => {
      // Arrange
      const ctx = makeCtx({}); // no pendingToken

      // Act
      await resendCode(ctx);

      // Assert
      expect(ctx.badRequest).toHaveBeenCalledWith("pendingToken is required");
    });
  });
});

describe("overrideForgotPassword", () => {
  const testUser = {
    id: 42,
    email: "user@example.com",
    username: "user42",
    firstname: "Carlos",
    blocked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMjmlEmail.mockResolvedValue(undefined);
    process.env.FRONTEND_URL = "https://waldo.click";
    process.env.DASHBOARD_URL = "https://dashboard.waldo.click";
  });

  afterEach(() => {
    delete process.env.FRONTEND_URL;
    delete process.env.DASHBOARD_URL;
  });

  describe("PWDR-01: sends MJML email (not two, not zero)", () => {
    it("calls sendMjmlEmail exactly once with reset-password template", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue(testUser);
      mockUserUpdate.mockResolvedValue(testUser);
      const ctx = makeCtx({ email: "user@example.com", context: "website" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      expect(mockSendMjmlEmail).toHaveBeenCalledTimes(1);
      expect(mockSendMjmlEmail).toHaveBeenCalledWith(
        expect.anything(),
        "reset-password",
        "user@example.com",
        "Restablece tu contraseña",
        expect.objectContaining({
          name: "Carlos",
          resetUrl: expect.stringContaining("token="),
        })
      );
    });

    it("returns { ok: true } after sending email", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue(testUser);
      mockUserUpdate.mockResolvedValue(testUser);
      const ctx = makeCtx({ email: "user@example.com", context: "website" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      expect(ctx.body).toEqual({ ok: true });
    });
  });

  describe("PWDR-01: email send failure is non-fatal", () => {
    it("returns { ok: true } even when sendMjmlEmail throws", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue(testUser);
      mockUserUpdate.mockResolvedValue(testUser);
      mockSendMjmlEmail.mockRejectedValueOnce(new Error("SMTP failure"));
      const ctx = makeCtx({ email: "user@example.com", context: "website" });

      // Act
      const handler = overrideForgotPassword();
      await expect(handler(ctx)).resolves.not.toThrow();

      // Assert
      expect(ctx.body).toEqual({ ok: true });
    });
  });

  describe("PWDR-02: context 'website' → resetUrl uses FRONTEND_URL + restablecer-contrasena", () => {
    it("builds correct website reset URL", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue(testUser);
      mockUserUpdate.mockResolvedValue(testUser);
      const ctx = makeCtx({ email: "user@example.com", context: "website" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      const callArgs = mockSendMjmlEmail.mock.calls[0][4] as Record<
        string,
        string
      >;
      expect(callArgs.resetUrl).toContain("https://waldo.click");
      expect(callArgs.resetUrl).toContain("restablecer-contrasena");
      expect(callArgs.resetUrl).toContain("token=");
    });
  });

  describe("PWDR-03: context 'dashboard' → resetUrl uses DASHBOARD_URL + auth/reset-password", () => {
    it("builds correct dashboard reset URL", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue(testUser);
      mockUserUpdate.mockResolvedValue(testUser);
      const ctx = makeCtx({ email: "user@example.com", context: "dashboard" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      const callArgs = mockSendMjmlEmail.mock.calls[0][4] as Record<
        string,
        string
      >;
      expect(callArgs.resetUrl).toContain("https://dashboard.waldo.click");
      expect(callArgs.resetUrl).toContain("auth/reset-password");
      expect(callArgs.resetUrl).toContain("token=");
    });
  });

  describe("PWDR-01: unknown/blocked user → silent { ok: true }, no email", () => {
    it("returns { ok: true } silently for unknown email (user not found)", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue(null);
      const ctx = makeCtx({ email: "ghost@example.com", context: "website" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      expect(mockSendMjmlEmail).not.toHaveBeenCalled();
      expect(mockUserUpdate).not.toHaveBeenCalled();
      expect(ctx.body).toEqual({ ok: true });
    });

    it("returns { ok: true } silently for blocked user", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue({ ...testUser, blocked: true });
      const ctx = makeCtx({ email: "user@example.com", context: "website" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      expect(mockSendMjmlEmail).not.toHaveBeenCalled();
      expect(mockUserUpdate).not.toHaveBeenCalled();
      expect(ctx.body).toEqual({ ok: true });
    });
  });

  describe("PWDR-01: token saved to DB before email sent", () => {
    it("calls userUpdate before sendMjmlEmail", async () => {
      // Arrange
      const callOrder: string[] = [];
      mockUserFindOne.mockResolvedValue(testUser);
      mockUserUpdate.mockImplementation(async () => {
        callOrder.push("update");
        return testUser;
      });
      mockSendMjmlEmail.mockImplementation(async () => {
        callOrder.push("email");
      });
      const ctx = makeCtx({ email: "user@example.com", context: "website" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      expect(callOrder).toEqual(["update", "email"]);
    });

    it("saves resetPasswordToken to DB with correct shape", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue(testUser);
      mockUserUpdate.mockResolvedValue(testUser);
      const ctx = makeCtx({ email: "user@example.com", context: "website" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: testUser.id },
          data: expect.objectContaining({
            resetPasswordToken: expect.any(String),
          }),
        })
      );
    });
  });

  describe("PWDR-02/03: missing context defaults to website URL", () => {
    it("defaults to FRONTEND_URL path when context is undefined", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue(testUser);
      mockUserUpdate.mockResolvedValue(testUser);
      const ctx = makeCtx({ email: "user@example.com" }); // no context

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      const callArgs = mockSendMjmlEmail.mock.calls[0][4] as Record<
        string,
        string
      >;
      expect(callArgs.resetUrl).toContain("https://waldo.click");
      expect(callArgs.resetUrl).toContain("restablecer-contrasena");
    });
  });

  describe("PWDR-01: missing email → 400", () => {
    it("returns badRequest when email is missing", async () => {
      // Arrange
      const ctx = makeCtx({ context: "website" }); // no email

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      expect(ctx.badRequest).toHaveBeenCalledWith("Email is required");
      expect(mockSendMjmlEmail).not.toHaveBeenCalled();
    });
  });
});

describe("registerUserLocal", () => {
  const validBody = {
    is_company: false,
    firstname: "Test",
    lastname: "User",
    email: "test@example.com",
    rut: "12345678-9",
    password: "password123",
    username: "testuser",
    accepted_age_confirmation: true,
    accepted_terms: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock strapi.db for createUserReservations
    (global as unknown as Record<string, unknown>).strapi = {
      ...((global as unknown as Record<string, unknown>).strapi as object),
      db: {
        query: (contentType: string) => {
          if (contentType === "api::ad-reservation.ad-reservation") {
            return {
              findMany: jest.fn().mockResolvedValue([]),
              create: jest.fn().mockResolvedValue({}),
            };
          }
          if (
            contentType ===
            "api::ad-featured-reservation.ad-featured-reservation"
          ) {
            return { create: jest.fn().mockResolvedValue({}) };
          }
          if (contentType === "plugin::users-permissions.user") {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              update: mockUserUpdate,
            };
          }
          return strapiQueryMock(contentType);
        },
      },
      log: { error: jest.fn() },
    };
  });

  it("returns 400 when accepted_age_confirmation is not true", async () => {
    // Arrange
    const mockRegister = jest.fn();
    const handler = registerUserLocal(mockRegister);
    const ctx = makeCtx({ ...validBody, accepted_age_confirmation: false });

    // Act
    await handler(ctx);

    // Assert
    expect(ctx.badRequest).toHaveBeenCalledWith("All fields are required");
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("returns 400 when accepted_terms is not true", async () => {
    // Arrange
    const mockRegister = jest.fn();
    const handler = registerUserLocal(mockRegister);
    const ctx = makeCtx({ ...validBody, accepted_terms: false });

    // Act
    await handler(ctx);

    // Assert
    expect(ctx.badRequest).toHaveBeenCalledWith("All fields are required");
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("calls original registerController when both consent fields are true", async () => {
    // Arrange
    const mockRegister = jest.fn(async (ctx) => {
      ctx.response.body = {
        jwt: "token",
        user: { id: 1, email: "test@example.com" },
      };
    });
    const handler = registerUserLocal(mockRegister);
    const ctx = makeCtx(validBody);

    // Act
    await handler(ctx);

    // Assert
    expect(mockRegister).toHaveBeenCalled();
    expect(ctx.badRequest).not.toHaveBeenCalled();
  });

  it("passes accepted_age_confirmation and accepted_terms in userData to original controller", async () => {
    // Arrange
    const mockRegister = jest.fn(async (ctx) => {
      ctx.response.body = { jwt: "token", user: { id: 1 } };
    });
    const handler = registerUserLocal(mockRegister);
    const ctx = makeCtx(validBody);

    // Act
    await handler(ctx);

    // Assert: registerUserLocal replaces ctx.request.body with userData
    expect(ctx.request.body).toEqual(
      expect.objectContaining({
        accepted_age_confirmation: true,
        accepted_terms: true,
      })
    );
  });
});
