import { google, Auth } from "googleapis";
import type { searchconsole_v1 } from "googleapis";
import {
  ISearchConsoleService,
  SearchConsolePerformanceRow,
  SearchConsoleRow,
} from "../types/search-console.types";

export class SearchConsoleService implements ISearchConsoleService {
  private credentialsPath: string;
  private siteUrl: string;

  constructor() {
    this.credentialsPath =
      process.env.GOOGLE_SC_CREDENTIALS_PATH || "./google.json";
    this.siteUrl = process.env.GOOGLE_SC_SITE_URL || "";

    if (!this.siteUrl) {
      throw new Error("GOOGLE_SC_SITE_URL is required");
    }
  }

  private createClient(): searchconsole_v1.Searchconsole {
    const auth = new Auth.GoogleAuth({
      keyFile: this.credentialsPath,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
    return google.searchconsole({ version: "v1", auth });
  }

  private getDateRange(): { startDate: string; endDate: string } {
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0] as string;
    const endDate = new Date().toISOString().split("T")[0] as string;
    return { startDate, endDate };
  }

  async getPerformance(): Promise<SearchConsolePerformanceRow[]> {
    const client = this.createClient();
    const { startDate, endDate } = this.getDateRange();

    const res = await client.searchanalytics.query({
      siteUrl: this.siteUrl,
      requestBody: { startDate, endDate, dimensions: ["date"] },
    });

    return (res.data.rows ?? []).map((row) => ({
      date: (row.keys ?? [])[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));
  }

  async getQueries(): Promise<SearchConsoleRow[]> {
    const client = this.createClient();
    const { startDate, endDate } = this.getDateRange();

    const res = await client.searchanalytics.query({
      siteUrl: this.siteUrl,
      requestBody: { startDate, endDate, dimensions: ["query"] },
    });

    return (res.data.rows ?? []).map((row) => ({
      keys: row.keys ?? [],
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));
  }

  async getPages(): Promise<SearchConsoleRow[]> {
    const client = this.createClient();
    const { startDate, endDate } = this.getDateRange();

    const res = await client.searchanalytics.query({
      siteUrl: this.siteUrl,
      requestBody: { startDate, endDate, dimensions: ["page"] },
    });

    return (res.data.rows ?? []).map((row) => ({
      keys: row.keys ?? [],
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));
  }
}
