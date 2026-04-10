export interface CloudflareTrafficRow {
  date: string;
  requests: number;
  bytes: number;
  pageViews: number;
  threats: number;
  cachedRequests: number;
}

export interface CloudflareRequestRow {
  path: string;
  requests: number;
  bytes: number;
}

export interface CloudflareThreatRow {
  date: string;
  threats: number;
  requests: number;
}

export interface ICloudflareService {
  getTraffic(): Promise<CloudflareTrafficRow[]>;
  getRequests(): Promise<CloudflareRequestRow[]>;
  getThreats(days: number): Promise<CloudflareThreatRow[]>;
}
