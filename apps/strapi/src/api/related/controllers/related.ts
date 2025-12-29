import { Context } from "koa";
import { RelatedAdsService } from "../services/related.service";
import { QueryParams } from "../types/ad.types";

const relatedAdsService = new RelatedAdsService();

const filterController = {
  async ads(ctx: Context) {
    // Leer el id del parámetro de ruta primero, luego del query como fallback (para compatibilidad)
    const id = ctx.params.id || (ctx.query as QueryParams).id;
    const limit = (ctx.query as QueryParams).limit || 16;

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
