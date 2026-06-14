import {
  CloudflareTrafficRow,
  CloudflareRequestRow,
  CloudflareThreatRow,
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

  private async graphql(query: string): Promise<unknown> {
    const response = await fetch(
      "https://api.cloudflare.com/client/v4/graphql",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Cloudflare GraphQL error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      errors?: { message: string }[];
      data?: unknown;
    };

    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }

    return data;
  }

  private extractGroups<T>(data: unknown, groupKey: string): T[] {
    const viewer = (
      data as {
        data?: {
          viewer?: {
            zones?: Array<Record<string, unknown>>;
          };
        };
      }
    )?.data?.viewer;
    const zone = viewer?.zones?.[0];
    return (zone?.[groupKey] as T[] | undefined) ?? [];
  }

  private getDateRange(days: number = 30): {
    startDate: string;
    endDate: string;
  } {
    const endDate = new Date().toISOString().split("T")[0] as string;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0] as string;
    return { startDate, endDate };
  }

  private getYesterdayRange(): { start: string; end: string } {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const start = new Date(yesterday);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(yesterday);
    end.setUTCHours(23, 59, 59, 0);
    return { start: start.toISOString(), end: end.toISOString() };
  }

  async getTraffic(): Promise<CloudflareTrafficRow[]> {
    const { startDate, endDate } = this.getDateRange();

    const data = await this.graphql(`{
      viewer {
        zones(filter: { zoneTag: "${this.zoneId}" }) {
          httpRequests1dGroups(
            limit: 31
            filter: { date_geq: "${startDate}", date_leq: "${endDate}" }
            orderBy: [date_ASC]
          ) {
            dimensions { date }
            sum { requests bytes pageViews threats cachedRequests }
          }
        }
      }
    }`);

    const groups = this.extractGroups<{
      dimensions: { date: string };
      sum: {
        requests?: number;
        bytes?: number;
        pageViews?: number;
        threats?: number;
        cachedRequests?: number;
      };
    }>(data, "httpRequests1dGroups");

    return groups.map((g) => ({
      date: g.dimensions.date,
      requests: g.sum.requests ?? 0,
      bytes: g.sum.bytes ?? 0,
      pageViews: g.sum.pageViews ?? 0,
      threats: g.sum.threats ?? 0,
      cachedRequests: g.sum.cachedRequests ?? 0,
    }));
  }

  async getRequests(): Promise<CloudflareRequestRow[]> {
    const { start, end } = this.getYesterdayRange();

    const data = await this.graphql(`{
      viewer {
        zones(filter: { zoneTag: "${this.zoneId}" }) {
          httpRequestsAdaptiveGroups(
            limit: 25
            filter: { datetime_geq: "${start}", datetime_leq: "${end}" }
            orderBy: [count_DESC]
          ) {
            count
            sum { edgeResponseBytes }
            dimensions { clientRequestPath }
          }
        }
      }
    }`);

    const groups = this.extractGroups<{
      dimensions: { clientRequestPath: string };
      count?: number;
      sum: { edgeResponseBytes?: number };
    }>(data, "httpRequestsAdaptiveGroups");

    return groups.map((g) => ({
      path: g.dimensions.clientRequestPath,
      requests: g.count ?? 0,
      bytes: g.sum.edgeResponseBytes ?? 0,
    }));
  }

  async getThreats(days: number = 30): Promise<CloudflareThreatRow[]> {
    const { startDate, endDate } = this.getDateRange(days);

    const data = await this.graphql(`{
      viewer {
        zones(filter: { zoneTag: "${this.zoneId}" }) {
          httpRequests1dGroups(
            limit: ${days + 1}
            filter: { date_geq: "${startDate}", date_leq: "${endDate}" }
            orderBy: [sum_threats_DESC]
          ) {
            dimensions { date }
            sum { threats requests }
          }
        }
      }
    }`);

    const groups = this.extractGroups<{
      dimensions: { date: string };
      sum: { threats?: number; requests?: number };
    }>(data, "httpRequests1dGroups");

    return groups
      .filter((g) => (g.sum.threats ?? 0) > 0)
      .map((g) => ({
        date: g.dimensions.date,
        threats: g.sum.threats ?? 0,
        requests: g.sum.requests ?? 0,
      }));
  }
}
