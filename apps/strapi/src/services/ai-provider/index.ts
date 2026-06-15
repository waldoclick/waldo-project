import { AiProviderService } from "./ai-provider.service";

let aiProviderService: AiProviderService | null = null;

function getAiProviderService(): AiProviderService {
  if (!aiProviderService) {
    aiProviderService = new AiProviderService();
  }
  return aiProviderService;
}

export const generate = (prompt: string) =>
  getAiProviderService().generate(prompt);

export const generateArticleDraft = (prompt: string) =>
  getAiProviderService().generateArticleDraft(prompt);

export { AiProviderService };
export type {
  AiProviderName,
  IAiProviderResult,
  IAiProviderService,
} from "./ai-provider.types";
