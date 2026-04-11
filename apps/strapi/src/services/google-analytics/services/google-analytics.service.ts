import { BetaAnalyticsDataClient } from "@google-analytics/data";
import {
  IGoogleAnalyticsService,
  GA4StatsRow,
  GA4PageRow,
  GA4SummaryMetric,
  GA4Summary,
} from "../types/google-analytics.types";

export class GoogleAnalyticsService implements IGoogleAnalyticsService {
  private propertyId: string;

  constructor() {
    this.propertyId = process.env.GA4_PROPERTY_ID || "";

    if (!this.propertyId) {
      throw new Error("GA4_PROPERTY_ID is required");
    }
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error(
        "GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY are required"
      );
    }
  }

  private createClient(): BetaAnalyticsDataClient {
    return new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });
  }

  private getDateRange(): { startDate: string; endDate: string } {
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0] as string;
    const endDate = new Date().toISOString().split("T")[0] as string;
    return { startDate, endDate };
  }

  async getStats(): Promise<GA4StatsRow[]> {
    const client = this.createClient();
    const { startDate, endDate } = this.getDateRange();

    const [response] = await client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    });

    const rows = (response.rows ?? []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? "";
      const date =
        rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(
              6,
              8
            )}`
          : rawDate;

      return {
        date,
        sessions: parseFloat(row.metricValues?.[0]?.value ?? "0") ?? 0,
        users: parseFloat(row.metricValues?.[1]?.value ?? "0") ?? 0,
        bounceRate: parseFloat(row.metricValues?.[2]?.value ?? "0") ?? 0,
        avgSessionDuration:
          parseFloat(row.metricValues?.[3]?.value ?? "0") ?? 0,
      };
    });

    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }

  private computeDelta(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private buildMetric(current: number, previous: number): GA4SummaryMetric {
    return { current, previous, delta: this.computeDelta(current, previous) };
  }

  async getSummary(): Promise<GA4Summary> {
    const client = this.createClient();
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    const currentStart = new Date(now - 28 * DAY_MS)
      .toISOString()
      .split("T")[0] as string;
    const currentEnd = new Date(now).toISOString().split("T")[0] as string;

    const previousStart = new Date(now - 56 * DAY_MS)
      .toISOString()
      .split("T")[0] as string;
    const previousEnd = new Date(now - 29 * DAY_MS)
      .toISOString()
      .split("T")[0] as string;

    const metrics = [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
    ];

    const [[currentResp], [previousResp]] = await Promise.all([
      client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: currentStart, endDate: currentEnd }],
        metrics,
      }),
      client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: previousStart, endDate: previousEnd }],
        metrics,
      }),
    ]);

    const cur = currentResp.rows?.[0]?.metricValues ?? [];
    const prev = previousResp.rows?.[0]?.metricValues ?? [];

    const parse = (arr: typeof cur, i: number) =>
      parseFloat(arr[i]?.value ?? "0") || 0;

    return {
      sessions: this.buildMetric(parse(cur, 0), parse(prev, 0)),
      users: this.buildMetric(parse(cur, 1), parse(prev, 1)),
      bounceRate: this.buildMetric(parse(cur, 2), parse(prev, 2)),
      avgDuration: this.buildMetric(parse(cur, 3), parse(prev, 3)),
    };
  }

  async getPages(): Promise<GA4PageRow[]> {
    const client = this.createClient();
    const { startDate, endDate } = this.getDateRange();

    const [response] = await client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
      ],
      limit: 25,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    });

    return (response.rows ?? []).map((row) => ({
      page: row.dimensionValues?.[0]?.value ?? "",
      pageTitle: row.dimensionValues?.[1]?.value ?? "",
      sessions: parseFloat(row.metricValues?.[0]?.value ?? "0") ?? 0,
      pageViews: parseFloat(row.metricValues?.[1]?.value ?? "0") ?? 0,
      bounceRate: parseFloat(row.metricValues?.[2]?.value ?? "0") ?? 0,
    }));
  }
}
