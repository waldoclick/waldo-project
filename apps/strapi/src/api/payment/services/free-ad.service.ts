import PaymentUtils from "../utils";
import { sendMjmlEmail } from "../../../services/mjml";
import logger from "../../../utils/logtail";

class FreeAdService {
  async processFreeAd(
    adId: number,
    userId: string
  ): Promise<{ success: boolean; ad?: unknown; message?: string }> {
    try {
      // 1. Load the ad
      const result = await PaymentUtils.ad.getAdById(adId);
      if (!result.success || !result.ad) {
        return { success: false, message: "Ad not found" };
      }

      // 2. Validate free credit
      const creditResult =
        await PaymentUtils.adReservation.getAdReservationAvailable(
          userId,
          true
        );
      if (!creditResult.success || !creditResult.adReservation) {
        return { success: false, message: "No free reservation available" };
      }

      // 3. Link reservation
      await PaymentUtils.ad.updateAdReservation(
        adId,
        creditResult.adReservation.id
      );

      // 4. Publish the ad
      await PaymentUtils.ad.publishAd(adId);

      // 5. Send emails (failure must NOT fail the overall request)
      try {
        await sendMjmlEmail(
          strapi,
          "ad-creation-user",
          result.ad.user.email,
          "Tu anuncio ha sido creado",
          {
            name: `${result.ad.user.firstname} ${result.ad.user.lastname}`,
            adUrl: `${process.env.FRONTEND_URL}/anuncios/${result.ad.slug}`,
          }
        );

        const adminEmailsRaw =
          process.env.ADMIN_EMAILS || "waldo.development@gmail.com";
        const emailArray = adminEmailsRaw
          .split(",")
          .map((email: string) => email.trim());

        await sendMjmlEmail(
          strapi,
          "ad-creation-admin",
          emailArray,
          "Nuevo anuncio creado para validar",
          {
            name: `${result.ad.user.firstname} ${result.ad.user.lastname}`,
            email: result.ad.user.email,
            slug: result.ad.slug,
            adUrl: `${process.env.DASHBOARD_URL}/dashboard/ads/${result.ad.id}`,
          }
        );
      } catch (error) {
        logger.error("Error sending free ad creation emails:", { error });
      }

      // 6. Return success
      return {
        success: true,
        ad: result.ad,
        message: "Free ad created successfully",
      };
    } catch (error) {
      const e = error as { message?: string };
      return { success: false, message: e.message };
    }
  }
}

export default new FreeAdService();
