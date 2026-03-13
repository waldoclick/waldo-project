import type {
  ITavilyService,
  TavilySearchRequest,
  TavilySearchResponse,
  TavilyNewsResult,
} from "./tavily.types";

interface TavilyApiResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
  favicon?: string;
  published_date?: string;
}

interface TavilyApiResponse {
  results: TavilyApiResult[];
}

export class TavilyService implements ITavilyService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.tavily.com/search";

  constructor() {
    const apiKey = process.env.TAVILY_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("TAVILY_API_KEY environment variable is required");
    }
    this.apiKey = apiKey;
  }

  async searchNews(
    request: TavilySearchRequest
  ): Promise<TavilySearchResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        query: request.query,
        topic: "news",
        max_results: request.num ?? 5,
        search_depth: "basic",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Tavily API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as TavilyApiResponse;
    const news: TavilyNewsResult[] = (data.results ?? []).map((item) => ({
      title: item.title,
      link: item.url,
      snippet: item.content,
      date: item.published_date ?? "",
      source: new URL(item.url).hostname,
      imageUrl: undefined,
    }));

    return { news };
  }
}
