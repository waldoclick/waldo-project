import { Context } from "koa";
import { SearchConsoleService } from "../../../services/search-console";

export default {
  async getPerformance(ctx: Context) {
    try {
      const service = new SearchConsoleService();
      ctx.body = await service.getPerformance();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Search Console error: ${message}`);
    }
  },

  async getQueries(ctx: Context) {
    try {
      const service = new SearchConsoleService();
      ctx.body = await service.getQueries();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Search Console error: ${message}`);
    }
  },

  async getPages(ctx: Context) {
    try {
      const service = new SearchConsoleService();
      ctx.body = await service.getPages();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Search Console error: ${message}`);
    }
  },
};
