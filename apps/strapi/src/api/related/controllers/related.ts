import { Context } from "koa";
import { RelatedAdsService } from "../services/related.service";
import { QueryParams } from "../types/ad.types";

const relatedAdsService = new RelatedAdsService();

const filterController = {
  async ads(ctx: Context) {
    const { id, limit = 16 } = ctx.query as QueryParams;

    if (!id) {
      ctx.throw(404, "Ad ID is missing");
      return;
    }

    try {
      const relatedAds = await relatedAdsService.findRelatedAds(id, limit);
      ctx.body = {
        data: relatedAds,
      };
    } catch (error) {
      if (error.message === "Ad not found") {
        ctx.throw(404, "Ad not found");
      } else {
        ctx.throw(500, "Internal server error");
      }
    }
  },
};

export default filterController;
