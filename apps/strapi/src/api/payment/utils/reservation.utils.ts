import {
  AdReservation,
  AdReservationData,
  AdReservationsResponse,
} from "../types/payment.type";

class ReservationUtils {
  /**
   * Get available reservations by user ID and type (free or paid)
   * @param userId - The ID of the user
   * @param isFree - Whether to get free reservations (true) or paid reservations (false)
   * @returns Array of matching reservations or null if error occurs
   */
  public async getReservationByUser(
    userId: string,
    isFree: boolean
  ): Promise<AdReservation[] | null> {
    try {
      const price = isFree ? "0" : { $ne: "0" };

      const reservations = await strapi.entityService.findMany(
        "api::ad-reservation.ad-reservation",
        {
          filters: {
            user: { id: { $eq: userId } },
            price,
            ad: { id: { $null: true } },
          },
          populate: ["user", "ad"],
        }
      );

      return reservations;
    } catch (error) {
      console.error("Error in getReservationByUser:", error);
      return null;
    }
  }

  /**
   * Get an available ad reservation for a user by type
   * @param userId - The ID of the user
   * @param isFree - Whether to get a free reservation (true) or paid reservation (false)
   * @returns Response with success status and reservation data if found
   */
  public async getAdReservationAvailable(
    userId: string,
    isFree: boolean
  ): Promise<AdReservationsResponse> {
    try {
      const price = isFree ? "0" : { $ne: "0" };

      const adReservation = await strapi.db
        .query("api::ad-reservation.ad-reservation")
        .findOne({
          where: {
            user: { id: userId },
            price,
            ad: null,
          },
          populate: ["user", "ad"],
        });

      if (!adReservation) {
        return {
          success: false,
          message: `No ${isFree ? "free" : "paid"} ad reservation available`,
        };
      }

      return {
        success: true,
        adReservation,
      };
    } catch (error) {
      console.error("Error in getAdReservationAvailable:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Create a new ad reservation
   * @param userId - The ID of the user
   * @param price - The price of the reservation
   * @param total_days - Total number of days for the reservation
   * @param description - Optional description for the reservation
   * @param adId - Optional ID of the associated ad
   * @returns Response with success status and created reservation data
   */
  public async createAdReservation(
    userId: string,
    price: string,
    total_days: number,
    description?: string,
    adId?: number
  ): Promise<AdReservationsResponse> {
    try {
      const data: AdReservationData = {
        price,
        total_days,
        user: userId,
        publishedAt: new Date(),
      };

      if (description) {
        data.description = description;
      }

      if (adId) {
        data.ad = adId;
      }

      const adReservation = await strapi.entityService.create(
        "api::ad-reservation.ad-reservation",
        {
          data,
        }
      );

      return {
        success: true,
        adReservation,
      };
    } catch (error) {
      console.error("Error in createAdReservation:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

export default new ReservationUtils();
