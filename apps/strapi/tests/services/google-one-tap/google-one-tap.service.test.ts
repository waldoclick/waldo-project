/**
 * GoogleOneTapService — Unit Tests
 * Requirements: GTAP-03, GTAP-04, GTAP-05
 * AAA pattern — all external dependencies mocked.
 * Wave 0: RED tests — implementation does not exist yet.
 */

// Mock google-auth-library BEFORE any imports
jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

import { OAuth2Client } from "google-auth-library";
import { GoogleOneTapService } from "../../../src/services/google-one-tap/google-one-tap.service";

// --- Strapi global mock ---
const mockUserFindOne = jest.fn();
const mockUserFindMany = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserCreate = jest.fn();
const mockRoleFindOne = jest.fn();

(global as unknown as Record<string, unknown>).strapi = {
  db: {
    query: (contentType: string) => {
      if (contentType === "plugin::users-permissions.user") {
        return {
          findOne: mockUserFindOne,
          findMany: mockUserFindMany,
          update: mockUserUpdate,
          create: mockUserCreate,
        };
      }
      if (contentType === "plugin::users-permissions.role") {
        return { findOne: mockRoleFindOne };
      }
      return {};
    },
  },
  log: { error: jest.fn(), warn: jest.fn() },
};

// --- Test data ---
const VALID_PAYLOAD = {
  sub: "google-sub-123",
  email: "alice@example.com",
  given_name: "Alice",
  family_name: "García",
  picture: "https://lh3.googleusercontent.com/a/photo",
  aud: "test-client-id",
  iss: "https://accounts.google.com",
  iat: Math.floor(Date.now() / 1000) - 60,
  exp: Math.floor(Date.now() / 1000) + 3540,
};

const EXISTING_USER = {
  id: 42,
  email: "alice@example.com",
  username: "alice",
  google_sub: "google-sub-123",
  provider: "google",
  confirmed: true,
  blocked: false,
};

let service: GoogleOneTapService;
let mockVerifyIdToken: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.GOOGLE_CLIENT_ID = "test-client-id";

  // Get the mocked verifyIdToken from the mocked OAuth2Client instance
  const MockOAuth2Client = OAuth2Client as jest.MockedClass<
    typeof OAuth2Client
  >;
  mockVerifyIdToken = jest.fn();
  MockOAuth2Client.mockImplementation(
    () =>
      ({
        verifyIdToken: mockVerifyIdToken,
      } as unknown as OAuth2Client)
  );

  service = new GoogleOneTapService();
});

// ─── GTAP-03: verifyCredential ───────────────────────────────────────────────

describe("GTAP-03: verifyCredential()", () => {
  it("returns TokenPayload for a valid credential", async () => {
    // Arrange
    const mockTicket = { getPayload: jest.fn().mockReturnValue(VALID_PAYLOAD) };
    mockVerifyIdToken.mockResolvedValue(mockTicket);

    // Act
    const result = await service.verifyCredential("valid-credential-token");

    // Assert
    expect(result).toEqual(VALID_PAYLOAD);
    expect(mockVerifyIdToken).toHaveBeenCalledWith({
      idToken: "valid-credential-token",
      audience: "test-client-id",
    });
  });

  it("returns null for an invalid or expired credential", async () => {
    // Arrange
    mockVerifyIdToken.mockRejectedValue(new Error("Token used too late"));

    // Act
    const result = await service.verifyCredential("expired-token");

    // Assert
    expect(result).toBeNull();
  });

  it("returns null when getPayload() returns undefined", async () => {
    // Arrange
    const mockTicket = { getPayload: jest.fn().mockReturnValue(undefined) };
    mockVerifyIdToken.mockResolvedValue(mockTicket);

    // Act
    const result = await service.verifyCredential("token-with-no-payload");

    // Assert
    expect(result).toBeNull();
  });
});

// ─── GTAP-04: findOrCreateUser — existing user by google_sub ─────────────────

describe("GTAP-04: findOrCreateUser() — existing user", () => {
  it("returns existing user when google_sub matches (no DB write)", async () => {
    // Arrange
    mockUserFindOne.mockResolvedValueOnce(EXISTING_USER); // byGoogleSub hit

    // Act
    const result = await service.findOrCreateUser(VALID_PAYLOAD);

    // Assert
    expect(result).toEqual({ user: EXISTING_USER, isNew: false });
    expect(mockUserCreate).not.toHaveBeenCalled();
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("falls back to email lookup and stores google_sub when sub not found", async () => {
    // Arrange
    const userWithoutSub = { ...EXISTING_USER, google_sub: null };
    const updatedUser = { ...EXISTING_USER };
    mockUserFindOne
      .mockResolvedValueOnce(null) // byGoogleSub: miss
      .mockResolvedValueOnce(userWithoutSub); // byEmail: hit
    mockUserUpdate.mockResolvedValue(updatedUser);

    // Act
    const result = await service.findOrCreateUser(VALID_PAYLOAD);

    // Assert: email fallback writes google_sub to DB
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ google_sub: "google-sub-123" }),
      })
    );
    expect(result).toEqual({ user: updatedUser, isNew: false });
  });

  it("does NOT create a duplicate user on second One Tap login with same sub", async () => {
    // Arrange
    mockUserFindOne.mockResolvedValueOnce(EXISTING_USER); // first lookup hits

    // Act
    await service.findOrCreateUser(VALID_PAYLOAD);

    // Assert
    expect(mockUserCreate).not.toHaveBeenCalled();
  });
});

// ─── GTAP-05: findOrCreateUser — new user ────────────────────────────────────

describe("GTAP-05: findOrCreateUser() — new user", () => {
  it("returns isNew:true and creates user with provider:google when not found", async () => {
    // Arrange
    const defaultRole = { id: 1, type: "authenticated" };
    const newUser = {
      id: 99,
      email: "alice@example.com",
      google_sub: "google-sub-123",
      provider: "google",
    };
    mockUserFindOne
      .mockResolvedValueOnce(null) // byGoogleSub: miss
      .mockResolvedValueOnce(null); // byEmail: miss
    mockRoleFindOne.mockResolvedValue(defaultRole);
    mockUserCreate.mockResolvedValue(newUser);

    // Act
    const result = await service.findOrCreateUser(VALID_PAYLOAD);

    // Assert
    expect(result.isNew).toBe(true);
    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          google_sub: "google-sub-123",
          email: "alice@example.com",
          provider: "google",
          confirmed: true,
          blocked: false,
        }),
      })
    );
  });

  it("sets provider:'google' on new users (prevents OAuth duplicate account)", async () => {
    // Arrange
    mockUserFindOne.mockResolvedValue(null);
    mockRoleFindOne.mockResolvedValue({ id: 1 });
    mockUserCreate.mockResolvedValue({ id: 99, provider: "google" });

    // Act
    await service.findOrCreateUser(VALID_PAYLOAD);

    // Assert: provider MUST be 'google' — prevents providers.js email lookup mismatch
    const createCall = mockUserCreate.mock.calls[0][0];
    expect(createCall.data.provider).toBe("google");
  });
});
