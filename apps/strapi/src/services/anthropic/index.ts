import { AnthropicService } from "./anthropic.service";

const anthropicService = new AnthropicService();

export const generateWithSearch = (prompt: string) =>
  anthropicService.generate({ prompt });

export { AnthropicService };
export type {
  IAnthropicService,
  AnthropicRequest,
  AnthropicResponse,
} from "./anthropic.types";
