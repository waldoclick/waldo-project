import { TokenPayload } from "google-auth-library";

export interface IGoogleOneTapService {
  verifyCredential(credential: string): Promise<TokenPayload | null>;
  findOrCreateUser(
    payload: TokenPayload
  ): Promise<{ user: Record<string, unknown>; isNew: boolean }>;
}
