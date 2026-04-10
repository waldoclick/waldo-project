import { ISearchConsoleService } from "../types/search-console.types";

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
}
