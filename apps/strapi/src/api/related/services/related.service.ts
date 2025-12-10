import { Ad } from "../types/ad.types";

export class RelatedAdsService {
  private readonly MAX_LIMIT = 8;

  async findRelatedAds(id: string, limit: string | number = 8): Promise<Ad[]> {
    const normalizedLimit = this.normalizeLimit(limit);

    const ad = await this.findAdById(id);
    if (!ad) {
      throw new Error("Ad not found");
    }

    const relatedAds = await this.findAdsByCategory(ad, normalizedLimit);

    if (relatedAds.length < normalizedLimit) {
      const additionalAds = await this.findAdditionalAds(
        id,
        normalizedLimit - relatedAds.length
      );
      return [...relatedAds, ...additionalAds];
    }

    return relatedAds;
  }

  private normalizeLimit(limit: string | number): number {
    return Math.min(
      Math.max(1, Number(limit) || this.MAX_LIMIT),
      this.MAX_LIMIT
    );
  }

  private async findAdById(id: string): Promise<Ad | null> {
    const adService = strapi.db.query("api::ad.ad");
    return (await adService.findOne({
      where: { id: id },
    })) as Ad | null;
  }

  private async findAdsByCategory(ad: Ad, limit: number): Promise<Ad[]> {
    return (await strapi.documents("api::ad.ad").findMany({
      filters: {
        category: ad.category ? { id: ad.category.id } : null,
        id: { $ne: ad.id },
        active: { $eq: true },
        remaining_days: { $gt: 0 },
      },
      populate: "*",
      limit,
    })) as Ad[];
  }

  private async findAdditionalAds(
    excludeId: string,
    limit: number
  ): Promise<Ad[]> {
    return (await strapi.documents("api::ad.ad").findMany({
      filters: {
        id: { $ne: excludeId },
        active: { $eq: true },
        remaining_days: { $gt: 0 },
      },
      populate: "*",
      limit,
    })) as Ad[];
  }
}
