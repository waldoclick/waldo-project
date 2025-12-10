import { PackResponse } from "../types/payment.type";

class PackUtils {
  /**
   * Get ad pack by ID
   * @param id - The ID of the ad pack to retrieve
   * @returns Response with success status and pack data if found
   */
  public async getAdPack(id: number): Promise<PackResponse> {
    try {
      const adPack = await strapi.db.query("api::ad-pack.ad-pack").findOne({
        where: { id },
      });

      if (!adPack) {
        return {
          success: false,
          message: "Pack does not exist",
        };
      }

      return {
        success: true,
        data: adPack,
      };
    } catch (error) {
      console.error("Error in getAdPack:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

export default new PackUtils();
