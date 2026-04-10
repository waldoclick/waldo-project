import { Context } from "koa";
import { CloudflareService } from "../../../services/cloudflare";

export default {
  async getTraffic(ctx: Context) {
    try {
      const service = new CloudflareService();
      ctx.body = await service.getTraffic();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Cloudflare error: ${message}`);
    }
  },

  async getRequests(ctx: Context) {
    try {
      const service = new CloudflareService();
      ctx.body = await service.getRequests();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Cloudflare error: ${message}`);
    }
  },

  async getThreats(ctx: Context) {
    try {
      const service = new CloudflareService();
      ctx.body = await service.getThreats();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Cloudflare error: ${message}`);
    }
  },
};
