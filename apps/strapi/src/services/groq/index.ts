import { GroqService } from "./groq.service";

const groqService = new GroqService();

export const generateText = (prompt: string) =>
  groqService.generate({ prompt });

export { GroqService };
export type { IGroqService, GroqRequest, GroqResponse } from "./groq.types";
