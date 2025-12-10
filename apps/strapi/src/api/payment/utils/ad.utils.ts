import { AdData } from "../types/payment.type";

class AdUtils {
  /**
   * Generates a URL-friendly slug from a given string
   */
  private generateSlug(text: string): string {
    const timestamp = Date.now();
    const textWithTimestamp = `${text}-${timestamp}`;

    return textWithTimestamp
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  /**
   * Creates a new ad with the provided data
   * @param userId - The ID of the user creating the ad
   * @param adData - The ad data including details
   * @returns The created ad
   */
  public async createdAd(
    userId: string,
    adData: Partial<AdData> & { details?: any; slug?: string; user?: any }
  ) {
    try {
      const adService = strapi.service("api::ad.ad");

      // Generate slug
      const slug = this.generateSlug(adData.name || "");
      adData.slug = slug;
      adData.user = userId;

      const newAd = await adService.create({
        data: {
          ...adData,
          duration_days: 15,
          remaining_days: 15,
        },
      });

      return newAd;
    } catch (error) {
      console.log(error);
      throw new Error(`Error creating Ad: ${error.message}`);
    }
  }

  /**
   * Updates an existing ad
   * @param userId - The ID of the user
   * @param adId - The ID of the ad to update
   * @param adData - The ad data to update
   * @returns The updated ad
   */
  public async updateAd(
    userId: string,
    adId: number,
    adData: Partial<AdData> & { details?: any }
  ) {
    try {
      const updatedAd = await strapi.entityService.update("api::ad.ad", adId, {
        data: {
          ...adData,
          currency: adData.currency as "CLP" | "USD",
        },
      });
      return updatedAd;
    } catch (error) {
      console.log(error);
      throw new Error(`Error updating Ad: ${error.message}`);
    }
  }

  /**
   * Get ad by ID with all relations populated
   * @param id - The ad ID
   * @returns Object with success status and ad data
   */
  public async getAdById(id: number) {
    try {
      const adService = strapi.db.query("api::ad.ad");

      // Define essential relations to populate
      const populate = {
        user: true,
        gallery: true,
        commune: true,
        condition: true,
        type: true,
        category: true,
        details: true,
      };

      const ad = await adService.findOne({
        where: { id },
        populate,
      });

      return { success: true, ad };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update ad reservation
   * @param adId - The ad ID
   * @param adReservationId - The reservation ID to associate
   * @returns Object with success status and updated ad
   */
  public async updateAdReservation(
    adId: number,
    adReservationId: string | number
  ) {
    try {
      const ad = await strapi.entityService.update("api::ad.ad", adId, {
        data: {
          ad_reservation: adReservationId,
        },
      });

      return { success: true, ad };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update ad featured reservation
   * @param adId - The ad ID
   * @param adFeaturedReservationId - The featured reservation ID to associate
   * @returns Object with success status and updated ad
   */
  public async updateAdFeaturedReservation(
    adId: number,
    adFeaturedReservationId: number
  ) {
    try {
      const ad = await strapi.entityService.update("api::ad.ad", adId, {
        data: {
          ad_featured_reservation: adFeaturedReservationId,
        },
      });

      return { success: true, ad };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update ad dates based on reservation
   * @param adId - The ad ID
   * @param total_days - The number of days for duration and remaining
   * @returns Object with success status and updated ad
   */
  public async updateAdDates(adId: number, total_days: number) {
    try {
      const ad = await strapi.entityService.update("api::ad.ad", adId, {
        data: {
          duration_days: total_days,
          remaining_days: total_days,
        },
      });

      return { success: true, ad };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }
}

export default new AdUtils();
