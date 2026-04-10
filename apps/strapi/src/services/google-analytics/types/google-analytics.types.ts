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

export interface GA4SummaryMetric {
  current: number;
  previous: number;
  delta: number; // percentage change
}

export interface GA4Summary {
  sessions: GA4SummaryMetric;
  users: GA4SummaryMetric;
  bounceRate: GA4SummaryMetric;
  avgDuration: GA4SummaryMetric;
}

export interface IGoogleAnalyticsService {
  getStats(): Promise<GA4StatsRow[]>;
  getPages(): Promise<GA4PageRow[]>;
  getSummary(): Promise<GA4Summary>;
}
