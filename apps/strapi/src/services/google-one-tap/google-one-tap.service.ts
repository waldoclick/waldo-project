import { OAuth2Client, TokenPayload } from "google-auth-library";
import { IGoogleOneTapService } from "./google-one-tap.types";

export class GoogleOneTapService implements IGoogleOneTapService {
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID ?? "";
    if (!this.clientId) {
      // Warn only — throwing here kills Strapi startup (pitfall 3 in research)
      console.warn(
        "[GoogleOneTapService] GOOGLE_CLIENT_ID is not set — endpoint will return 401 for all requests"
      );
    }
    this.client = new OAuth2Client(this.clientId);
  }

  async verifyCredential(credential: string): Promise<TokenPayload | null> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: this.clientId,
      });
      return ticket.getPayload() ?? null;
    } catch {
      return null; // Invalid, expired, or malformed credential — caller maps to 401
    }
  }

  async findOrCreateUser(
    payload: TokenPayload
  ): Promise<{ user: Record<string, unknown>; isNew: boolean }> {
    const { sub, email, given_name, family_name } = payload;
    const normalizedEmail = (email ?? "").toLowerCase();

    // Step 1: Lookup by google_sub — the stable Google identifier
    // Google prohibits email as primary key (sub is immutable, email can change)
    const byGoogleSub = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { google_sub: sub } });

    if (byGoogleSub) return { user: byGoogleSub, isNew: false };

    // Step 2: Email fallback — link existing local account with same email
    // Handles: user registered with email+password, now uses One Tap with same address
    const byEmail = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { email: normalizedEmail } });

    if (byEmail) {
      const updated = await strapi.db
        .query("plugin::users-permissions.user")
        .update({
          where: { id: (byEmail as { id: number }).id },
          data: { google_sub: sub },
        });
      return { user: updated, isNew: false };
    }

    // Step 3: Create new user
    // provider:'google' is critical — prevents duplicate accounts in providers.js OAuth flow
    const defaultRole = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "authenticated" } });

    const newUser = await strapi.db
      .query("plugin::users-permissions.user")
      .create({
        data: {
          google_sub: sub,
          email: normalizedEmail,
          username: normalizedEmail.split("@")[0],
          firstname: given_name ?? "",
          lastname: family_name ?? "",
          rut: "N/A", // Placeholder — rut:required in schema; profile completion deferred to Phase 098
          provider: "google",
          confirmed: true, // Google has verified the email
          blocked: false,
          role: (defaultRole as { id: number } | null)?.id,
        },
      });

    return { user: newUser, isNew: true };
  }
}
