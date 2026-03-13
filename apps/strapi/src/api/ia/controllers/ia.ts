import { Context } from "koa";
import { errors } from "@strapi/utils";
import { generateText as generateWithGemini } from "../../../services/gemini";
import { generateWithSearch } from "../../../services/anthropic";
import { generateText as generateWithDeepSeek } from "../../../services/deepseek";
import { generateText as generateWithGroq } from "../../../services/groq";

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
      const result = await generateWithGemini(prompt);
      ctx.body = { text: result.text };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.error(`[ia/gemini] Gemini API error: ${message}`);
      throw new ApplicationError(`Gemini API error: ${message}`);
    }
  },

  async groq(ctx: Context): Promise<void> {
    const body = ctx.request.body as { prompt?: string };
    const prompt = body?.prompt?.trim();

    if (!prompt) {
      ctx.badRequest("Missing required field: prompt");
      return;
    }

    try {
      const result = await generateWithGroq(prompt);
      ctx.body = { text: result.text };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.error(`[ia/groq] Groq API error: ${message}`);
      throw new ApplicationError(`Groq API error: ${message}`);
    }
  },

  async deepseek(ctx: Context): Promise<void> {
    const body = ctx.request.body as { prompt?: string };
    const prompt = body?.prompt?.trim();

    if (!prompt) {
      ctx.badRequest("Missing required field: prompt");
      return;
    }

    try {
      const result = await generateWithDeepSeek(prompt);
      ctx.body = { text: result.text };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.error(`[ia/deepseek] DeepSeek API error: ${message}`);
      throw new ApplicationError(`DeepSeek API error: ${message}`);
    }
  },

  async claude(ctx: Context): Promise<void> {
    const body = ctx.request.body as { prompt?: string };
    const prompt = body?.prompt?.trim();

    if (!prompt) {
      ctx.badRequest("Missing required field: prompt");
      return;
    }

    try {
      const result = await generateWithSearch(prompt);
      ctx.body = { text: result.text };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.error(`[ia/claude] Anthropic API error: ${message}`);
      throw new ApplicationError(`Anthropic API error: ${message}`);
    }
  },
};
