import { Context } from "koa";
import { errors } from "@strapi/utils";
import { generateText } from "../../../services/gemini";

const { ApplicationError } = errors;

export default {
  async gemini(ctx: Context): Promise<void> {
    const body = ctx.request.body as { prompt?: string };
    const prompt = body?.prompt?.trim();

    if (!prompt) {
      ctx.badRequest("Missing required field: prompt");
      return;
    }

    try {
      const result = await generateText(prompt);
      ctx.body = { text: result.text };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.error(`[ia/gemini] Gemini API error: ${message}`);
      throw new ApplicationError(`Gemini API error: ${message}`);
    }
  },
};
