import {
  CloudflareAnalytics,
  ICloudflareService,
} from "../types/cloudflare.types";

export class CloudflareService implements ICloudflareService {
  private apiToken: string;
  private zoneId: string;

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || "";

    if (!this.apiToken) {
      throw new Error("CLOUDFLARE_API_TOKEN is required");
    }
    if (!this.zoneId) {
      throw new Error("CLOUDFLARE_ZONE_ID is required");
    }
  }

  async getAnalytics(): Promise<CloudflareAnalytics> {
    const url = `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/analytics/dashboard?since=-672&until=0`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Cloudflare API error: ${response.status} ${response.statusText}`
      );
    }

    // Cloudflare response shape is not typed; using any for nested navigation
    const data = (await response.json()) as any;
    const totals = data.result.totals;
    const requestsAll: number = totals.requests.all;

    return {
      requests: requestsAll,
      bandwidth: totals.bandwidth.all,
      threats: totals.threats.all,
      pageviews: totals.pageviews.all,
      cacheHitRate: requestsAll > 0 ? totals.requests.cached / requestsAll : 0,
      errorRate:
        requestsAll > 0
          ? (totals.requests["4xx"] + totals.requests["5xx"]) / requestsAll
          : 0,
      timeseries: data.result.timeseries,
    };
  }
}
