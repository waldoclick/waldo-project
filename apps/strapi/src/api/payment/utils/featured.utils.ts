import {
  AdFeaturedReservationData,
  ReservationResponse,
} from "../types/payment.type";

class FeaturedUtils {
  /**
   * Get an available ad featured reservation for a user
   * @param userId - The user ID to check reservations for
   * @param isFree - Whether to look for free (price=0) reservations
   * @returns Response object with success status and reservation if found
   */
  public async getAdFeaturedReservationAvailable(
    userId: string,
    isFree: boolean
  ): Promise<ReservationResponse> {
    try {
      const price = isFree ? "0" : { $ne: "0" };

      const adFeaturedReservation = await strapi.db
        .query("api::ad-featured-reservation.ad-featured-reservation")
        .findOne({
          where: {
            user: { id: userId },
            price,
            ad: null,
          },
          populate: ["user", "ad"],
        });

      if (!adFeaturedReservation) {
        return {
          success: false,
          message: `No ${
            isFree ? "free" : "paid"
          } ad featured reservation available`,
        };
      }

      return {
        success: true,
        availableAdFeaturedReservation: adFeaturedReservation,
      };
    } catch (error) {
      console.error("Error in getAdFeaturedReservationAvailable:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Create a new ad featured reservation
   * @param userId - The user ID to associate with the reservation
   * @param price - The price of the reservation
   * @param description - Optional description for the reservation
   * @param adId - Optional ad ID to associate with the reservation
   * @returns Response object with success status and created reservation
   */
  public async createAdFeaturedReservation(
    userId: string,
    price: string,
    description?: string,
    adId?: number
  ): Promise<ReservationResponse> {
    try {
      const data: AdFeaturedReservationData = {
        price,
        user: userId,
        publishedAt: new Date(),
      };

      if (description) {
        data.description = description;
      }

      if (adId) {
        data.ad = adId;
      }

      const adFeaturedReservation = await strapi.entityService.create(
        "api::ad-featured-reservation.ad-featured-reservation",
        {
          data,
        }
      );

      return {
        success: true,
        adFeaturedReservation,
      };
    } catch (error) {
      console.error("Error in createAdFeaturedReservation:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

export default new FeaturedUtils();
