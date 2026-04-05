export interface SerperSearchRequest {
  query: string;
  num?: number;
}

export interface SerperNewsResult {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
  imageUrl?: string;
}

export interface SerperSearchResponse {
  news: SerperNewsResult[];
}

export interface ISerperService {
  searchNews(_request: SerperSearchRequest): Promise<SerperSearchResponse>;
}
