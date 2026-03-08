import { JWT } from "google-auth-library";

export interface IGoogleConfig {
  getCredentialsPath(): string;
  getScopes(): string[];
}

export interface IGoogleAuthService {
  authenticate(): Promise<JWT>;
}

export interface IGoogleSheetsService {
  appendToSheet(data: unknown[]): Promise<void>;
}

export interface IGoogleRecaptchaService {
  verifyToken(token: string): Promise<boolean>;
}
