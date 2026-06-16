// Test E: End-to-end fail-open proof for registerUserLocal.
//
// This file is a DEDICATED SIBLING of authController.test.ts by design:
//   - authController.test.ts mocks the entire field-validation module (module-level jest.mock)
//     to drive Tests A/B/D directly.
//   - This file uses the REAL field-validation service so the full fail-open path is exercised
//     end-to-end: validateFields → withTimeout → ai-provider.generate → rejects → allTrue → gate
//     passes → registerController called.
//   - Merging both into one file is impossible because jest.mock hoisting would apply to all
//     tests in the file, preventing the real service from running.
//
// AAA pattern (Arrange-Act-Assert), ai-provider mocked to simulate AI downtime.

// --- Mock ai-provider (real field-validation calls this internally) ---
jest.mock("../../../../src/services/ai-provider", () => ({
  generate: jest.fn().mockRejectedValue(new Error("AI down")),
  generateArticleDraft: jest.fn(),
}));

// --- Mock sendMjmlEmail (non-critical, prevents real email sends) ---
jest.mock("../../../../src/services/mjml", () => ({
  sendMjmlEmail: jest.fn().mockResolvedValue(undefined),
}));

// --- Mock crypto (same as authController.test.ts to avoid real randomBytes) ---
jest.mock("crypto", () => ({
  ...jest.requireActual("crypto"),
  randomUUID: jest.fn(() => "test-pending-token-uuid"),
  randomBytes: jest.fn(() =>
    Buffer.from(
      "test-reset-token-hex-64-bytes-padded-to-correct-length!!!!!!!",
    ),
  ),
}));

import { registerUserLocal } from "../../../../src/extensions/users-permissions/controllers/authController";

// Strapi DB mock — mirrors authController.test.ts setup for the registerUserLocal path
const mockUserFindOne = jest.fn().mockResolvedValue(null);
const mockUserUpdate = jest.fn().mockResolvedValue({});

const buildStrapiMock = () => ({
  db: {
    query: (contentType: string) => {
      if (contentType === "api::ad-reservation.ad-reservation") {
        return {
          findMany: jest.fn().mockResolvedValue([]),
          create: jest.fn().mockResolvedValue({}),
        };
      }
      if (
        contentType === "api::ad-featured-reservation.ad-featured-reservation"
      ) {
        return { create: jest.fn().mockResolvedValue({}) };
      }
      if (contentType === "plugin::users-permissions.user") {
        return { findOne: mockUserFindOne, update: mockUserUpdate };
      }
      return {};
    },
  },
  log: { error: jest.fn() },
});

// Helper to build a minimal mock ctx (same shape as authController.test.ts buildCtx)
const buildCtx = (body: Record<string, unknown> = {}) => ({
  request: { body },
  response: { body: null as unknown },
  body: null as unknown,
  state: { auth: null as unknown },
  badRequest: jest.fn((msg: string) => {
    ctx.body = { error: { status: 400, message: msg } };
    return undefined;
  }),
  unauthorized: jest.fn(),
  internalServerError: jest.fn(),
  status: 200 as number,
});

let ctx: ReturnType<typeof buildCtx>;
const makeCtx = (body: Record<string, unknown> = {}) => {
  ctx = buildCtx(body);
  return ctx;
};

// Valid registration body — passes all pre-gate checks so the AI gate is reached
const validBody = {
  is_company: false,
  firstname: "María",
  lastname: "González",
  email: "maria@example.com",
  rut: "11222333-4",
  password: "Password123",
  username: "mariagonzalez",
  accepted_age_confirmation: true,
  accepted_terms: true,
  accepted_usage_terms: true,
};

describe("registerUserLocal fail-open (end-to-end, real field-validation, mocked ai-provider)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset strapi mock before each test
    (global as unknown as Record<string, unknown>).strapi = buildStrapiMock();
  });

  it("Test E: AI provider failure does NOT block registration — registerController is called (fail-open end-to-end)", async () => {
    // Arrange
    // ai-provider.generate rejects (AI down) — set up at module level above
    // field-validation.validateFields (real, not mocked) calls generate() → gets the rejection
    // → falls into the catch → returns allTrue → gate check passes → registerController runs

    const mockRegister = jest.fn(async (c: ReturnType<typeof buildCtx>) => {
      c.response.body = {
        jwt: "token",
        user: { id: 7, email: "maria@example.com" },
      };
    });

    const handler = registerUserLocal(mockRegister);
    const testCtx = makeCtx(validBody);

    // Act
    await handler(testCtx);

    // Assert: registration proceeded despite AI failure (fail-open, D-07)
    expect(mockRegister).toHaveBeenCalledTimes(1);
    // No rejection message should have been sent (badRequest not called with validation message)
    expect(testCtx.badRequest).not.toHaveBeenCalledWith(
      expect.stringMatching(/Invalid (firstname|lastname)/),
    );
  });
});
