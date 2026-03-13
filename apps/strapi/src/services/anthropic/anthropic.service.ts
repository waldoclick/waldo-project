import Anthropic from "@anthropic-ai/sdk";
import type {
  IAnthropicService,
  AnthropicRequest,
  AnthropicResponse,
} from "./anthropic.types";

export class AnthropicService implements IAnthropicService {
  private readonly client: Anthropic;
  private readonly modelName = "claude-sonnet-4-5";

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is required");
    }
    this.client = new Anthropic({ apiKey });
  }

  async generate(request: AnthropicRequest): Promise<AnthropicResponse> {
    const response = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 4096,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: request.prompt }],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text"
    );
    const text = textBlock?.text ?? "";
    return { text };
  }
}
