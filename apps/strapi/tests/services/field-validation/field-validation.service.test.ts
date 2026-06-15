import { validateFields } from "../../../src/services/field-validation/field-validation.service";
import { TIMEOUT_MS } from "../../../src/services/field-validation/field-validation.config";

// Mock the ai-provider module so generate() is controlled in tests
jest.mock("../../../src/services/ai-provider", () => ({
  generate: jest.fn(),
}));

import { generate } from "../../../src/services/ai-provider";

// Cast mock so we can drive resolved/rejected values
const mockGenerate = generate as jest.Mock;

// Stub global.strapi so strapi.log.error doesn't crash
(global as unknown as { strapi: { log: { error: jest.Mock } } }).strapi = {
  log: { error: jest.fn() },
};

beforeEach(() => {
  jest.resetAllMocks();
  // Re-stub strapi after resetAllMocks
  (global as unknown as { strapi: { log: { error: jest.Mock } } }).strapi = {
    log: { error: jest.fn() },
  };
});

describe("validateFields", () => {
  // Test 1: explicit false from the AI is preserved in the result map
  it("preserves explicit false for a field when AI returns false", async () => {
    // Arrange
    mockGenerate.mockResolvedValue({
      text: '{"firstname":true,"lastname":false}',
    });

    // Act
    const result = await validateFields({
      firstname: "John",
      lastname: "akhsdgKAJHSDGH",
    });

    // Assert
    expect(result).toEqual({ firstname: true, lastname: false });
  });

  // Test 2: all-true passthrough when AI returns all true
  it("returns all-true when AI returns all true", async () => {
    // Arrange
    mockGenerate.mockResolvedValue({
      text: '{"firstname":true,"lastname":true}',
    });

    // Act
    const result = await validateFields({
      firstname: "John",
      lastname: "Smith",
    });

    // Assert
    expect(result).toEqual({ firstname: true, lastname: true });
  });

  // Test 3: fail-open on throw — generate rejects → all-true, no exception
  it("returns all-true (fail-open) when generate rejects and does NOT throw", async () => {
    // Arrange
    mockGenerate.mockRejectedValue(new Error("provider unavailable"));

    // Act
    const result = await validateFields({
      firstname: "John",
      lastname: "Smith",
    });

    // Assert — all true, service never throws
    expect(result).toEqual({ firstname: true, lastname: true });
  });

  // Test 4: fail-open on timeout — generate never resolves within TIMEOUT_MS
  it("returns all-true (fail-open) when generate times out and does NOT throw", async () => {
    // Arrange — never-resolving promise simulates an infinite hang
    jest.useFakeTimers();
    mockGenerate.mockImplementation(
      () => new Promise(() => undefined), // never resolves
    );

    // Act — kick off the async call before advancing timers
    const resultPromise = validateFields({
      firstname: "John",
      lastname: "Smith",
    });

    // Advance time past TIMEOUT_MS to trigger the internal timeout rejection
    jest.advanceTimersByTime(TIMEOUT_MS + 100);

    const result = await resultPromise;

    jest.useRealTimers();

    // Assert
    expect(result).toEqual({ firstname: true, lastname: true });
  });

  // Test 5: fail-open on unparseable JSON
  it("returns all-true (fail-open) when generate returns unparseable JSON", async () => {
    // Arrange
    mockGenerate.mockResolvedValue({ text: "not json at all" });

    // Act
    const result = await validateFields({
      firstname: "John",
      lastname: "Smith",
    });

    // Assert
    expect(result).toEqual({ firstname: true, lastname: true });
  });

  // Test 6: fenced JSON (```json ... ```) is stripped and parsed correctly
  it("strips markdown JSON fences from response and parses correctly", async () => {
    // Arrange — simulate non-Cerebras provider that wraps JSON in a code fence
    mockGenerate.mockResolvedValue({
      text: '```json\n{"firstname":false}\n```',
    });

    // Act
    const result = await validateFields({ firstname: "akhsdgKAJHSDGH" });

    // Assert
    expect(result).toEqual({ firstname: false });
  });

  // Test 7: missing field in AI response defaults to true
  it("defaults missing field to true when AI response omits it", async () => {
    // Arrange — AI returns only firstname, omits lastname
    mockGenerate.mockResolvedValue({ text: '{"firstname":false}' });

    // Act
    const result = await validateFields({
      firstname: "akhsdgKAJHSDGH",
      lastname: "Smith",
    });

    // Assert — firstname false is preserved, missing lastname defaults to true
    expect(result).toEqual({ firstname: false, lastname: true });
  });

  // Test 8: empty input → empty output without calling generate
  it("returns empty object for empty input without calling generate", async () => {
    // Act
    const result = await validateFields({});

    // Assert
    expect(result).toEqual({});
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  // Test 9: non-boolean value in AI response treated as true (only literal false blocks)
  it("treats non-boolean value in AI response as true", async () => {
    // Arrange — AI returns a string instead of boolean
    mockGenerate.mockResolvedValue({ text: '{"firstname":"maybe"}' });

    // Act
    const result = await validateFields({ firstname: "John" });

    // Assert — "maybe" !== false, so it counts as true
    expect(result).toEqual({ firstname: true });
  });
});
