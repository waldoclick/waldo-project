// Tests for overrideAuthLocal — VSTEP-01, VSTEP-02, VSTEP-03
// Tests for verifyCode — VSTEP-04, VSTEP-05
// Tests for resendCode — VSTEP-07
// Tests for registerUserLocal AI validation gate — Tests A, B, D
// AAA pattern (Arrange-Act-Assert), all dependencies mocked.

import {
  overrideAuthLocal,
  verifyCode,
  resendCode,
  overrideForgotPassword,
  overrideResetPassword,
  registerUserLocal,
  ensureUniqueUsername,
} from "../../../../src/extensions/users-permissions/controllers/authController";

// --- Mock validateFields from the ia util (module-level: applies to entire file) ---
// Test E (end-to-end fail-open, real ia) lives in a dedicated sibling file
// to avoid jest.mock hoisting conflicts.
jest.mock("../../../../src/utils/ia", () => ({
  validateFields: jest.fn(),
}));
import { validateFields } from "../../../../src/utils/ia";
const mockValidateFields = validateFields as jest.MockedFunction<
  typeof validateFields
>;

// --- Mock sendMjmlEmail ---
jest.mock("../../../../src/services/mjml", () => ({
  sendMjmlEmail: jest.fn().mockResolvedValue(undefined),
}));
import { sendMjmlEmail } from "../../../../src/services/mjml";
const mockSendMjmlEmail = sendMjmlEmail as jest.MockedFunction<
  typeof sendMjmlEmail
>;

// --- Mock crypto.randomUUID and randomBytes ---
jest.mock("crypto", () => ({
  ...jest.requireActual("crypto"),
  randomUUID: jest.fn(() => "test-pending-token-uuid"),
  randomBytes: jest.fn(() =>
    Buffer.from(
      "test-reset-token-hex-64-bytes-padded-to-correct-length!!!!!!!",
    ),
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
  // Strapi v5 contentAPI sanitizer — used by verifyCode to sanitize the user output
  getModel: jest.fn(() => ({})),
  contentAPI: {
    sanitize: {
      output: jest.fn(async (user: Record<string, unknown>) => ({
        id: user.id,
        email: user.email,
        username: user.username,
      })),
    },
  },
  log: { error: jest.fn() },
};

// Helper to build a mock ctx
const buildCtx = (body: Record<string, unknown> = {}) => ({
  request: { body },
  response: { body: null as unknown },
  body: null as unknown,
  // ctx.state.auth is read by the Strapi v5 contentAPI sanitizer in verifyCode
  state: { auth: null as unknown },
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
        }),
      );
      // expiresAt is a future datetime string
      const callData = mockVCCreate.mock.calls[0][0].data;
      expect(new Date(callData.expiresAt).getTime()).toBeGreaterThan(
        Date.now(),
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
        }),
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
        expect.objectContaining({ data: { attempts: 2 } }),
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
        "Maximum attempts reached — please login again",
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
        "Verification code has expired",
      );
    });
  });

  describe("Operator-injection on pendingToken (RED until 01-01)", () => {
    it("rejects pendingToken operator-injection object — where value must be a scalar string", async () => {
      // Arrange — attacker sends an operator object instead of a token string.
      // The truthy guard `if (!pendingToken)` passes (object is truthy), so the
      // value flows into `findOne({ where: { pendingToken } })`.
      mockVCFindOne.mockResolvedValue(null);
      const ctx = makeCtx({ pendingToken: { $ne: null }, code: "123456" });

      // Act
      await verifyCode(ctx);

      // Assert — capture the where filter handed to the verification-code findOne.
      // RED by design until 01-01 applies String(pendingToken):
      //   Today the object passes through uncoerced → typeof is "object" → fails.
      //   After 01-01 it is String()-coerced → typeof "string" → passes,
      //   so the `{$ne:null}` operator never reaches the query as an operator.
      expect(mockVCFindOne).toHaveBeenCalled();
      const capturedWhere = mockVCFindOne.mock.calls[0][0].where as {
        pendingToken: unknown;
      };
      expect(typeof capturedWhere.pendingToken).toBe("string");
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
        "pendingToken and code are required",
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
        }),
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
        }),
      );
      // expiresAt is a future date
      const updateData = mockVCUpdate.mock.calls[0][0].data;
      expect(new Date(updateData.expiresAt).getTime()).toBeGreaterThan(
        Date.now(),
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
        }),
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
        }),
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
        }),
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

  describe("GOAUTH-128-01/02: Google-only user receives create-password template", () => {
    const googleUser = {
      id: 99,
      email: "guser@example.com",
      username: "guser99",
      firstname: "Gabriela",
      blocked: false,
      provider: "google",
    };

    it("sends 'create-password' template (not 'reset-password') for Google-only user", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue(googleUser);
      mockUserUpdate.mockResolvedValue(googleUser);
      const ctx = makeCtx({ email: "guser@example.com" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      expect(mockSendMjmlEmail).toHaveBeenCalledTimes(1);
      expect(mockSendMjmlEmail).toHaveBeenCalledWith(
        expect.anything(),
        "create-password",
        "guser@example.com",
        "Crea tu contraseña",
        expect.objectContaining({
          name: "Gabriela",
          resetUrl: expect.stringContaining("token="),
        }),
      );
    });

    it("sends 'reset-password' template for provider:'local' user (no regression)", async () => {
      // Arrange
      const localUser = { ...testUser, provider: "local" };
      mockUserFindOne.mockResolvedValue(localUser);
      mockUserUpdate.mockResolvedValue(localUser);
      const ctx = makeCtx({ email: "user@example.com" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      expect(mockSendMjmlEmail).toHaveBeenCalledWith(
        expect.anything(),
        "reset-password",
        expect.any(String),
        "Restablece tu contraseña",
        expect.objectContaining({
          resetUrl: expect.stringContaining("token="),
        }),
      );
    });

    it("returns { ok: true } for Google-only user (silent success preserved)", async () => {
      // Arrange
      mockUserFindOne.mockResolvedValue(googleUser);
      mockUserUpdate.mockResolvedValue(googleUser);
      const ctx = makeCtx({ email: "guser@example.com" });

      // Act
      const handler = overrideForgotPassword();
      await handler(ctx);

      // Assert
      expect(ctx.body).toEqual({ ok: true });
    });
  });
});

describe("overrideResetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore global strapi mock (registerUserLocal's beforeEach overrides it)
    (global as unknown as Record<string, unknown>).strapi = {
      db: { query: strapiQueryMock },
      plugins: {
        "users-permissions": {
          services: { jwt: { issue: mockJwtIssue } },
        },
      },
      log: { error: jest.fn() },
    };
  });

  describe("GOAUTH-128-03: provider flip after successful reset", () => {
    it("flips provider to 'local' when user was Google-only", async () => {
      // Arrange
      const mockReset = jest.fn(async (ctx) => {
        ctx.response.body = { jwt: "new-jwt", user: { id: 42 } };
      });
      mockUserFindOne.mockResolvedValueOnce({ id: 42, provider: "google" });
      mockUserUpdate.mockResolvedValue({ id: 42 });

      const ctx = {
        request: {
          body: {
            password: "NewPass1234",
            code: `${Date.now().toString(16)}:abc`,
          },
        },
        response: { body: null as unknown },
        body: null as unknown,
        badRequest: jest.fn(),
        send: jest.fn(),
      };

      // Act
      const handler = overrideResetPassword(mockReset);
      await handler(ctx);

      // Assert: original reset was called
      expect(mockReset).toHaveBeenCalled();
      // Assert: DB update called with provider:'local'
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 42 },
          data: { provider: "local" },
        }),
      );
    });

    it("does NOT update provider when user was already provider:'local'", async () => {
      // Arrange
      const mockReset = jest.fn(async (ctx) => {
        ctx.response.body = { jwt: "new-jwt", user: { id: 99 } };
      });
      mockUserFindOne.mockResolvedValueOnce({ id: 99, provider: "local" });

      const ctx = {
        request: {
          body: {
            password: "NewPass1234",
            code: `${Date.now().toString(16)}:abc`,
          },
        },
        response: { body: null as unknown },
        body: null as unknown,
        badRequest: jest.fn(),
        send: jest.fn(),
      };

      // Act
      const handler = overrideResetPassword(mockReset);
      await handler(ctx);

      // Assert: no update call made
      expect(mockUserUpdate).not.toHaveBeenCalled();
    });

    it("does NOT attempt provider lookup when response body has no user.id (failed reset)", async () => {
      // Arrange — reset produces no body (failure path)
      const mockReset = jest.fn(async (ctx) => {
        ctx.response.body = null;
      });

      const ctx = {
        request: {
          body: {
            password: "NewPass1234",
            code: `${Date.now().toString(16)}:abc`,
          },
        },
        response: { body: null as unknown },
        body: null as unknown,
        badRequest: jest.fn(),
        send: jest.fn(),
      };

      // Act
      const handler = overrideResetPassword(mockReset);
      await handler(ctx);

      // Assert: no DB lookup, no update
      expect(mockUserFindOne).not.toHaveBeenCalled();
      expect(mockUserUpdate).not.toHaveBeenCalled();
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
    password: "Password123",
    username: "testuser",
    accepted_age_confirmation: true,
    accepted_terms: true,
    accepted_usage_terms: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: AI gate passes all fields — existing tests reach the register controller unaffected
    mockValidateFields.mockResolvedValue({ firstname: true, lastname: true });
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

  it("strips accepted_* consent fields from forwardBody before calling original controller", async () => {
    // Arrange: consent fields are excluded from the forwarded body (see authController.ts comment —
    // Strapi v5 rejects unknown params; consent booleans are persisted via db.query after registration)
    const mockRegister = jest.fn(async (ctx) => {
      ctx.response.body = { jwt: "token", user: { id: 1 } };
    });
    const handler = registerUserLocal(mockRegister);
    const ctx = makeCtx(validBody);

    // Act
    await handler(ctx);

    // Assert: registerUserLocal replaces ctx.request.body with forwardBody (no consent fields)
    expect(ctx.request.body).not.toHaveProperty("accepted_age_confirmation");
    expect(ctx.request.body).not.toHaveProperty("accepted_terms");
    expect(ctx.request.body).not.toHaveProperty("accepted_usage_terms");
    // Core fields are forwarded
    expect(ctx.request.body).toEqual(
      expect.objectContaining({
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        rut: "12345678-9",
        username: "testuser",
      }),
    );
  });
});

describe("registerUserLocal AI validation gate", () => {
  // A valid body that passes all pre-gate checks (required fields + password strength + accepted_usage_terms)
  const gateValidBody = {
    is_company: false,
    firstname: "Juan",
    lastname: "Pérez",
    email: "juan@example.com",
    rut: "12345678-9",
    password: "Password123",
    username: "juanperez",
    accepted_age_confirmation: true,
    accepted_terms: true,
    accepted_usage_terms: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock strapi with all dependencies the gate path needs
    (global as unknown as Record<string, unknown>).strapi = {
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
              update: jest.fn().mockResolvedValue({}),
            };
          }
          return {};
        },
      },
      log: { error: jest.fn() },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Test A: explicit false on a field rejects with the English message + field detail and does NOT call registerController", async () => {
    // Arrange
    mockValidateFields.mockResolvedValue({ lastname: false });
    const mockRegister = jest.fn();
    const handler = registerUserLocal(mockRegister);
    const ctx = makeCtx(gateValidBody);

    // Act
    await handler(ctx);

    // Assert — backend message is English; the field travels in details for the client to localize
    expect(ctx.badRequest).toHaveBeenCalledWith("Invalid lastname", {
      field: "lastname",
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("Test B: all-true result allows registration to proceed (registerController called once)", async () => {
    // Arrange
    mockValidateFields.mockResolvedValue({ firstname: true, lastname: true });
    const mockRegister = jest.fn(async (ctx) => {
      ctx.response.body = {
        jwt: "token",
        user: { id: 42, email: "juan@example.com" },
      };
    });
    const handler = registerUserLocal(mockRegister);
    const ctx = makeCtx(gateValidBody);

    // Act
    await handler(ctx);

    // Assert
    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(ctx.badRequest).not.toHaveBeenCalledWith(
      expect.stringMatching(/Invalid (firstname|lastname)/),
    );
  });

  it("Test D: validateFields is called with exactly firstname and lastname — no password, email, rut, phone, postal_code, birthdate, region, commune, or business_* keys", async () => {
    // Arrange
    mockValidateFields.mockResolvedValue({ firstname: true, lastname: true });
    const mockRegister = jest.fn(async (ctx) => {
      ctx.response.body = {
        jwt: "token",
        user: { id: 42, email: "juan@example.com" },
      };
    });
    const handler = registerUserLocal(mockRegister);
    const ctx = makeCtx(gateValidBody);

    // Act
    await handler(ctx);

    // Assert: validateFields was called
    expect(mockValidateFields).toHaveBeenCalledTimes(1);
    const calledWith = mockValidateFields.mock.calls[0][0];

    // Only firstname and lastname must be present
    expect(Object.keys(calledWith).sort()).toEqual(["firstname", "lastname"]);

    // Excluded fields must never appear
    const excluded = [
      "password",
      "email",
      "rut",
      "phone",
      "postal_code",
      "birthdate",
      "region",
      "commune",
      "business_name",
      "business_type",
      "business_address",
      "business_region",
      "business_commune",
    ];
    for (const field of excluded) {
      expect(calledWith).not.toHaveProperty(field);
    }
  });
});

describe("ensureUniqueUsername", () => {
  let mockFindOne: jest.Mock;

  beforeEach(() => {
    mockFindOne = jest.fn();
    (global as unknown as Record<string, unknown>).strapi = {
      db: {
        query: jest.fn(() => ({ findOne: mockFindOne })),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Test 1 — no collision: returns base username unchanged when findOne returns null", async () => {
    // Arrange
    mockFindOne.mockResolvedValueOnce(null);

    // Act
    const result = await ensureUniqueUsername("gonzalo");

    // Assert
    expect(result).toBe("gonzalo");
    expect(mockFindOne).toHaveBeenCalledTimes(1);
  });

  it("Test 2 — single collision: returns suffixed username when first lookup collides", async () => {
    // Arrange
    mockFindOne
      .mockResolvedValueOnce({ id: 1 }) // base "gonzalo" collides
      .mockResolvedValueOnce(null); // candidate "gonzaloXXXXX" is free

    // Act
    const result = await ensureUniqueUsername("gonzalo");

    // Assert
    expect(result).toMatch(/^gonzalo\d{5}$/);
    expect(mockFindOne).toHaveBeenCalledTimes(2);
  });

  it("Test 3 — multiple collisions: retries until a free candidate is found", async () => {
    // Arrange
    mockFindOne
      .mockResolvedValueOnce({ id: 1 }) // base collides
      .mockResolvedValueOnce({ id: 2 }) // first suffix collides
      .mockResolvedValueOnce(null); // second suffix is free

    // Act
    const result = await ensureUniqueUsername("gonzalo");

    // Assert
    expect(result).toMatch(/^gonzalo\d{5}$/);
    expect(mockFindOne).toHaveBeenCalledTimes(3);
  });

  it("Test 4 — max attempts exceeded: throws after 10 retries (11 total findOne calls)", async () => {
    // Arrange: every lookup returns a collision
    mockFindOne.mockResolvedValue({ id: 1 });

    // Act & Assert
    await expect(ensureUniqueUsername("gonzalo")).rejects.toThrow(
      "Could not generate unique username after 10 attempts",
    );
    expect(mockFindOne).toHaveBeenCalledTimes(11); // 1 base + 10 retries
  });
});
