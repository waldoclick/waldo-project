/**
 * Cloudflare Controller
 *
 * Handles GET /api/cloudflare requests.
 * Returns stub response; actual API calls will be implemented in a future task.
 */

import { Context } from "koa";
import { CloudflareService } from "../../../services/cloudflare";

export default {
  async getData(ctx: Context) {
    try {
      new CloudflareService();
      ctx.body = { ok: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Cloudflare error: ${message}`);
    }
  },
};
