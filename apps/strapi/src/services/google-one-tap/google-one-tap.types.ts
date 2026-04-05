import { TokenPayload } from "google-auth-library";

export interface IGoogleOneTapService {
  verifyCredential(_credential: string): Promise<TokenPayload | null>;
  findOrCreateUser(
    _payload: TokenPayload
  ): Promise<{ user: Record<string, unknown>; isNew: boolean }>;
}
