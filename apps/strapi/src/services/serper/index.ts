import { SerperService } from "./serper.service";

const serperService = new SerperService();

export const searchNews = (query: string, num?: number) =>
  serperService.searchNews({ query, num });

export { SerperService };
export type {
  ISerperService,
  SerperSearchRequest,
  SerperSearchResponse,
  SerperNewsResult,
} from "./serper.types";
