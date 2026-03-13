import type {
  ISerperService,
  SerperSearchRequest,
  SerperSearchResponse,
  SerperNewsResult,
} from "./serper.types";

interface SerperApiNewsItem {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
  imageUrl?: string;
}

interface SerperApiResponse {
  news?: SerperApiNewsItem[];
}

export class SerperService implements ISerperService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://google.serper.dev/news";

  constructor() {
    const apiKey = process.env.SERPER_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("SERPER_API_KEY environment variable is required");
    }
    this.apiKey = apiKey;
  }

  async searchNews(
    request: SerperSearchRequest
  ): Promise<SerperSearchResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": this.apiKey,
      },
      body: JSON.stringify({
        q: request.query,
        num: request.num ?? 5,
        gl: "cl",
        hl: "es",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Serper API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as SerperApiResponse;
    const news: SerperNewsResult[] = (data.news ?? []).map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      date: item.date,
      source: item.source,
      imageUrl: item.imageUrl,
    }));

    return { news };
  }
}
