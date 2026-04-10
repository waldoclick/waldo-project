import { Context } from "koa";
import { SearchConsoleService } from "../../../services/search-console";

export default {
  async getData(ctx: Context) {
    try {
      const service = new SearchConsoleService();
      const [performance, topQueries, topPages] = await Promise.all([
        service.getPerformance(),
        service.getTopQueries(),
        service.getTopPages(),
      ]);
      ctx.body = { performance, topQueries, topPages };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Search Console error: ${message}`);
    }
  },
};
