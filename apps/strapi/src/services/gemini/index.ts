import { GeminiService } from "./gemini.service";

const geminiService = new GeminiService();

export const generateText = (prompt: string) =>
  geminiService.generate({ prompt });

export { GeminiService };
export type {
  IGeminiService,
  GeminiRequest,
  GeminiResponse,
} from "./gemini.types";
