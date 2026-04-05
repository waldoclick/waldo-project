import { JWT } from "google-auth-library";

export interface IGoogleConfig {
  getCredentialsPath(): string;
  getScopes(): string[];
}

export interface IGoogleAuthService {
  authenticate(): Promise<JWT>;
}

export interface IGoogleSheetsService {
  appendToSheet(_data: unknown[]): Promise<void>;
}

export interface IGoogleRecaptchaService {
  verifyToken(_token: string): Promise<boolean>;
}
