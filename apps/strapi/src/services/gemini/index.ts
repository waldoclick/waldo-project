import { GeminiService } from "./gemini.service";

let geminiService: GeminiService | null = null;

function getGeminiService(): GeminiService {
  if (!geminiService) {
    geminiService = new GeminiService();
  }
  return geminiService;
}

export const generateText = (prompt: string) =>
  getGeminiService().generate({ prompt });

export { GeminiService };
export type {
  IGeminiService,
  GeminiRequest,
  GeminiResponse,
} from "./gemini.types";
