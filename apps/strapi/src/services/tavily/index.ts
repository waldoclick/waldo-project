import { TavilyService } from "./tavily.service";

const tavilyService = new TavilyService();

export const searchNews = (query: string, num?: number) =>
  tavilyService.searchNews({ query, num });

export { TavilyService };
export type {
  ITavilyService,
  TavilySearchRequest,
  TavilySearchResponse,
  TavilyNewsResult,
} from "./tavily.types";
