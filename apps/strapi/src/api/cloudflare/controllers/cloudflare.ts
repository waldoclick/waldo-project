import { Context } from "koa";
import { CloudflareService } from "../../../services/cloudflare";

export default {
  async getData(ctx: Context) {
    try {
      const service = new CloudflareService();
      const analytics = await service.getAnalytics();
      ctx.body = analytics;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Cloudflare error: ${message}`);
    }
  },
};
