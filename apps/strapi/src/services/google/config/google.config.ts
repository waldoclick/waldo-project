import { join } from "path";
import { IGoogleConfig } from "../types/google.types";

export class GoogleConfig implements IGoogleConfig {
  protected readonly CREDENTIALS_PATH = join(process.cwd(), "credentials.json");
  protected readonly SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

  getCredentialsPath(): string {
    return this.CREDENTIALS_PATH;
  }

  getScopes(): string[] {
    return this.SCOPES;
  }
}
