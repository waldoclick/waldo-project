export interface TavilySearchRequest {
  query: string;
  num?: number;
}

export interface TavilyNewsResult {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
  imageUrl?: string;
}

export interface TavilySearchResponse {
  news: TavilyNewsResult[];
}

export interface ITavilyService {
  searchNews(_request: TavilySearchRequest): Promise<TavilySearchResponse>;
}
