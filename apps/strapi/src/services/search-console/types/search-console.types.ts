export interface SearchConsoleRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsolePerformanceRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface ISearchConsoleService {
  getPerformance(): Promise<SearchConsolePerformanceRow[]>;
  getQueries(): Promise<SearchConsoleRow[]>;
  getPages(): Promise<SearchConsoleRow[]>;
}
