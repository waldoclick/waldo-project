import { GroqService } from "./groq.service";

let groqService: GroqService | null = null;

function getGroqService(): GroqService {
  if (!groqService) {
    groqService = new GroqService();
  }
  return groqService;
}

export const generateText = (prompt: string) =>
  getGroqService().generate({ prompt });

export { GroqService };
export type { IGroqService, GroqRequest, GroqResponse } from "./groq.types";
