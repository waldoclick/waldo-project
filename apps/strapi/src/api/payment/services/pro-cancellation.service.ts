import { OneclickService } from "../../../services/oneclick";
import logger from "../../../utils/logtail";

export class ProCancellationService {
  /**
   * Cancels a PRO subscription for the given user.
   *
   * Flow:
   * 1. Fetches the user's tbk_user (Transbank inscription token)
   * 2. Deletes the card inscription from Transbank (proceeds even if this fails — user intent is cancellation)
   * 3. Updates user: pro_status → "cancelled", tbk_user → null
   *    NOTE: pro_expires_at is intentionally NOT modified — subscription expires at period end (CANC-02)
   *
   * @param userId - Numeric Strapi user ID
   * @param userDocumentId - Strapi user documentId (used to build Oneclick username)
   * @returns { success: true } on cancellation, { success: false, error } if user has no active inscription
   */
  async cancelSubscription(
    userId: number,
    userDocumentId: string
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Fetch user's tbk_user
    const user = (await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      userId,
      {
        fields: ["tbk_user"] as unknown as Parameters<
          typeof strapi.entityService.findOne
        >[2]["fields"],
      }
    )) as { tbk_user?: string | null } | null;

    if (!user?.tbk_user) {
      return { success: false, error: "User has no active inscription" };
    }

    // 2. Delete from Transbank (proceed even if this fails)
    const oneclickService = new OneclickService();
    const deleteResult = await oneclickService.deleteInscription(
      user.tbk_user,
      userDocumentId
    );

    if (!deleteResult.success) {
      logger.warn(
        "ProCancellationService: Transbank delete failed, proceeding with cancellation",
        {
          userId,
          error: deleteResult.error,
        }
      );
    }

    // 3. Update user: set cancelled, clear tbk_user, leave pro_expires_at unchanged (CANC-02)
    await strapi.entityService.update(
      "plugin::users-permissions.user",
      userId,
      {
        data: {
          pro_status: "cancelled",
          tbk_user: null,
        } as unknown as Parameters<typeof strapi.entityService.update>[2]["data"],
      }
    );

    return { success: true };
  }
}
