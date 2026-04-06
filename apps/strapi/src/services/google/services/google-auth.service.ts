import { google } from "googleapis";
import { readFileSync } from "fs";
import { IGoogleAuthService } from "../types/google.types";
import { GoogleConfig } from "../config/google.config";
import { JWT } from "google-auth-library";

export class GoogleAuthService implements IGoogleAuthService {
  constructor(private readonly _config: GoogleConfig) {}

  async authenticate(): Promise<JWT> {
    console.log(
      "Authenticating with Google Sheets...",
      this._config.getCredentialsPath()
    );
    const credentials = JSON.parse(
      readFileSync(this._config.getCredentialsPath(), "utf8")
    );
    const { client_email, private_key } = credentials;

    if (!private_key) {
      throw new Error("Private key is missing in credentials.json");
    }

    const auth = new google.auth.JWT(
      client_email,
      null,
      private_key.replace(/\\n/g, "\n"),
      this._config.getScopes()
    );
    await auth.authorize();
    return auth;
  }
}
