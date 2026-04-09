import { OneclickService } from "../../../services/oneclick";
import logger from "../../../utils/logtail";

export class ProCancellationService {
  /**
   * Cancels a PRO subscription for the given user.
   *
   * Flow:
   * 1. Fetches tbk_user from subscription-pro (canonical source after migration)
   * 2. Deletes the card inscription from Transbank (proceeds even if this fails — user intent is cancellation)
   * 3. Clears tbk_user on the subscription-pro record (card enrollment is deleted)
   * 4. Updates user: pro_status → "cancelled", tbk_user → null (dual-write until user fields removed)
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
    // 1. Fetch tbk_user from subscription-pro (not from user)
    const subPro = await strapi.db
      .query("api::subscription-pro.subscription-pro")
      .findOne({
        where: { user: { id: userId } },
        select: ["id", "tbk_user"],
      }) as { id: number; tbk_user?: string | null } | null;

    if (!subPro?.tbk_user) {
      return { success: false, error: "User has no active inscription" };
    }

    // 2. Delete from Transbank (proceed even if this fails)
    const oneclickService = new OneclickService();
    const deleteResult = await oneclickService.deleteInscription(
      subPro.tbk_user,
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

    // 3. Clear subscription-pro tbk_user (card enrollment is deleted)
    const subProUpdate = strapi.entityService.update as (
      _uid: string,
      _id: number,
      _params: { data: Record<string, unknown> }
    ) => Promise<unknown>;
    await subProUpdate("api::subscription-pro.subscription-pro", subPro.id, {
      data: { tbk_user: null },
    });

    // 4. Update user: set cancelled, clear tbk_user on user too (dual-write until user fields removed)
    await strapi.entityService.update(
      "plugin::users-permissions.user",
      userId,
      {
        data: {
          pro_status: "cancelled",
          tbk_user: null,
        } as unknown as Parameters<
          typeof strapi.entityService.update
        >[2]["data"],
      }
    );

    return { success: true };
  }
}
