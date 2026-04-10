import { BetaAnalyticsDataClient } from "@google-analytics/data";
import {
  IGoogleAnalyticsService,
  GA4StatsRow,
  GA4PageRow,
} from "../types/google-analytics.types";

export class GoogleAnalyticsService implements IGoogleAnalyticsService {
  private credentialsPath: string;
  private propertyId: string;

  constructor() {
    this.credentialsPath =
      process.env.GOOGLE_SC_CREDENTIALS_PATH || "./google.json";
    this.propertyId = process.env.GA4_PROPERTY_ID || "";

    if (!this.propertyId) {
      throw new Error("GA4_PROPERTY_ID is required");
    }
  }

  private createClient(): BetaAnalyticsDataClient {
    return new BetaAnalyticsDataClient({ keyFilename: this.credentialsPath });
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
