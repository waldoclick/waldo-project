/**
 * GoogleRecaptchaService — Unit Tests (SEC2-AUTH)
 * Requirements: SEC2-AUTH — reCAPTCHA hostname/action binding
 * Uses axios-mock-adapter for zero live network calls.
 * Wave 0: RED tests — hostname/action binding does not exist yet.
 * After Task 3: all tests GREEN.
 */

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { GoogleRecaptchaService } from "../../../src/services/google/services/google-recaptcha.service";

// Type helper: verifyToken will gain an optional expectedAction param in Task 3.
// Cast the service to this extended interface to allow the tests to compile now.
interface IRecaptchaServiceWithAction {
  verifyToken(token: string, expectedAction?: string): Promise<boolean>;
}

const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

describe("GoogleRecaptchaService — hostname/action binding (SEC2-AUTH)", () => {
  let mock: MockAdapter;
  let service: IRecaptchaServiceWithAction;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    process.env.RECAPTCHA_SECRET_KEY = "test-secret-key";
    process.env.RECAPTCHA_ALLOWED_HOSTNAMES = "waldo.click,www.waldo.click";
    service =
      new GoogleRecaptchaService() as unknown as IRecaptchaServiceWithAction;
  });

  afterEach(() => {
    mock.restore();
    delete process.env.RECAPTCHA_SECRET_KEY;
    delete process.env.RECAPTCHA_ALLOWED_HOSTNAMES;
  });

  it("Test A (hostname mismatch rejected): rejects token when hostname is not in allowlist", async () => {
    // Arrange — siteverify returns a disallowed hostname
    mock.onPost(SITEVERIFY_URL).reply(200, {
      success: true,
      score: 0.9,
      hostname: "evil.example.com",
      action: "login",
    });

    // Act
    const result = await service.verifyToken("some-token");

    // Assert — must return false (hostname not in allowlist)
    expect(result).toBe(false);
  });

  it("Test B (action mismatch rejected): rejects token when action does not match expectedAction", async () => {
    // Arrange — siteverify returns action 'login' but caller expects 'register'
    mock.onPost(SITEVERIFY_URL).reply(200, {
      success: true,
      score: 0.9,
      hostname: "waldo.click",
      action: "login",
    });

    // Act — call with expectedAction = "register" (mismatch)
    const result = await service.verifyToken("some-token", "register");

    // Assert — must return false (action mismatch)
    expect(result).toBe(false);
  });

  it("Test C (valid hostname+action+score): accepts token when all checks pass", async () => {
    // Arrange — siteverify returns valid hostname, action, and high score
    mock.onPost(SITEVERIFY_URL).reply(200, {
      success: true,
      score: 0.9,
      hostname: "waldo.click",
      action: "register",
    });

    // Act — expectedAction matches the siteverify response
    const result = await service.verifyToken("some-token", "register");

    // Assert
    expect(result).toBe(true);
  });

  it("returns false when success=false regardless of hostname/action", async () => {
    // Arrange
    mock.onPost(SITEVERIFY_URL).reply(200, {
      success: false,
      score: 0.9,
      hostname: "waldo.click",
      action: "register",
    });

    // Act
    const result = await service.verifyToken("some-token", "register");

    // Assert
    expect(result).toBe(false);
  });

  it("returns false when score <= 0.5 regardless of hostname/action", async () => {
    // Arrange
    mock.onPost(SITEVERIFY_URL).reply(200, {
      success: true,
      score: 0.4,
      hostname: "waldo.click",
      action: "register",
    });

    // Act
    const result = await service.verifyToken("some-token", "register");

    // Assert
    expect(result).toBe(false);
  });

  it("returns false on network error (does not throw)", async () => {
    // Arrange — simulate network failure
    mock.onPost(SITEVERIFY_URL).networkError();

    // Act
    const result = await service.verifyToken("some-token");

    // Assert — error caught internally, returns false
    expect(result).toBe(false);
  });

  it("accepts token when no expectedAction provided and hostname matches", async () => {
    // Arrange — no expectedAction: only hostname+score matter
    mock.onPost(SITEVERIFY_URL).reply(200, {
      success: true,
      score: 0.9,
      hostname: "waldo.click",
    });

    // Act — no expectedAction param
    const result = await service.verifyToken("some-token");

    // Assert
    expect(result).toBe(true);
  });
});
