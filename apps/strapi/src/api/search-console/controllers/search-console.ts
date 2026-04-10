/**
 * Search Console Controller
 *
 * Handles GET /api/search-console requests.
 * Returns stub response; actual API calls will be implemented in a future task.
 */

import { Context } from "koa";
import { SearchConsoleService } from "../../../services/search-console";

export default {
  async getData(ctx: Context) {
    try {
      new SearchConsoleService();
      ctx.body = { ok: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Search Console error: ${message}`);
    }
  },
};
