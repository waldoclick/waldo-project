import { google, Auth } from "googleapis";
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

  async getPerformance(): Promise<SearchConsolePerformanceRow[]> {
    const auth = new Auth.GoogleAuth({
      keyFile: this.credentialsPath,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
    const client = google.searchconsole({ version: "v1", auth });

    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const endDate = new Date().toISOString().split("T")[0];

    const res = await client.searchanalytics.query({
      siteUrl: this.siteUrl,
      requestBody: { startDate, endDate, dimensions: ["date"] },
    });

    const rows = res.data.rows ?? [];
    return rows.map((row) => ({
      date: (row.keys ?? [])[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));
  }

  async getTopQueries(): Promise<SearchConsoleRow[]> {
    const auth = new Auth.GoogleAuth({
      keyFile: this.credentialsPath,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
    const client = google.searchconsole({ version: "v1", auth });

    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const endDate = new Date().toISOString().split("T")[0];

    const res = await client.searchanalytics.query({
      siteUrl: this.siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: 10,
      },
    });

    const rows = res.data.rows ?? [];
    return rows.map((row) => ({
      keys: row.keys ?? [],
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));
  }

  async getTopPages(): Promise<SearchConsoleRow[]> {
    const auth = new Auth.GoogleAuth({
      keyFile: this.credentialsPath,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
    const client = google.searchconsole({ version: "v1", auth });

    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const endDate = new Date().toISOString().split("T")[0];

    const res = await client.searchanalytics.query({
      siteUrl: this.siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit: 10,
      },
    });

    const rows = res.data.rows ?? [];
    return rows.map((row) => ({
      keys: row.keys ?? [],
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));
  }
}
