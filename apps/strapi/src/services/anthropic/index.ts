import { AnthropicService } from "./anthropic.service";

let anthropicService: AnthropicService | null = null;

function getAnthropicService(): AnthropicService {
  if (!anthropicService) {
    anthropicService = new AnthropicService();
  }
  return anthropicService;
}

export const generateWithSearch = (prompt: string) =>
  getAnthropicService().generate({ prompt });

export { AnthropicService };
export type {
  IAnthropicService,
  AnthropicRequest,
  AnthropicResponse,
} from "./anthropic.types";
