import { Context } from "koa";
import { BetterStackService } from "../../../services/better-stack";

export default {
  async getMonitors(ctx: Context) {
    try {
      const service = new BetterStackService();
      ctx.body = await service.getMonitors();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Better Stack error: ${message}`);
    }
  },

  async getIncidents(ctx: Context) {
    try {
      const service = new BetterStackService();
      ctx.body = await service.getIncidents();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Better Stack error: ${message}`);
    }
  },
};
