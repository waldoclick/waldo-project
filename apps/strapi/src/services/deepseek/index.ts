import { DeepSeekService } from "./deepseek.service";

let deepSeekService: DeepSeekService | null = null;

function getDeepSeekService(): DeepSeekService {
  if (!deepSeekService) {
    deepSeekService = new DeepSeekService();
  }
  return deepSeekService;
}

export const generateText = (prompt: string) =>
  getDeepSeekService().generate({ prompt });

export { DeepSeekService };
export type {
  IDeepSeekService,
  DeepSeekRequest,
  DeepSeekResponse,
} from "./deepseek.types";
