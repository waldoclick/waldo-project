import { Context } from "koa";
import { GoogleAnalyticsService } from "../../../services/google-analytics";

export default {
  async getStats(ctx: Context) {
    try {
      const service = new GoogleAnalyticsService();
      ctx.body = await service.getStats();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Google Analytics error: ${message}`);
    }
  },

  async getPages(ctx: Context) {
    try {
      const service = new GoogleAnalyticsService();
      ctx.body = await service.getPages();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Google Analytics error: ${message}`);
    }
  },
};
