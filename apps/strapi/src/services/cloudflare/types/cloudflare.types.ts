export interface CloudflareTimeseries {
  since: string;
  until: string;
  requests: { all: number; cached: number; uncached: number };
  bandwidth: { all: number; cached: number; uncached: number };
  threats: { all: number };
  pageviews: { all: number };
}

export interface CloudflareAnalytics {
  requests: number;
  bandwidth: number;
  threats: number;
  pageviews: number;
  cacheHitRate: number;
  errorRate: number;
  timeseries: CloudflareTimeseries[];
}

export interface ICloudflareService {
  getAnalytics(): Promise<CloudflareAnalytics>;
}
