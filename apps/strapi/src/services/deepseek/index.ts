import { DeepSeekService } from "./deepseek.service";

const deepSeekService = new DeepSeekService();

export const generateText = (prompt: string) =>
  deepSeekService.generate({ prompt });

export { DeepSeekService };
export type {
  IDeepSeekService,
  DeepSeekRequest,
  DeepSeekResponse,
} from "./deepseek.types";
