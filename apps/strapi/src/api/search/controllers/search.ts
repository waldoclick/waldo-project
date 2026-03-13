import { Context } from "koa";
import { errors } from "@strapi/utils";
import { searchNews } from "../../../services/tavily";

const { ApplicationError } = errors;

export default {
  async tavily(ctx: Context): Promise<void> {
    const body = ctx.request.body as { query?: string; num?: number };
    const query = body?.query?.trim();

    if (!query) {
      ctx.badRequest("Missing required field: query");
      return;
    }

    try {
      const result = await searchNews(query, body.num);
      ctx.body = result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.error(`[search/tavily] Tavily API error: ${message}`);
      throw new ApplicationError(`Tavily API error: ${message}`);
    }
  },
};
