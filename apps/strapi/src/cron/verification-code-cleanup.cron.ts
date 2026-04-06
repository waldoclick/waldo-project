export interface ICronjobResult {
  success: boolean;
  results?: string;
  error?: string;
}

export class VerificationCodeCleanupService {
  async cleanExpiredCodes(): Promise<ICronjobResult> {
    try {
      if (typeof strapi === "undefined")
        throw new Error("strapi is not defined");

      const now = new Date().toISOString();
      const deleted = await strapi.db
        .query("api::verification-code.verification-code")
        .deleteMany({ where: { expiresAt: { $lt: now } } });

      const count = deleted?.count ?? 0;
      strapi.log.info(
        `[verification-code-cleanup] Deleted ${count} expired verification codes.`
      );

      return {
        success: true,
        results: `Deleted ${count} expired verification codes`,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
