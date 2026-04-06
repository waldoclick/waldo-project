import { TavilyService } from "../../../src/services/tavily/tavily.service";

// Save and restore TAVILY_API_KEY around each test
let savedKey: string | undefined;
beforeEach(() => {
  savedKey = process.env.TAVILY_API_KEY;
});
afterEach(() => {
  if (savedKey === undefined) delete process.env.TAVILY_API_KEY;
  else process.env.TAVILY_API_KEY = savedKey;
  jest.resetAllMocks();
});

describe("TavilyService", () => {
  describe("constructor", () => {
    it("throws when TAVILY_API_KEY is missing", () => {
      // Arrange
      delete process.env.TAVILY_API_KEY;
      // Act & Assert
      expect(() => new TavilyService()).toThrow(
        "TAVILY_API_KEY environment variable is required"
      );
    });
  });

  describe("searchNews", () => {
    beforeEach(() => {
      process.env.TAVILY_API_KEY = "test-key";
    });

    it("returns mapped news results on success", async () => {
      // Arrange
      const mockResult = {
        title: "Test Article",
        url: "https://example.com/article",
        content: "A snippet of the article.",
        score: 0.9,
        published_date: "2026-03-13",
      };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [mockResult] }),
      } as unknown as Response);

      const service = new TavilyService();

      // Act
      const result = await service.searchNews({ query: "noticias maquinaria" });

      // Assert
      expect(result.news).toHaveLength(1);
      expect(result.news[0]).toEqual({
        title: "Test Article",
        link: "https://example.com/article",
        snippet: "A snippet of the article.",
        date: "2026-03-13",
        source: "example.com",
        imageUrl: undefined,
      });
    });

    it("throws on non-ok response", async () => {
      // Arrange
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as unknown as Response);

      const service = new TavilyService();

      // Act & Assert
      await expect(service.searchNews({ query: "test" })).rejects.toThrow(
        "Tavily API error: 401 Unauthorized"
      );
    });
  });
});
