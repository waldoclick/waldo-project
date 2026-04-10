export interface GA4StatsRow {
  date: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface GA4PageRow {
  page: string;
  pageTitle: string;
  sessions: number;
  pageViews: number;
  bounceRate: number;
}

export interface IGoogleAnalyticsService {
  getStats(): Promise<GA4StatsRow[]>;
  getPages(): Promise<GA4PageRow[]>;
}
