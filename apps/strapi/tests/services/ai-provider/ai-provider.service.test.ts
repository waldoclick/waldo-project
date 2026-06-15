import { AiProviderService } from "../../../src/services/ai-provider/ai-provider.service";

// Mock all 5 provider modules
jest.mock("../../../src/services/cerebras", () => ({
  generateText: jest.fn(),
}));
jest.mock("../../../src/services/groq", () => ({
  generateText: jest.fn(),
}));
jest.mock("../../../src/services/deepseek", () => ({
  generateText: jest.fn(),
}));
jest.mock("../../../src/services/gemini", () => ({
  generateText: jest.fn(),
}));
jest.mock("../../../src/services/anthropic", () => ({
  generateWithSearch: jest.fn(),
}));

import { generateText as mockCerebrasGenerate } from "../../../src/services/cerebras";
import { generateText as mockGroqGenerate } from "../../../src/services/groq";
import { generateText as mockDeepSeekGenerate } from "../../../src/services/deepseek";
import { generateText as mockGeminiGenerate } from "../../../src/services/gemini";
import { generateWithSearch as mockAnthropicGenerate } from "../../../src/services/anthropic";

// Cast mocks so we can drive their resolved/rejected values
const mockCerebras = mockCerebrasGenerate as jest.Mock;
const mockGroq = mockGroqGenerate as jest.Mock;
const mockDeepSeek = mockDeepSeekGenerate as jest.Mock;
const mockGemini = mockGeminiGenerate as jest.Mock;
const mockAnthropic = mockAnthropicGenerate as jest.Mock;

// Stub global.strapi so strapi.log.error doesn't crash
(global as unknown as { strapi: { log: { error: jest.Mock } } }).strapi = {
  log: { error: jest.fn() },
};

// Save and restore AI_PROVIDER around each test
let savedProvider: string | undefined;
beforeEach(() => {
  savedProvider = process.env.AI_PROVIDER;
  delete process.env.AI_PROVIDER;
  jest.resetAllMocks();
  // Re-stub strapi after resetAllMocks
  (global as unknown as { strapi: { log: { error: jest.Mock } } }).strapi = {
    log: { error: jest.fn() },
  };
});
afterEach(() => {
  if (savedProvider === undefined) delete process.env.AI_PROVIDER;
  else process.env.AI_PROVIDER = savedProvider;
});

describe("AiProviderService", () => {
  describe("generateArticleDraft", () => {
    it("uses Cerebras by default when AI_PROVIDER is unset", async () => {
      // Arrange
      const expectedText = '{"title":"Test","body":"Content"}';
      mockCerebras.mockResolvedValue({ text: expectedText });
      const service = new AiProviderService();

      // Act
      const result = await service.generateArticleDraft("test prompt");

      // Assert
      expect(mockCerebras).toHaveBeenCalledTimes(1);
      expect(mockCerebras).toHaveBeenCalledWith("test prompt");
      expect(result.text).toBe(expectedText);
      expect(mockGroq).not.toHaveBeenCalled();
    });

    it("uses Groq first when AI_PROVIDER is set to groq", async () => {
      // Arrange
      process.env.AI_PROVIDER = "groq";
      const expectedText = '{"title":"Groq","body":"Result"}';
      mockGroq.mockResolvedValue({ text: expectedText });
      const service = new AiProviderService();

      // Act
      const result = await service.generateArticleDraft("test prompt");

      // Assert
      expect(mockGroq).toHaveBeenCalledTimes(1);
      expect(mockGroq).toHaveBeenCalledWith("test prompt");
      expect(result.text).toBe(expectedText);
      expect(mockCerebras).not.toHaveBeenCalled();
    });

    it("falls back to the next provider when the selected provider rejects", async () => {
      // Arrange — cerebras (default) fails, groq succeeds
      const fallbackText = '{"title":"Fallback","body":"GroqContent"}';
      mockCerebras.mockRejectedValue(new Error("CEREBRAS_API_KEY missing"));
      mockGroq.mockResolvedValue({ text: fallbackText });
      const service = new AiProviderService();

      // Act
      const result = await service.generateArticleDraft("test prompt");

      // Assert
      expect(mockCerebras).toHaveBeenCalledTimes(1);
      expect(mockGroq).toHaveBeenCalledTimes(1);
      expect(result.text).toBe(fallbackText);
    });

    it("throws an error mentioning all providers failed when every provider rejects", async () => {
      // Arrange — all providers fail
      mockCerebras.mockRejectedValue(new Error("cerebras failed"));
      mockGroq.mockRejectedValue(new Error("groq failed"));
      mockDeepSeek.mockRejectedValue(new Error("deepseek failed"));
      mockGemini.mockRejectedValue(new Error("gemini failed"));
      mockAnthropic.mockRejectedValue(new Error("anthropic failed"));
      const service = new AiProviderService();

      // Act & Assert
      await expect(service.generateArticleDraft("test prompt")).rejects.toThrow(
        "[ai-provider] all providers failed",
      );
    });

    it("falls back to cerebras (default chain) when AI_PROVIDER is set to an invalid/unknown value", async () => {
      // Arrange — invalid env value
      process.env.AI_PROVIDER = "unknown-provider-xyz";
      const expectedText = '{"title":"Default","body":"CerebrasResult"}';
      mockCerebras.mockResolvedValue({ text: expectedText });
      const service = new AiProviderService();

      // Act
      const result = await service.generateArticleDraft("test prompt");

      // Assert — does not crash, falls back to cerebras
      expect(mockCerebras).toHaveBeenCalledTimes(1);
      expect(result.text).toBe(expectedText);
    });
  });
});
